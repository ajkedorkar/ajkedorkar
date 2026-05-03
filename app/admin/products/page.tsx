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
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [replaceImageId, setReplaceImageId] = useState<number | null>(null);
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
    const { data, count } = await query;
    if (data) setProducts(data);

    // স্ট্যাট
    const { data: all } = await supabase.from('products').select('status, is_premium');
    if (all) {
      setStats({
        total: all.length,
        pending: all.filter(p => p.status === 'pending').length,
        premium: all.filter(p => p.is_premium).length,
      });
    }
    setLoading(false);
  }

  async function updateStatus(id: number, status: string) {
    await supabase.from('products').update({ status }).eq('id', id);
    loadProducts();
    alert(`✅ ${status === 'approved' ? 'অ্যাপ্রুভ' : 'রিজেক্ট'} হয়েছে!`);
  }

  async function handleReplaceImage(id: number, file: File) {
    setUploading(true);
    const compressed = await compressImage(file, 30);
    const fileName = `product_${id}_${Date.now()}.webp`;
    const { data } = await supabase.storage.from('banners').upload(fileName, compressed, { contentType: 'image/webp', upsert: true });
    if (data) {
      const url = `https://zypshsruibnbefixknxm.supabase.co/storage/v1/object/public/banners/${fileName}`;
      await supabase.from('products').update({ image_url: url, webp_url: url }).eq('id', id);
      loadProducts();
      alert('✅ ইমেজ রিপ্লেস হয়েছে!');
    }
    setUploading(false);
    setReplaceImageId(null);
  }

  async function saveProduct() {
    if (!form.title || !form.price) return alert('টাইটেল ও প্রাইস দাও!');
    const data = {
      title: form.title, price: parseFloat(form.price),
      old_price: form.old_price ? parseFloat(form.old_price) : null,
      discount: form.discount ? parseInt(form.discount) : 0,
      category: form.category, description: form.description,
      image_url: form.image_url, webp_url: form.webp_url,
      stock: form.stock ? parseInt(form.stock) : 0,
      rating: form.rating ? parseFloat(form.rating) : 0,
      seller_phone: form.seller_phone, status: 'approved',
    };
    if (editingId) {
      await supabase.from('products').update(data).eq('id', editingId);
    } else {
      await supabase.from('products').insert({...data, sold: 0, is_active: true});
    }
    setForm({...emptyForm}); setShowAdd(false); setEditingId(null); loadProducts();
    alert('✅ সেভ হয়েছে!');
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
    setEditingId(p.id); setShowAdd(true);
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* হেডার + স্ট্যাট */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
        background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)',
        padding: '20px 24px', borderRadius: '16px', color: 'white',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, fontWeight: '800' }}>📦 প্রোডাক্ট ম্যানেজমেন্ট</h1>
          <p style={{ fontSize: '12px', margin: '4px 0 0', opacity: 0.8 }}>
            {stats.total}টি • {stats.pending}টি পেন্ডিং • {stats.premium}টি প্রিমিয়াম
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { setForm({...emptyForm}); setEditingId(null); setShowAdd(!showAdd); }} style={{
            background: 'linear-gradient(135deg, #FFB347, #e62e04)', color: 'white',
            border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 20px rgba(230,46,4,0.3)',
          }}>➕ নতুন</button>
        </div>
      </div>

      {/* ফিল্টার বার */}
      <div style={{
        background: 'white', padding: '12px 16px', borderRadius: '10px',
        marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', border: '1px solid #e8eaed',
      }}>
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadProducts()}
          placeholder="🔍 সার্চ..." style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', minWidth: '150px' }} />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={selStyle}>
          <option value="all">📂 সব ক্যাটাগরি</option>
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selStyle}>
          <option value="all">📋 সব স্ট্যাটাস</option>
          <option value="pending">⏳ পেন্ডিং</option>
          <option value="approved">✅ অ্যাপ্রুভড</option>
          <option value="premium">👑 প্রিমিয়াম</option>
        </select>
        <button onClick={loadProducts} style={{ background: '#1a73e8', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>🔍 খুঁজুন</button>
      </div>

      {/* প্রোডাক্ট লিস্ট */}
      {loading ? <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>⏳</div> : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#999' }}>📭 কিছু নেই</div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {products.map(p => (
            <div key={p.id} style={{
              background: 'white', borderRadius: '10px', padding: '14px 16px',
              border: '1px solid #e8eaed', display: 'flex', flexWrap: 'wrap', gap: '12px',
              alignItems: 'center', justifyContent: 'space-between',
              borderLeft: p.status === 'pending' ? '4px solid #FFB347' : p.is_premium ? '4px solid #1a1a2e' : '4px solid transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '250px' }}>
                <img src={p.webp_url || p.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'} 
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #f0f0f0' }} alt="" />
                <div>
                  <strong style={{ fontSize: '14px', color: '#1a1a2e' }}>{p.title}</strong>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '700' }}>৳{p.price?.toLocaleString()}</span>
                    <span style={{ fontSize: '10px', background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px' }}>
                      {categories.find(c => c.value === p.category)?.label || p.category}
                    </span>
                    {p.status === 'pending' && <span style={{ fontSize: '10px', background: '#FFF3E0', color: '#E65100', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>⏳ পেন্ডিং</span>}
                    {p.is_premium && <span style={{ fontSize: '10px', background: '#1a1a2e', color: '#FFB347', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>👑 প্রিমিয়াম</span>}
                    {p.seller_phone && <span style={{ fontSize: '10px', color: '#666' }}>📱 {p.seller_phone}</span>}
                  </div>
                </div>
              </div>

              {/* অ্যাকশন বাটন */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* ডাউনলোড */}
                {p.image_url && (
                  <a href={p.image_url} download target="_blank" onClick={e => e.stopPropagation()} style={{
                    background: '#e8f0fe', color: '#1a73e8', border: 'none', padding: '6px 10px',
                    borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '10px',
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}>📥 ডাউনলোড</a>
                )}

                {/* Replace Image */}
                <label style={{
                  background: '#f0f0f0', color: '#666', border: 'none', padding: '6px 10px',
                  borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '10px', whiteSpace: 'nowrap',
                }}>
                  📤 Replace
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleReplaceImage(p.id, f); }} style={{ display: 'none' }} />
                </label>

                {/* Approve (শুধু pending-এর জন্য) */}
                {p.status === 'pending' && (
                  <button onClick={() => updateStatus(p.id, 'approved')} style={{
                    background: '#e6f4ea', color: '#00a651', border: 'none', padding: '6px 10px',
                    borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '10px', whiteSpace: 'nowrap',
                  }}>✅ Approve</button>
                )}

                {/* Reject */}
                {p.status === 'pending' && (
                  <button onClick={() => updateStatus(p.id, 'rejected')} style={{
                    background: '#fce8e6', color: '#e62e04', border: 'none', padding: '6px 10px',
                    borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '10px', whiteSpace: 'nowrap',
                  }}>❌ Reject</button>
                )}

                {/* প্রিভিউ */}
                <button onClick={() => setPreviewProduct(p)} style={{
                  background: '#f0f0f0', color: '#666', border: 'none', padding: '6px 10px',
                  borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '10px', whiteSpace: 'nowrap',
                }}>👁️</button>

                {/* এডিট */}
                <button onClick={() => editProduct(p)} style={{
                  background: '#e8f0fe', color: '#1a73e8', border: 'none', padding: '6px 10px',
                  borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '10px', whiteSpace: 'nowrap',
                }}>✏️</button>

                {/* ডিলিট */}
                <button onClick={() => deleteProduct(p.id)} style={{
                  background: '#fce8e6', color: '#e62e04', border: 'none', padding: '6px 10px',
                  borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '10px', whiteSpace: 'nowrap',
                }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* প্রিভিউ মোডাল */}
      {previewProduct && (
        <div onClick={() => setPreviewProduct(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: '14px', padding: '24px', maxWidth: '500px', width: '100%',
            maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>👁️ প্রিভিউ</h2>
              <button onClick={() => setPreviewProduct(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            {previewProduct.image_url && (
              <img src={previewProduct.webp_url || previewProduct.image_url} style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', marginBottom: '12px' }} alt="" />
            )}
            <h3>{previewProduct.title}</h3>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#e62e04' }}>৳{previewProduct.price?.toLocaleString()}</p>
            <p style={{ color: '#666' }}>{previewProduct.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const selStyle: React.CSSProperties = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '12px', cursor: 'pointer', minWidth: '130px' };