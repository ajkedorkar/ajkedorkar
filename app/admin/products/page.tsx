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

// বাংলা ক্যাটাগরি (হোমপেজের সাথে মিল)
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
  const [uploadProgress, setUploadProgress] = useState('');
  
  const [form, setForm] = useState({
    title: '',
    price: '',
    category: 'offer-zone',
    description: '',
    image_url: '',
    webp_url: '',
  });

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
      const compressed = await compressImage(file, 35);
      setUploadProgress('📤 আপলোড হচ্ছে...');
      
      const fileName = `product_${Date.now()}.webp`;
      const { data, error } = await supabase.storage
        .from('banners')
        .upload(fileName, compressed, {
          contentType: 'image/webp',
          upsert: true,
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
      setForm({ title: '', price: '', category: 'offer-zone', description: '', image_url: '', webp_url: '' });
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
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
        background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)',
        padding: '20px 24px', borderRadius: '16px', color: 'white',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, fontWeight: '800' }}>📦 প্রোডাক্ট ম্যানেজমেন্ট</h1>
          <p style={{ fontSize: '12px', margin: '4px 0 0', opacity: 0.8 }}>
            {products.length} টি প্রোডাক্ট · WebP কম্প্রেস · ৩০KB ইমেজ
          </p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          background: 'linear-gradient(135deg, #FFB347, #e62e04)', color: 'white',
          border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer',
          fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 20px rgba(230,46,4,0.3)',
        }}>
          ➕ নতুন প্রোডাক্ট
        </button>
      </div>

      {/* অ্যাড ফর্ম */}
      {showAdd && (
        <div style={{
          background: 'white', padding: '28px', borderRadius: '16px',
          marginBottom: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #e8eaed',
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>
            ✨ নতুন প্রোডাক্ট যোগ করুন
          </h3>
          
          <div style={{ display: 'grid', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>📝 টাইটেল *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} 
                  style={inputStyle} placeholder="প্রোডাক্টের নাম লিখুন" />
              </div>
              <div>
                <label style={labelStyle}>💰 প্রাইস (৳) *</label>
                <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} 
                  style={inputStyle} placeholder="যেমন: ১২৯৯" />
              </div>
            </div>

            <div>
              <label style={labelStyle}>🗂️ ক্যাটাগরি *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} 
                style={{...inputStyle, cursor: 'pointer', background: '#f8f9fa'}}>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>📄 বিবরণ</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} 
                style={{...inputStyle, height: '90px', resize: 'vertical'}} placeholder="প্রোডাক্টের বিস্তারিত লিখুন..." />
            </div>

            {/* ইমেজ আপলোড */}
            <div>
              <label style={labelStyle}>🖼️ ইমেজ আপলোড (Auto WebP · Max 35KB)</label>
              <div style={{
                border: '2px dashed #c4c7cc', borderRadius: '14px', padding: '30px',
                textAlign: 'center', background: '#fafbfc', transition: 'all 0.3s',
                cursor: 'pointer',
              }}
                onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = '#1a73e8'}
                onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = '#c4c7cc'}
              >
                <input type="file" accept="image/*"
                  onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }}
                  style={{ display: 'none' }} id="product-image-upload"
                />
                <label htmlFor="product-image-upload" style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📸</div>
                  <p style={{ fontSize: '14px', color: '#444', margin: 0, fontWeight: '600' }}>
                    ইমেজ সিলেক্ট করতে ক্লিক করুন
                  </p>
                  <p style={{ fontSize: '11px', color: '#888', margin: '6px 0 0' }}>
                    PNG · JPG · WebP → অটো কম্প্রেস → ≈৩০KB WebP
                  </p>
                </label>
              </div>
              
              {uploading && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: '#1a73e8', textAlign: 'center', fontWeight: '600' }}>
                  {uploadProgress}
                </div>
              )}
              
              {form.image_url && (
                <div style={{ marginTop: '14px', textAlign: 'center' }}>
                  <img src={form.webp_url || form.image_url} 
                    style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '10px', border: '2px solid #e0e0e0' }} />
                  <p style={{ fontSize: '11px', color: '#00a651', marginTop: '6px', fontWeight: '600' }}>
                    ✅ WebP ফরম্যাটে কম্প্রেসড
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={addProduct} style={{
                background: 'linear-gradient(135deg, #00a651, #00c853)', color: 'white',
                border: 'none', padding: '14px 32px', borderRadius: '12px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '15px', flex: 1, boxShadow: '0 4px 16px rgba(0,166,81,0.3)',
              }}>💾 প্রোডাক্ট সেভ করুন</button>
              <button onClick={() => setShowAdd(false)} style={{
                background: '#f5f5f5', color: '#666', border: '1px solid #ddd',
                padding: '14px 32px', borderRadius: '12px', cursor: 'pointer', fontSize: '15px',
              }}>❌ বাতিল</button>
            </div>
          </div>
        </div>
      )}

      {/* প্রোডাক্ট লিস্ট */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {products.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '14px', color: '#999' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>📭</span>
            <p style={{ fontSize: '15px', fontWeight: '600' }}>কোনো প্রোডাক্ট নেই</p>
            <p style={{ fontSize: '12px' }}>উপরে "➕ নতুন প্রোডাক্ট" বাটনে ক্লিক করুন</p>
          </div>
        )}
        {products.map(p => (
          <div key={p.id} style={{
            background: 'white', borderRadius: '12px', padding: '14px 18px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid #e8eaed', flexWrap: 'wrap', gap: '12px',
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {p.image_url ? (
                <img src={p.webp_url || p.image_url} style={{ 
                  width: '70px', height: '70px', objectFit: 'cover', borderRadius: '10px',
                  border: '2px solid #f0f0f0'
                }} />
              ) : (
                <div style={{ 
                  width: '70px', height: '70px', borderRadius: '10px', background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' 
                }}>📦</div>
              )}
              <div>
                <strong style={{ fontSize: '15px', color: '#1a1a2e' }}>{p.title}</strong>
                <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: '#1a73e8', fontWeight: '700' }}>৳{p.price?.toLocaleString()}</span>
                  <span style={{ 
                    fontSize: '10px', color: '#666', background: '#f0f0f0', padding: '2px 8px', borderRadius: '12px' 
                  }}>
                    {categories.find(c => c.value === p.category)?.label || p.category}
                  </span>
                  {p.sold !== undefined && (
                    <span style={{ fontSize: '10px', color: '#999' }}>{p.sold} SOLD</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => deleteProduct(p.id)} style={{
              background: '#fce8e6', color: '#e62e04', border: 'none',
              padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px',
            }}>🗑️ ডিলিট</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { 
  display: 'block', fontSize: '13px', fontWeight: '600', color: '#333', marginBottom: '6px' 
};
const inputStyle: React.CSSProperties = { 
  width: '100%', padding: '11px 16px', borderRadius: '10px', border: '1px solid #ddd', 
  fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border 0.2s',
};