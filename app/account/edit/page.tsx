"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/imageCompress';

export default function EditProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ 
    full_name: '', phone: '', address: '', city: 'কুষ্টিয়া', avatar_url: '' 
  });

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { router.push('/auth/login'); return; }
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userData.user.id).single();
      if (profile) {
        setForm({ 
          full_name: profile.full_name || '', 
          phone: profile.phone || '', 
          address: profile.address || '', 
          city: profile.city || 'কুষ্টিয়া',
          avatar_url: profile.avatar_url || '',
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleAvatarUpload(file: File) {
    if (!file) return;
    setUploading(true);
    
    try {
      // WebP কম্প্রেস (৩০KB)
      const compressed = await compressImage(file, 30);
      
      // Supabase Storage-এ আপলোড
      const { data: userData } = await supabase.auth.getUser();
      const fileName = `avatar_${userData.user?.id}_${Date.now()}.webp`;
      
      const { data, error } = await supabase.storage
        .from('banners')
        .upload(fileName, compressed, {
          contentType: 'image/webp',
          upsert: true,
        });
      
      if (!error && data) {
        const url = `https://zypshsruibnbefixknxm.supabase.co/storage/v1/object/public/banners/${fileName}`;
        setForm(prev => ({ ...prev, avatar_url: url }));
        alert('✅ ছবি আপলোড সফল! (~30KB WebP)');
      } else {
        alert('❌ আপলোড ফেইল: ' + error?.message);
      }
    } catch (e) {
      alert('❌ কম্প্রেস এরর!');
    }
    setUploading(false);
  }

  async function save() {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    
    const { error } = await supabase.from('profiles').upsert({ 
      id: userData.user.id, 
      full_name: form.full_name,
      phone: form.phone,
      address: form.address,
      city: form.city,
      avatar_url: form.avatar_url,
      updated_at: new Date().toISOString(),
    });
    
    if (!error) {
      alert('✅ প্রোফাইল আপডেট হয়েছে!');
      router.back();
    } else {
      alert('❌ এরর: ' + error.message);
    }
    setSaving(false);
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳ লোড হচ্ছে...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial' }}>
      
      {/* হেডার */}
      <header style={{
        background: '#e62e04', padding: '14px 20px', color: 'white',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer',
        }}>←</button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>👤 প্রোফাইল এডিট</h1>
      </header>

      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        
        {/* Avatar Upload */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: '#f0f0f0', margin: '0 auto 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '48px', overflow: 'hidden', position: 'relative',
            border: '3px solid #e62e04',
          }}>
            {form.avatar_url ? (
              <img src={form.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            ) : (
              '📷'
            )}
          </div>
          
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => { const file = e.target.files?.[0]; if (file) handleAvatarUpload(file); }}
            style={{ display: 'none' }}
            id="avatar-upload"
          />
          <label htmlFor="avatar-upload" style={{
            display: 'inline-block', padding: '8px 20px', background: '#1a73e8', color: 'white',
            borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
          }}>
            {uploading ? '⏳ আপলোড হচ্ছে...' : form.avatar_url ? '🔄 ছবি পরিবর্তন' : '📸 ছবি যোগ করুন'}
          </label>
          <p style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
            WebP ফরম্যাট · ~30KB
          </p>
        </div>

        {/* ফর্ম */}
        <div style={{ display: 'grid', gap: '12px' }}>
          <div>
            <label style={lbl}>👤 সম্পূর্ণ নাম</label>
            <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="আপনার নাম" style={inp} />
          </div>
          <div>
            <label style={lbl}>📱 ফোন নম্বর</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="০১XXXXXXXXX" style={inp} />
          </div>
          <div>
            <label style={lbl}>📍 ঠিকানা</label>
            <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="আপনার ঠিকানা" style={{...inp, height: '80px', resize: 'vertical'}} />
          </div>
          <div>
            <label style={lbl}>🏙️ শহর</label>
            <select value={form.city} onChange={e => setForm({...form, city: e.target.value})} style={inp}>
              <option>কুষ্টিয়া</option>
              <option>ঢাকা</option>
              <option>রাজশাহী</option>
              <option>খুলনা</option>
              <option>বগুড়া</option>
              <option>যশোর</option>
            </select>
          </div>

          <button onClick={save} disabled={saving} style={{
            padding: '14px', background: 'linear-gradient(135deg, #e62e04, #FF6B35)',
            color: 'white', border: 'none', borderRadius: '10px',
            fontWeight: '700', fontSize: '15px', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(230,46,4,0.3)',
            opacity: saving ? 0.7 : 1,
          }}>
            {saving ? '⏳ সেভ হচ্ছে...' : '💾 প্রোফাইল সেভ করুন'}
          </button>
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '4px' };
const inp: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };