"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/imageCompress';

interface Product {
  id: number;
  title: string;
  price: number;
  old_price?: number;
  discount?: number;
  category: string;
  image_url: string;
  webp_url?: string;
  description?: string;
  stock?: number;
  sold?: number;
  rating?: number;
  is_active?: boolean;
  status?: string;
  upload_type?: string;
  seller_phone?: string;
  is_premium?: boolean;
}

const categories = [
  { value: 'offer-zone', label: '🎯 অফার জোন' },
  { value: 'mobile', label: '📱 মোবাইল' },
  { value: 'computer', label: '💻 কম্পিউটার' },
  { value: 'electronics', label: '⚡ ইলেকট্রনিক্স' },
  { value: 'fashion', label: '👗 ফ্যাশন' },
  { value: 'car', label: '🚗 গাড়ি' },
  { value: 'job', label: '💼 চাকরি' },
  { value: 'service', label: '🔧 সার্ভিস' },
  { value: 'property', label: '🏠 জমি প্রপার্টি' },
  { value: 'info', label: '📢 তথ্য' },
  { value: 'matrimony', label: '💑 পাত্রপাত্রী' },
  { value: 'rent', label: '🔑 ভাড়া রেন্ট' },
  { value: 'emergency', label: '🚑 জরুরি সেবা' },
  { value: 'animal', label: '🐄 পশু' },
  { value: 'food', label: '🍪 খাদ্য পণ্য' },
  { value: 'daily-needs', label: '🛒 নিত্যপ্রয়োজনীয়' },
  { value: 'gifts', label: '🎁 উপহার' },
  { value: 'handicraft', label: '🔪 হস্তশিল্প' },
];

export default function ProductAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, premium: 0 });

  const emptyForm = {
    title: '', price: '', old_price: '', discount: '', category: 'offer-zone',
    description: '', image_url: '', webp_url: '', stock: '', rating: '', seller_phone: '',
  };
  const [form, setForm] = useState({...emptyForm});

  useEffect(() => { loadProducts(); }, [filterCategory, filterStatus]);

  async function loadProducts() {
    setLoading(true);
    let query = supabase.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(100);
    if (filterCategory !== 'all') query = query.eq('category', filterCategory);
    if (filterStatus === 'pending') query = query.eq('status', 'pending');
    if (filterStatus === 'approved') query = query.eq('status', 'approved');
    if (filterStatus === 'premium') query = query.eq('is_premium', true);
    if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);
    const { data } = await query;
    if (data) setProducts(data);
    const { data: all } = await supabase.from('products').select('status, is_premium');
    if (all) setStats({ total: all.length, pending: all.filter(p => p.status === 'pending').length, premium: all.filter(p => p.is_premium).length });
    setLoading(false);
  }

  async function updateStatus(id: number, status: string) {
    await supabase.from('products').update({ status }).eq('id', id);
    loadProducts();
  }

  async function handleReplaceImage(id: number, file: File) {
    const compressed = await compressImage(file, 30);
    const fileName = `product_${id}_${Date.now()}.webp`;
    const { data } = await supabase.storage.from('banners').upload(fileName, compressed, { contentType: 'image/webp', upsert: true });
    if (data) {
      const url = `https://zypshsruibnbefixknxm.supabase.co/storage/v1/object/public/banners/${fileName}`;
      await supabase.from('products').update({ image_url: url, webp_url: url }).eq('id', id);
      loadProducts();
      alert('✅ ইমেজ রিপ্লেস হয়েছে!');
    }
  }

  async function handleImageUpload(file: File) {
    const compressed = await compressImage(file, 30);
    const fileName = `product_${Date.now()}.webp`;
    const { data } = await supabase.storage.from('banners').upload(fileName, compressed, { contentType: 'image/webp', upsert: true });
    if (data) {
      const url = `https://zypshsruibnbefixknxm.supabase.co/storage/v1/object/public/banners/${fileName}`;
      setForm(prev => ({ ...prev, image_url: url, webp_url: url }));
    }
  }

  async function saveProduct() {
    if (!form.title || !form.price) return alert('টাইটেল ও প্রাইস দাও!');
    const data: any = {
      title: form.title, price: parseFloat(form.price),
      old_price: form.old_price ? parseFloat(form.old_price) : null,
      discount: form.discount ? parseInt(form.discount) : 0,
      category: form.category, description: form.description,
      image_url: form.image_url, webp_url: form.webp_url,
      stock: form.stock ? parseInt(form.stock) : 0,
      rating: form.rating ? parseFloat(form.rating) : 0,
      seller_phone: form.seller_phone,
    };
    if (editingId) {
      await supabase.from('products').update(data).eq('id', editingId);
      alert('✅ প্রোডাক্ট আপডেট হয়েছে!');
    } else {
      await supabase.from('products').insert({...data, sold: 0, is_active: true, status: 'approved'});
      alert('✅ নতুন প্রোডাক্ট যোগ হয়েছে!');
    }
    setForm({...emptyForm}); setShowForm(false); setEditingId(null); loadProducts();
  }

  async function deleteProduct(id: number) {
    if (!confirm('ডিলিট করবেন?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadProducts();
  }

  function editProduct(p: Product) {
    setForm({
      title: p.title, price: String(p.price), old_price: p.old_price ? String(p.old_price) : '',
      discount: p.discount ? String(p.discount) : '', category: p.category,
      description: p.description || '', image_url: p.image_url || '', webp_url: p.webp_url || '',
      stock: p.stock ? String(p.stock) : '', rating: p.rating ? String(p.rating) : '',
      seller_phone: p.seller_phone || '',
    });
    setEditingId(p.id); setShowForm(true);
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* হেডার */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)', padding: '20px 24px',
        borderRadius: '16px', color: 'white', marginBottom: '20px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, fontWeight: '800' }}>📦 প্রোডাক্ট ম্যানেজমেন্ট</h1>
          <p style={{ fontSize: '12px', margin: '4px 0 0', opacity: 0.8 }}>
            {stats.total}টি • {stats.pending}টি পেন্ডিং • {stats.premium}টি প্রিমিয়াম
          </p>
        </div>
        <button onClick={() => { setForm({...emptyForm}); setEditingId(null); setShowForm(!showForm); }} style={{
          background: 'linear-gradient(135deg, #FFB347, #e62e04)', color: 'white',
          border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer',
          fontWeight: 'bold', fontSize: '14px',
        }}>➕ {showForm ? 'ফর্ম বন্ধ' : 'নতুন প্রোডাক্ট'}</button>
      </div>

      {/* ফিল্টার বার */}
      <div style={{ background: 'white', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', border: '1px solid #e8eaed' }}>
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadProducts()} placeholder="🔍 সার্চ..." style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', minWidth: '150px' }} />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={sel}>
          <option value="all">📂 সব</option>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={sel}>
          <option value="all">📋 সব</option>
          <option value="pending">⏳ পেন্ডিং</option>
          <option value="approved">✅ অ্যাপ্রুভড</option>
          <option value="premium">👑 প্রিমিয়াম</option>
        </select>
      </div>

      {/* 📝 এডিট/নতুন ফর্ম */}
      {showForm && (
        <div style={{ background: 'white', padding: '24px', borderRadius: '14px', marginBottom: '20px', border: '1px solid #e8eaed', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
            {editingId ? '✏️ প্রোডাক্ট এডিট' : '➕ নতুন প্রোডাক্ট'}
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div><label style={lbl}>📝 টাইটেল *</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inp} /></div>
              <div><label style={lbl}>💰 প্রাইস *</label><input value={form.price} onChange={e => setForm({...form, price: e.target.value})} type="number" style={inp} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div><label style={lbl}>🏷️ পুরনো প্রাইস</label><input value={form.old_price} onChange={e => setForm({...form, old_price: e.target.value})} type="number" style={inp} /></div>
              <div><label style={lbl}>🔻 ডিসকাউন্ট %</label><input value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} type="number" style={inp} /></div>
              <div><label style={lbl}>📦 স্টক</label><input value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} type="number" style={inp} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={lbl}>📂 ক্যাটাগরি</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inp}>
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div><label style={lbl}>⭐ রেটিং</label><input value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} type="number" step="0.1" style={inp} /></div>
            </div>
            <div><label style={lbl}>📄 বিবরণ</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{...inp, height: '80px', resize: 'vertical'}} /></div>
            <div><label style={lbl}>📱 সেলার ফোন</label><input value={form.seller_phone} onChange={e => setForm({...form, seller_phone: e.target.value})} style={inp} /></div>
            <div>
              <label style={lbl}>🖼️ ইমেজ</label>
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} style={{ fontSize: '12px' }} />
              {form.image_url && <img src={form.webp_url || form.image_url} style={{ maxWidth: '120px', maxHeight: '120px', borderRadius: '8px', marginTop: '8px', border: '2px solid #e0e0e0' }} alt="" />}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={saveProduct} style={{ flex: 1, padding: '12px', background: '#00a651', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                {editingId ? '💾 আপডেট' : '💾 সেভ'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ flex: 1, padding: '12px', background: '#f5f5f5', color: '#666', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>❌ বাতিল</button>
            </div>
          </div>
        </div>
      )}

      {/* প্রোডাক্ট লিস্ট */}
      {loading ? <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>⏳</div> : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#999' }}>📭 কিছু নেই</div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {products.map(p => (
            <div key={p.id} style={{
              background: 'white', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e8eaed',
              display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between',
              borderLeft: p.status === 'pending' ? '4px solid #FFB347' : p.is_premium ? '4px solid #1a1a2e' : '4px solid transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '250px' }}>
                <img src={p.webp_url || p.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'} 
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #f0f0f0' }} alt="" />
                <div>
                  <strong style={{ fontSize: '14px', color: '#1a1a2e' }}>{p.title}</strong>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '700' }}>৳{p.price?.toLocaleString()}</span>
                    <span style={{ fontSize: '10px', background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px' }}>{categories.find(c => c.value === p.category)?.label || p.category}</span>
                    {p.status === 'pending' && <span style={{ fontSize: '10px', background: '#FFF3E0', color: '#E65100', padding: '2px 8px', borderRadius: '10px' }}>⏳ পেন্ডিং</span>}
                    {p.is_premium && <span style={{ fontSize: '10px', background: '#1a1a2e', color: '#FFB347', padding: '2px 8px', borderRadius: '10px' }}>👑 প্রিমিয়াম</span>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {p.image_url && <a href={p.image_url} download target="_blank" style={{ background: '#e8f0fe', color: '#1a73e8', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '600', fontSize: '10px', textDecoration: 'none', whiteSpace: 'nowrap' }}>📥</a>}
                <label style={{ background: '#f0f0f0', color: '#666', padding: '6px 10px', borderRadius: '6px', fontWeight: '600', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>📤<input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleReplaceImage(p.id, f); }} style={{ display: 'none' }} /></label>
                {p.status === 'pending' && <button onClick={() => updateStatus(p.id, 'approved')} style={{ background: '#e6f4ea', color: '#00a651', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '600', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>✅</button>}
                {p.status === 'pending' && <button onClick={() => updateStatus(p.id, 'rejected')} style={{ background: '#fce8e6', color: '#e62e04', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '600', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>❌</button>}
                <button onClick={() => setPreviewProduct(p)} style={{ background: '#f0f0f0', color: '#666', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '600', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>👁️</button>
                <button onClick={() => editProduct(p)} style={{ background: '#e8f0fe', color: '#1a73e8', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '600', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>✏️</button>
                <button onClick={() => deleteProduct(p.id)} style={{ background: '#fce8e6', color: '#e62e04', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '600', fontSize: '10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* প্রিভিউ মোডাল */}
      {previewProduct && (
        <div onClick={() => setPreviewProduct(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '14px', padding: '24px', maxWidth: '500px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>👁️ প্রিভিউ</h2>
              <button onClick={() => setPreviewProduct(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            {previewProduct.image_url && <img src={previewProduct.webp_url || previewProduct.image_url} style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', marginBottom: '12px' }} alt="" />}
            <h3>{previewProduct.title}</h3>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#e62e04' }}>৳{previewProduct.price?.toLocaleString()}</p>
            <p style={{ color: '#666' }}>{previewProduct.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '4px' };
const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const sel: React.CSSProperties = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '12px', cursor: 'pointer', minWidth: '130px' };