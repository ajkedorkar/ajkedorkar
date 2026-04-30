"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  image_url: string | null;
  banner_height: number;
  show_button: boolean;
  button_text: string;
  is_active: boolean;
}

export default function AdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadBanners(); }, []);

  async function loadBanners() {
    setLoading(true);
    const { data } = await supabase.from('banners').select('*').order('id');
    if (data) setBanners(data);
    setLoading(false);
  }

  async function handleImageUpload(file: File) {
    if (!file || !editing) return;
    setUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `banner_${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('banners')
      .upload(fileName, file);

    if (!error && data) {
      const url = `https://zypshsruibnbefixknxm.supabase.co/storage/v1/object/public/banners/${fileName}`;
      setEditing({ ...editing, image_url: url });
      alert('✅ ইমেজ আপলোড সফল!');
    } else {
      alert('❌ আপলোড ফেইল: ' + error?.message);
    }
    setUploading(false);
  }

  async function updateBanner(banner: Banner) {
    const { error } = await supabase
      .from('banners')
      .update({
        title: banner.title,
        subtitle: banner.subtitle,
        color: banner.color,
        icon: banner.icon,
        image_url: banner.image_url,
        banner_height: banner.banner_height,
        show_button: banner.show_button,
        button_text: banner.button_text,
        is_active: banner.is_active,
      })
      .eq('id', banner.id);
    
    if (!error) { 
      setEditing(null); 
      loadBanners(); 
      alert('✅ ব্যানার আপডেট সফল!');
    } else { 
      alert('❌ এরর: ' + error.message); 
    }
  }

  async function toggleActive(id: number, current: boolean) {
    await supabase.from('banners').update({ is_active: !current }).eq('id', id);
    loadBanners();
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', fontSize: '20px', fontFamily: 'Arial' }}>
        ⏳ লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* হেডার */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '25px', borderBottom: '3px solid #e62e04', paddingBottom: '15px',
        flexWrap: 'wrap', gap: '10px'
      }}>
        <div>
          <h1 style={{ color: '#222', fontSize: '26px', margin: 0 }}>🛠️ অ্যাডমিন প্যানেল</h1>
          <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: '13px' }}>কাস্টম ব্যানার ম্যানেজমেন্ট</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/" target="_blank" style={{
            background: '#f5f5f5', color: '#333', border: '1px solid #ddd',
            padding: '10px 18px', borderRadius: '8px', cursor: 'pointer',
            fontWeight: '600', fontSize: '13px', textDecoration: 'none', display: 'inline-block'
          }}>
            🏠 সাইট দেখুন
          </a>
          <button onClick={loadBanners} style={{
            background: '#1a73e8', color: 'white', border: 'none',
            padding: '10px 18px', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '13px'
          }}>
            🔄 রিফ্রেশ
          </button>
        </div>
      </div>

      {/* ব্যানার লিস্ট */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {banners.map(banner => (
          <div key={banner.id} style={{
            background: 'white', borderRadius: '12px', padding: '20px',
            border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            
            {editing?.id === banner.id ? (
              // ==================== এডিট মোড ====================
              <div style={{ display: 'grid', gap: '14px' }}>
                
                {/* টাইটেল + সাবটাইটেল */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>📝 ব্যানার টাইটেল</label>
                    <input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} style={inputStyle} placeholder="টাইটেল" />
                  </div>
                  <div>
                    <label style={labelStyle}>📄 সাবটাইটেল</label>
                    <input value={editing.subtitle} onChange={e => setEditing({...editing, subtitle: e.target.value})} style={inputStyle} placeholder="সাবটাইটেল" />
                  </div>
                </div>

                {/* ইমেজ আপলোড */}
                <div>
                  <label style={labelStyle}>🖼️ ইমেজ আপলোড (PC/মোবাইল থেকে)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    style={{ ...inputStyle, padding: '8px' }}
                    disabled={uploading}
                  />
                  {uploading && <span style={{ fontSize: '12px', color: '#1a73e8' }}>⏳ আপলোড হচ্ছে...</span>}
                  
                  {/* ইমেজ URL ম্যানুয়াল */}
                  <div style={{ marginTop: '8px' }}>
                    <label style={{ ...labelStyle, fontSize: '11px' }}>অথবা ইমেজ URL দিন:</label>
                    <input 
                      value={editing.image_url || ''} 
                      onChange={e => setEditing({...editing, image_url: e.target.value})}
                      style={inputStyle} 
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>

                  {/* ইমেজ প্রিভিউ */}
                  {editing.image_url && (
                    <div style={{ marginTop: '8px', position: 'relative' }}>
                      <img src={editing.image_url} style={{ 
                        width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px',
                        border: '2px solid #e0e0e0'
                      }} alt="preview" />
                      <button 
                        onClick={() => setEditing({...editing, image_url: ''})}
                        style={{
                          position: 'absolute', top: '8px', right: '8px',
                          background: '#e62e04', color: 'white', border: 'none',
                          width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
                          fontSize: '14px', fontWeight: 'bold'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* কালার + আইকন + উচ্চতা + বাটন */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>🎨 কালার</label>
                    <input type="color" value={editing.color} onChange={e => setEditing({...editing, color: e.target.value})} 
                      style={{ width: '100%', height: '38px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>🔣 আইকন</label>
                    <input value={editing.icon} onChange={e => setEditing({...editing, icon: e.target.value})} 
                      style={{...inputStyle, textAlign: 'center', fontSize: '22px'}} />
                  </div>
                  <div>
                    <label style={labelStyle}>📏 উচ্চতা (px)</label>
                    <input type="number" value={editing.banner_height} 
                      onChange={e => setEditing({...editing, banner_height: parseInt(e.target.value) || 350})} 
                      style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>🔘 বাটন টেক্সট</label>
                    <input value={editing.button_text} onChange={e => setEditing({...editing, button_text: e.target.value})} 
                      style={inputStyle} placeholder="Shop Now" />
                  </div>
                </div>

                {/* শো বাটন চেকবক্স */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" checked={editing.show_button} 
                    onChange={e => setEditing({...editing, show_button: e.target.checked})} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  <label style={{ fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>বাটন দেখাও</label>
                </div>

                {/* সেভ + বাতিল */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => updateBanner(editing)} style={saveBtn}>💾 সেভ করুন</button>
                  <button onClick={() => setEditing(null)} style={cancelBtn}>❌ বাতিল</button>
                </div>
              </div>
            ) : (
              // ==================== ভিউ মোড ====================
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, minWidth: '250px' }}>
                  {/* প্রিভিউ বক্স */}
                  <div style={{
                    width: '180px', height: '100px', borderRadius: '8px', overflow: 'hidden',
                    background: banner.image_url ? 'transparent' : banner.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '32px', color: 'white', flexShrink: 0,
                    border: '1px solid #e0e0e0',
                  }}>
                    {banner.image_url ? (
                      <img src={banner.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    ) : (
                      banner.icon
                    )}
                  </div>
                  
                  {/* ইনফো */}
                  <div>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '16px' }}>{banner.title}</h3>
                    <p style={{ margin: '0 0 6px 0', color: '#666', fontSize: '12px' }}>{banner.subtitle}</p>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      <span style={tagStyle}>📏 {banner.banner_height}px</span>
                      {banner.image_url && <span style={tagStyle}>🖼️ ইমেজ</span>}
                      {banner.show_button && <span style={tagStyle}>🔘 {banner.button_text}</span>}
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold',
                        background: banner.is_active ? '#e6f4ea' : '#fce8e6',
                        color: banner.is_active ? '#00a651' : '#e62e04',
                      }}>
                        {banner.is_active ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* অ্যাকশন বাটন */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => toggleActive(banner.id, banner.is_active)} style={{
                    background: banner.is_active ? '#fce8e6' : '#e6f4ea',
                    color: banner.is_active ? '#e62e04' : '#00a651',
                    border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', 
                    fontWeight: '600', fontSize: '11px', whiteSpace: 'nowrap',
                  }}>
                    {banner.is_active ? '⏸ নিষ্ক্রিয়' : '▶ সক্রিয়'}
                  </button>
                  <button onClick={() => setEditing(banner)} style={editBtn}>✏️ এডিট</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ফুটার */}
      <div style={{ textAlign: 'center', marginTop: '25px', color: '#999', fontSize: '12px' }}>
        মোট ব্যানার: {banners.length} টি | অ্যাক্টিভ: {banners.filter(b => b.is_active).length} টি
      </div>
    </div>
  );
}

// ===== স্টাইল =====
const labelStyle: React.CSSProperties = { 
  display: 'block', fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '4px' 
};
const inputStyle: React.CSSProperties = { 
  width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #ddd', 
  fontSize: '13px', outline: 'none', boxSizing: 'border-box'
};
const tagStyle: React.CSSProperties = { 
  padding: '2px 8px', borderRadius: '12px', fontSize: '10px', background: '#f0f0f0', 
  color: '#666', fontWeight: '600' 
};
const saveBtn: React.CSSProperties = { 
  background: '#00a651', color: 'white', border: 'none', padding: '10px 24px', 
  borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', flex: 1 
};
const cancelBtn: React.CSSProperties = { 
  background: '#f5f5f5', color: '#666', border: '1px solid #ddd', padding: '10px 24px', 
  borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', flex: 1 
};
const editBtn: React.CSSProperties = { 
  background: '#1a73e8', color: 'white', border: 'none', padding: '9px 18px', 
  borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', whiteSpace: 'nowrap'
};