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

  useEffect(() => { loadBanners(); }, []);

  async function loadBanners() {
    setLoading(true);
    const { data } = await supabase.from('banners').select('*').order('id');
    if (data) setBanners(data);
    setLoading(false);
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
    
    if (!error) { setEditing(null); loadBanners(); alert('✅ ব্যানার আপডেট সফল!'); }
    else { alert('❌ এরর: ' + error.message); }
  }

  async function toggleActive(id: number, current: boolean) {
    await supabase.from('banners').update({ is_active: !current }).eq('id', id);
    loadBanners();
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '20px' }}>⏳ লোড হচ্ছে...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      
      {/* হেডার */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '3px solid #e62e04', paddingBottom: '15px' }}>
        <div>
          <h1 style={{ color: '#222', fontSize: '28px', margin: 0 }}>🛠️ অ্যাডমিন প্যানেল</h1>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>কাস্টম ব্যানার ম্যানেজমেন্ট</p>
        </div>
        <button onClick={loadBanners} style={{ background: '#1a73e8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>🔄 রিফ্রেশ</button>
      </div>

      {/* ব্যানার লিস্ট */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {banners.map(banner => (
          <div key={banner.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            
            {editing?.id === banner.id ? (
              // ===== এডিট মোড =====
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>ব্যানার টাইটেল</label>
                    <input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>সাবটাইটেল</label>
                    <input value={editing.subtitle} onChange={e => setEditing({...editing, subtitle: e.target.value})} style={inputStyle} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>🖼️ ইমেজ URL (ছবির লিংক)</label>
                  <input value={editing.image_url || ''} onChange={e => setEditing({...editing, image_url: e.target.value})} style={inputStyle} placeholder="https://images.unsplash.com/..." />
                  {editing.image_url && (
                    <img src={editing.image_url} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginTop: '8px' }} alt="preview" />
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>🎨 ব্যাকগ্রাউন্ড</label>
                    <input type="color" value={editing.color} onChange={e => setEditing({...editing, color: e.target.value})} style={{ width: '100%', height: '40px', borderRadius: '6px', border: '1px solid #ddd' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>🔣 আইকন</label>
                    <input value={editing.icon} onChange={e => setEditing({...editing, icon: e.target.value})} style={{...inputStyle, textAlign: 'center', fontSize: '24px'}} />
                  </div>
                  <div>
                    <label style={labelStyle}>📏 উচ্চতা (px)</label>
                    <input type="number" value={editing.banner_height} onChange={e => setEditing({...editing, banner_height: parseInt(e.target.value) || 350})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>🔘 বাটন টেক্সট</label>
                    <input value={editing.button_text} onChange={e => setEditing({...editing, button_text: e.target.value})} style={inputStyle} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" checked={editing.show_button} onChange={e => setEditing({...editing, show_button: e.target.checked})} style={{ width: '20px', height: '20px' }} />
                  <label style={{ fontSize: '14px', fontWeight: '600' }}>বাটন দেখাও</label>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => updateBanner(editing)} style={saveBtn}>💾 সেভ করুন</button>
                  <button onClick={() => setEditing(null)} style={cancelBtn}>❌ বাতিল</button>
                </div>
              </div>
            ) : (
              // ===== ভিউ মোড =====
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: 1 }}>
                  {/* প্রিভিউ */}
                  <div style={{
                    width: '200px', height: '100px', borderRadius: '10px', overflow: 'hidden',
                    background: banner.image_url ? 'transparent' : banner.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '36px', color: 'white', flexShrink: 0,
                  }}>
                    {banner.image_url ? (
                      <img src={banner.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="banner" />
                    ) : (
                      banner.icon
                    )}
                  </div>
                  
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{banner.title}</h3>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '13px' }}>{banner.subtitle}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <span style={tagStyle}>📏 {banner.banner_height}px</span>
                      {banner.image_url && <span style={tagStyle}>🖼️ ইমেজ</span>}
                      {banner.show_button && <span style={tagStyle}>🔘 {banner.button_text}</span>}
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
                        background: banner.is_active ? '#e6f4ea' : '#fce8e6',
                        color: banner.is_active ? '#00a651' : '#e62e04',
                      }}>
                        {banner.is_active ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={() => toggleActive(banner.id, banner.is_active)} style={{
                    background: banner.is_active ? '#fce8e6' : '#e6f4ea',
                    color: banner.is_active ? '#e62e04' : '#00a651',
                    border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px',
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

      <div style={{ textAlign: 'center', marginTop: '30px', color: '#999', fontSize: '13px' }}>
        মোট ব্যানার: {banners.length} টি | অ্যাক্টিভ: {banners.filter(b => b.is_active).length} টি
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '4px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', outline: 'none' };
const tagStyle: React.CSSProperties = { padding: '2px 8px', borderRadius: '12px', fontSize: '10px', background: '#f0f0f0', color: '#666', fontWeight: '600' };
const saveBtn: React.CSSProperties = { background: 'linear-gradient(135deg, #00a651, #00c853)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', flex: 1 };
const cancelBtn: React.CSSProperties = { background: '#f5f5f5', color: '#666', border: '1px solid #ddd', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', flex: 1 };
const editBtn: React.CSSProperties = { background: '#1a73e8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' };