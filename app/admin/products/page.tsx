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
  sold?: number;
  stock?: number;
  description?: string;
  is_active?: boolean;
  rating?: number;
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

const emptyForm = {
  title: '', price: '', old_price: '', discount: '', category: 'offer-zone',
  description: '', image_url: '', webp_url: '', stock: '', rating: '',
};

export default function ProductAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  
  const [form, setForm] = useState({...emptyForm});

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    let query = supabase.from('products').select('*').order('created_at', { ascending: false }).limit(50);
    if (filterCategory !== 'all') query = query.eq('category', filterCategory);
    if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);
    const { data } = await query;
    if (data) setProducts(data);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, [filterCategory]);

  async function handleImageUpload(file: File) {
    if (!file) return;
    setUploading(true);
    setUploadProgress('🔄 কম্প্রেস হচ্ছে...');
    try {
      const compressed = await compressImage(file, 35);
      setUploadProgress('📤 আপলোড হচ্ছে...');
      const fileName = `product_${Date.now()}.webp`;
      const { data, error } = await supabase.storage.from('banners').upload(fileName, compressed, {
        contentType: 'image/webp', upsert: true,
      });
      if (!error && data) {
        const url = `https://zypshsruibnbefixknxm.supabase.co/storage/v1/object/public/banners/${fileName}`;
        setForm(prev => ({ ...prev, image_url: url, webp_url: url }));
        setUploadProgress('✅ আপলোড সফল!');
      } else {
        setUploadProgress('❌ আপলোড ফেইল!');
      }
    } catch (e) {
      setUploadProgress('❌ এরর!');
    }
    setUploading(false);
  }

  async function saveProduct() {
    if (!form.title || !form.price) return alert('টাইটেল ও প্রাইস দাও!');
    
    const data = {
      title: form.title,
      price: parseFloat(form.price),
      old_price: form.old_price ? parseFloat(form.old_price) : null,
      discount: form.discount ? parseInt(form.discount) : 0,
      category: form.category,
      description: form.description,
      image_url: form.image_url,
      webp_url: form.webp_url,
      stock: form.stock ? parseInt(form.stock) : 0,
      rating: form.rating ? parseFloat(form.rating) : 0,
    };
    
    if (editingId) {
      const { error } = await supabase.from('products').update(data).eq('id', editingId);
      if (!error) { resetForm(); loadProducts(); alert('✅ আপডেট হয়েছে!'); }
      else alert('❌ এরর: ' + error.message);
    } else {
      const { error } = await supabase.from('products').insert({...data, sold: 0, is_active: true});
      if (!error) { resetForm(); loadProducts(); alert('✅ যোগ হয়েছে!'); }
      else alert('❌ এরর: ' + error.message);
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm('ডিলিট করবেন?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadProducts();
  }

  async function toggleActive(id: number, current: boolean) {
    await supabase.from('products').update({ is_active: !current }).eq('id', id);
    loadProducts();
  }

  function resetForm() {
    setForm({...emptyForm});
    setShowAdd(false);
    setEditingId(null);
  }

  function editProduct(p: Product) {
    setForm({
      title: p.title, price: String(p.price), old_price: p.old_price ? String(p.old_price) : '',
      discount: p.discount ? String(p.discount) : '', category: p.category,
      description: p.description || '', image_url: p.image_url || '', webp_url: p.webp_url || '',
      stock: p.stock ? String(p.stock) : '', rating: p.rating ? String(p.rating) : '',
    });
    setEditingId(p.id);
    setShowAdd(true);
  }

  async function handleBulkDelete() {
    if (!confirm('সব ফিল্টার করা প্রোডাক্ট ডিলিট করবেন?')) return;
    let query = supabase.from('products').delete().neq('id', 0);
    if (filterCategory !== 'all') query = query.eq('category', filterCategory);
    await query;
    loadProducts();
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* হেডার */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
        background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)',
        padding: '20px 24px', borderRadius: '16px', color: 'white',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, fontWeight: '800' }}>📦 প্রোডাক্ট ম্যানেজমেন্ট</h1>
          <p style={{ fontSize: '12px', margin: '4px 0 0', opacity: 0.8 }}>
            {products.length} টি · ✏️ এডিট · 🗑️ ডিলিট · 🔍 সার্চ · 📂 ফিল্টার
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleBulkDelete} style={{
            background: '#e62e04', color: 'white', border: 'none',
            padding: '10px 18px', borderRadius: '10px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '12px',
          }}>🗑️ বাল্ক ডিলিট</button>
          <button onClick={() => { resetForm(); setShowAdd(!showAdd); }} style={{
            background: 'linear-gradient(135deg, #FFB347, #e62e04)', color: 'white',
            border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 20px rgba(230,46,4,0.3)',
          }}>➕ নতুন প্রোডাক্ট</button>
        </div>
      </div>

      {/* সার্চ + ফিল্টার বার */}
      <div style={{
        background: 'white', padding: '14px 18px', borderRadius: '12px',
        marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap',
        border: '1px solid #e8eaed',
      }}>
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadProducts()}
          placeholder="🔍 প্রোডাক্ট সার্চ করুন..." 
          style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', minWidth: '200px' }} />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', cursor: 'pointer' }}>
          <option value="all">📂 সব ক্যাটাগরি</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <button onClick={loadProducts} style={{
          background: '#1a73e8', color: 'white', border: 'none',
          padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
        }}>🔍 খুঁজুন</button>
      </div>

      {/* অ্যাড/এডিট ফর্ম */}
      {showAdd && (
        <div style={{
          background: 'white', padding: '28px', borderRadius: '16px',
          marginBottom: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #e8eaed',
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>
            {editingId ? '✏️ প্রোডাক্ট এডিট করুন' : '✨ নতুন প্রোডাক্ট যোগ করুন'}
          </h3>
          
          <div style={{ display: 'grid', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={lbl}>📝 টাইটেল *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inp} placeholder="প্রোডাক্টের নাম" />
              </div>
              <div>
                <label style={lbl}>💰 প্রাইস (৳) *</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={inp} placeholder="১২৯৯" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <div>
                <label style={lbl}>🏷️ পুরনো প্রাইস</label>
                <input type="number" value={form.old_price} onChange={e => setForm({...form, old_price: e.target.value})} style={inp} placeholder="১৯৯৯" />
              </div>
              <div>
                <label style={lbl}>🔻 ডিসকাউন্ট (%)</label>
                <input type="number" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})} style={inp} placeholder="২০" />
              </div>
              <div>
                <label style={lbl}>📦 স্টক</label>
                <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} style={inp} placeholder="৫০" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={lbl}>🗂️ ক্যাটাগরি *</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} 
                  style={{...inp, cursor: 'pointer', background: '#f8f9fa'}}>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>⭐ রেটিং</label>
                <input type="number" step="0.1" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} style={inp} placeholder="৪.৫" />
              </div>
            </div>

            <div>
              <label style={lbl}>📄 বিবরণ</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} 
                style={{...inp, height: '90px', resize: 'vertical'}} placeholder="প্রোডাক্টের বিস্তারিত..." />
            </div>

            {/* ইমেজ আপলোড */}
            <div>
              <label style={lbl}>🖼️ ইমেজ (Auto WebP · ~30KB)</label>
              <div style={{
                border: '2px dashed #c4c7cc', borderRadius: '14px', padding: '30px',
                textAlign: 'center', background: '#fafbfc', cursor: 'pointer',
              }}>
                <input type="file" accept="image/*"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }}
                  style={{ display: 'none' }} id="product-img-upload" />
                <label htmlFor="product-img-upload" style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
                  <p style={{ fontSize: '14px', color: '#444', margin: 0, fontWeight: '600' }}>ইমেজ সিলেক্ট করুন</p>
                  <p style={{ fontSize: '11px', color: '#888', margin: '6px 0 0' }}>PNG · JPG · WebP → ≈৩০KB WebP</p>
                </label>
              </div>
              {uploading && <div style={{ marginTop: '10px', fontSize: '13px', color: '#1a73e8', textAlign: 'center', fontWeight: '600' }}>{uploadProgress}</div>}
              {form.image_url && (
                <div style={{ marginTop: '14px', textAlign: 'center' }}>
                  <img src={form.webp_url || form.image_url} style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '10px', border: '2px solid #e0e0e0' }} />
                  <p style={{ fontSize: '11px', color: '#00a651', marginTop: '6px', fontWeight: '600' }}>✅ WebP কম্প্রেসড</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={saveProduct} style={{
                background: 'linear-gradient(135deg, #00a651, #00c853)', color: 'white',
                border: 'none', padding: '14px 32px', borderRadius: '12px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '15px', flex: 1, boxShadow: '0 4px 16px rgba(0,166,81,0.3)',
              }}>{editingId ? '💾 আপডেট করুন' : '💾 সেভ করুন'}</button>
              <button onClick={resetForm} style={{
                background: '#f5f5f5', color: '#666', border: '1px solid #ddd',
                padding: '14px 32px', borderRadius: '12px', cursor: 'pointer', fontSize: '15px',
              }}>❌ বাতিল</button>
            </div>
          </div>
        </div>
      )}

      {/* প্রোডাক্ট লিস্ট */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>⏳ লোড হচ্ছে...</div>}
        {!loading && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '14px', color: '#999' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📭</span>
            <p style={{ fontSize: '15px', fontWeight: '600' }}>কোনো প্রোডাক্ট নেই</p>
          </div>
        )}
        {products.map(p => (
          <div key={p.id} style={{
            background: 'white', borderRadius: '12px', padding: '14px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid #e8eaed', flexWrap: 'wrap', gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {p.image_url ? (
                <img src={p.webp_url || p.image_url} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #f0f0f0' }} />
              ) : (
                <div style={{ width: '70px', height: '70px', borderRadius: '10px', background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>📦</div>
              )}
              <div>
                <strong style={{ fontSize: '15px', color: '#1a1a2e' }}>{p.title}</strong>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '700' }}>৳{p.price?.toLocaleString()}</span>
                  {p.old_price && <span style={{ fontSize: '10px', color: '#999', textDecoration: 'line-through' }}>৳{p.old_price.toLocaleString()}</span>}
                  {p.discount ? <span style={{ fontSize: '10px', color: '#e62e04', fontWeight: '600' }}>-{p.discount}%</span> : null}
                  <span style={{ fontSize: '10px', color: '#666', background: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' }}>{categories.find(c => c.value === p.category)?.label || p.category}</span>
                  {p.stock !== undefined && <span style={{ fontSize: '10px', color: '#888' }}>📦 {p.stock}</span>}
                  {p.rating ? <span style={{ fontSize: '10px', color: '#FFB347' }}>⭐ {p.rating}</span> : null}
                  <span onClick={() => toggleActive(p.id, p.is_active ?? true)} style={{
                    cursor: 'pointer', fontSize: '10px', fontWeight: '600',
                    padding: '2px 8px', borderRadius: '12px',
                    background: (p.is_active ?? true) ? '#e6f4ea' : '#fce8e6',
                    color: (p.is_active ?? true) ? '#00a651' : '#e62e04',
                  }}>{(p.is_active ?? true) ? '🟢 Active' : '🔴 Inactive'}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => editProduct(p)} style={{ background: '#e8f0fe', color: '#1a73e8', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>✏️</button>
              <button onClick={() => deleteProduct(p.id)} style={{ background: '#fce8e6', color: '#e62e04', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' };
const inp: React.CSSProperties = { width: '100%', padding: '11px 16px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };