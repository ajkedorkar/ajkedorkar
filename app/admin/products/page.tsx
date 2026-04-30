"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/imageCompress';

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image_url: string;
  webp_url?: string;
  sold?: number;
  description?: string;
  is_active?: boolean;
}

export default function ProductAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  
  const [form, setForm] = useState({
    title: '',
    price: '',
    category: 'mobile',
    description: '',
    image_url: '',
    webp_url: '',
  });

  const categories = [
    'offer-zone', 'mobile', 'computer', 'electronics', 'fashion',
    'car', 'job', 'service', 'property', 'info', 'matrimony',
    'rent', 'emergency', 'animal', 'food', 'daily-needs', 'gifts', 'handicraft',
  ];

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setProducts(data);
    setLoading(false);
  }

  async function handleImageUpload(file: File) {
    if (!file) return;
    setUploading(true);
    setUploadProgress('🔄 কম্প্রেস হচ্ছে...');
    
    try {
      // ১. ইমেজ কম্প্রেস
      const compressed = await compressImage(file, 35);
      setUploadProgress('📤 আপলোড হচ্ছে...');
      
      // ২. Supabase Storage-এ আপলোড
      const fileName = `product_${Date.now()}.webp`;
      const { data, error } = await supabase.storage
        .from('banners')
        .upload(fileName, compressed, {
          contentType: 'image/webp',
          upsert: true,
        });
      
      if (!error && data) {
        const url = `https://zypshsruibnbefixknxm.supabase.co/storage/v1/object/public/banners/${fileName}`;
        setForm(prev => ({
          ...prev,
          image_url: url,
          webp_url: url,
        }));
        setUploadProgress('✅ আপলোড সফল!');
      } else {
        setUploadProgress('❌ আপলোড ফেইল!');
      }
    } catch (e) {
      setUploadProgress('❌ এরর!');
    }
    setUploading(false);
  }

  async function addProduct() {
    if (!form.title || !form.price) return alert('টাইটেল ও প্রাইস দাও!');
    
    const { error } = await supabase.from('products').insert({
      title: form.title,
      price: parseFloat(form.price),
      category: form.category,
      description: form.description,
      image_url: form.image_url,
      webp_url: form.webp_url,
      sold: 0,
      is_active: true,
    });
    
    if (!error) {
      loadProducts();
      setShowAdd(false);
      setForm({ title: '', price: '', category: 'mobile', description: '', image_url: '', webp_url: '' });
      alert('✅ প্রোডাক্ট যোগ হয়েছে!');
    } else {
      alert('❌ এরর: ' + error.message);
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm('ডিলিট করবেন?')) return;
    await supabase.from('products').delete().eq('id', id);
    loadProducts();
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* হেডার */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ color: '#222', fontSize: '22px', margin: 0 }}>📦 প্রোডাক্ট ম্যানেজমেন্ট</h1>
          <p style={{ color: '#666', fontSize: '12px', margin: '2px 0 0' }}>
            {products.length} টি প্রোডাক্ট | WebP ফরম্যাট | অটো কম্প্রেস
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          background: 'linear-gradient(135deg, #1a73e8, #4A90D9)', color: 'white',
          border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
          fontWeight: 'bold', fontSize: '13px',
        }}>
          ➕ নতুন প্রোডাক্ট
        </button>
      </div>

      {/* অ্যাড ফর্ম */}
      {showAdd && (
        <div style={{
          background: 'white', padding: '24px', borderRadius: '14px',
          marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#222' }}>➕ নতুন প্রোডাক্ট যোগ করুন</h3>
          
          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>📝 টাইটেল</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} 
                  style={inputStyle} placeholder="প্রোডাক্টের নাম" />
              </div>
              <div>
                <label style={labelStyle}>💰 প্রাইস (৳)</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} 
                  style={inputStyle} placeholder="যেমন: 1299" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>🗂️ ক্যাটাগরি</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inputStyle}>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>📄 বিবরণ</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} 
                style={{...inputStyle, height: '80px', resize: 'vertical'}} placeholder="প্রোডাক্টের বিবরণ..." />
            </div>

            {/* ইমেজ আপলোড */}
            <div>
              <label style={labelStyle}>🖼️ ইমেজ আপলোড (Auto WebP Compress - Max 35KB)</label>
              <div style={{
                border: '2px dashed #ddd', borderRadius: '12px', padding: '20px',
                textAlign: 'center', background: '#fafafa',
              }}>
                <input 
                  type="file" accept="image/*"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>📸</div>
                  <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>ক্লিক করে ইমেজ সিলেক্ট করুন</p>
                  <p style={{ fontSize: '10px', color: '#999', margin: '4px 0 0' }}>
                    PNG, JPG, WebP → Auto Compress → ~30KB WebP
                  </p>
                </label>
              </div>
              
              {uploading && (
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#1a73e8', textAlign: 'center' }}>
                  {uploadProgress}
                </div>
              )}
              
              {form.image_url && (
                <div style={{ marginTop: '10px', position: 'relative', textAlign: 'center' }}>
                  <img src={form.webp_url || form.image_url} 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '2px solid #e0e0e0' }} />
                  <p style={{ fontSize: '10px', color: '#00a651', marginTop: '4px' }}>
                    ✅ WebP ফরম্যাটে কম্প্রেসড
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={addProduct} style={{
                background: 'linear-gradient(135deg, #00a651, #00c853)', color: 'white',
                border: 'none', padding: '12px 30px', borderRadius: '10px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '14px', flex: 1,
              }}>💾 প্রোডাক্ট সেভ করুন</button>
              <button onClick={() => setShowAdd(false)} style={{
                background: '#f5f5f5', color: '#666', border: '1px solid #ddd',
                padding: '12px 30px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
              }}>❌ বাতিল</button>
            </div>
          </div>
        </div>
      )}

      {/* প্রোডাক্ট লিস্ট */}
      <div style={{ display: 'grid', gap: '8px' }}>
        {products.map(p => (
          <div key={p.id} style={{
            background: 'white', borderRadius: '10px', padding: '12px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid #eee', flexWrap: 'wrap', gap: '10px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {p.image_url ? (
                <img src={p.webp_url || p.image_url} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📦</div>
              )}
              <div>
                <strong style={{ fontSize: '14px' }}>{p.title}</strong>
                <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                  <span style={{ fontSize: '11px', color: '#1a73e8', fontWeight: '600' }}>৳{p.price?.toLocaleString()}</span>
                  <span style={{ fontSize: '10px', color: '#999' }}>{p.category}</span>
                  {p.sold !== undefined && <span style={{ fontSize: '10px', color: '#999' }}>{p.sold} sold</span>}
                </div>
              </div>
            </div>
            <button onClick={() => deleteProduct(p.id)} style={{
              background: '#fce8e6', color: '#e62e04', border: 'none',
              padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '11px',
            }}>🗑️ ডিলিট</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { 
  display: 'block', fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '4px' 
};
const inputStyle: React.CSSProperties = { 
  width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', 
  fontSize: '13px', outline: 'none', boxSizing: 'border-box'
};