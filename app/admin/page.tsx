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
      <div style={{ textAlign: 'center', padding: '80px 20px', fontSize: '16px', color: '#999' }}>
        ⏳ ব্যানার লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* হেডার */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '20px', flexWrap: 'wrap', gap: '10px'
      }}>
        <div>
          <h1 style={{ color: '#222', fontSize: '22px', margin: 0 }}>🎠 ব্যানার ম্যানেজমেন্ট</h1>
          <p style={{ color: '#666', margin: '2px 0 0 0', fontSize: '12px' }}>সব ব্যানার দেখুন ও এডিট করুন</p>
        </div>
        <button onClick={loadBanners} style={{
          background: '#1a73e8', color: 'white', border: 'none',
          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
          fontWeight: 'bold', fontSize: '12px'
        }}>
          🔄 রিফ্রেশ
        </button>
      </div>

      {/* ব্যানার লিস্ট */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {banners.map(banner => (
          <div key={banner.id} style={{
            background: 'white', borderRadius: '10px', padding: '16px',
            border: '1px solid #e0e0e0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            
            {editing?.id === banner.id ? (
              // ==================== এডিট মোড ====================
              <div style={{ display: 'grid', gap: '12px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>📝 টাইটেল</label>
                    <input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>📄 সাবটাইটেল</label>
                    <input value={editing.subtitle} onChange={e => setEditing({...editing, subtitle: e.target.value})} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>🖼️ ইমেজ আপলোড</label>
                  <input 
                    type="file" accept="image/*"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }}
                    style={{ ...inputStyle, padding: '6px' }}
                    disabled={uploading}
                  />
                  {uploading && <span style={{ fontSize: '11px', color: '#1a73e8' }}>⏳ আপলোড হচ্ছে...</span>}
                  
                  <div style={{ marginTop: '6px' }}>
                    <label style={{ ...labelStyle, fontSize: '10px' }}>অথবা URL:</label>
                    <input 
                      value={editing.image_url || ''} 
                      onChange={e => setEditing({...editing, image_url: e.target.value})}
                      style={inputStyle} 
                    />
                  </div>

                  {editing.image_url && (
                    <div style={{ marginTop: '6px', position: 'relative' }}>
                      <img src={editing.image_url} style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '6px' }} alt="" />
                      <button onClick={() => setEditing({...editing, image_url: ''})} style={{
                        position: 'absolute', top: '4px', right: '4px',
                        background: '#e62e04', color: 'white', border: 'none',
                        width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', fontSize: '12px',
                      }}>✕</button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={labelStyle}>🎨 কালার</label>
                    <input type="color" value={editing.color} onChange={e => setEditing({...editing, color: e.target.value})} 
                      style={{ width: '100%', height: '34px', borderRadius: '4px', border: '1px solid #ddd' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>🔣 আইকন</label>
                    <input value={editing.icon} onChange={e => setEditing({...editing, icon: e.target.value})} 
                      style={{...inputStyle, textAlign: 'center', fontSize: '20px'}} />
                  </div>
                  <div>
                    <label style={labelStyle}>📏 px</label>
                    <input type="number" value={editing.banner_height} 
                      onChange={e => setEditing({...editing, banner_height: parseInt(e.target.value) || 350})} 
                      style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>🔘 বাটন</label>
                    <input value={editing.button_text} onChange={e => setEditing({...editing, button_text: e.target.value})} 
                      style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={editing.show_button} 
                    onChange={e => setEditing({...editing, show_button: e.target.checked})} 
                    style={{ width: '16px', height: '16px' }} />
                  <label style={{ fontSize: '12px', fontWeight: '600' }}>বাটন দেখাও</label>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => updateBanner(editing)} style={saveBtn}>💾 সেভ</button>
                  <button onClick={() => setEditing(null)} style={cancelBtn}>❌ বাতিল</button>
                </div>
              </div>
            ) : (
              // ==================== ভিউ মোড ====================
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
                  <div style={{
                    width: '120px', height: '70px', borderRadius: '6px', overflow: 'hidden',
                    background: banner.image_url ? 'transparent' : banner.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', color: 'white', flexShrink: 0, border: '1px solid #e0e0e0',
                  }}>
                    {banner.image_url ? (
                      <img src={banner.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    ) : banner.icon}
                  </div>
                  
                  <div>
                    <h3 style={{ margin: '0 0 2px 0', fontSize: '15px' }}>{banner.title}</h3>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '11px' }}>{banner.subtitle}</p>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <span style={tagStyle}>📏 {banner.banner_height}px</span>
                      {banner.image_url && <span style={tagStyle}>🖼️</span>}
                      {banner.show_button && <span style={tagStyle}>🔘 {banner.button_text}</span>}
                      <span style={{
                        padding: '2px 8px', borderRadius: '12px', fontSize: '9px', fontWeight: 'bold',
                        background: banner.is_active ? '#e6f4ea' : '#fce8e6',
                        color: banner.is_active ? '#00a651' : '#e62e04',
                      }}>
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => toggleActive(banner.id, banner.is_active)} style={{
                    background: banner.is_active ? '#fce8e6' : '#e6f4ea',
                    color: banner.is_active ? '#e62e04' : '#00a651',
                    border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', 
                    fontWeight: '600', fontSize: '10px', whiteSpace: 'nowrap',
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

      <div style={{ textAlign: 'center', marginTop: '20px', color: '#999', fontSize: '11px' }}>
        মোট: {banners.length} টি | অ্যাক্টিভ: {banners.filter(b => b.is_active).length} টি
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { 
  display: 'block', fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '3px' 
};
const inputStyle: React.CSSProperties = { 
  width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', 
  fontSize: '12px', outline: 'none', boxSizing: 'border-box'
};
const tagStyle: React.CSSProperties = { 
  padding: '1px 6px', borderRadius: '10px', fontSize: '9px', background: '#f0f0f0', 
  color: '#666', fontWeight: '600' 
};
const saveBtn: React.CSSProperties = { 
  background: '#00a651', color: 'white', border: 'none', padding: '8px 20px', 
  borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', flex: 1 
};
const cancelBtn: React.CSSProperties = { 
  background: '#f5f5f5', color: '#666', border: '1px solid #ddd', padding: '8px 20px', 
  borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', flex: 1 
};
const editBtn: React.CSSProperties = { 
  background: '#1a73e8', color: 'white', border: 'none', padding: '7px 14px', 
  borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '11px', whiteSpace: 'nowrap'
};