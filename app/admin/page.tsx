"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  is_active: boolean;
}

export default function AdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

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
      <div style={{ textAlign: 'center', padding: '100px', fontSize: '20px' }}>
        ⏳ লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '30px', 
      maxWidth: '1000px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* হেডার */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '3px solid #e62e04',
        paddingBottom: '15px'
      }}>
        <div>
          <h1 style={{ color: '#222', fontSize: '28px', margin: 0 }}>
            🛠️ অ্যাডমিন প্যানেল
          </h1>
          <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
            ব্যানার ম্যানেজমেন্ট সিস্টেম
          </p>
        </div>
        <button onClick={loadBanners} style={{
          background: '#1a73e8',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
        }}>
          🔄 রিফ্রেশ
        </button>
      </div>

      {/* ব্যানার লিস্ট */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {banners.map(banner => (
          <div key={banner.id} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'all 0.3s',
          }}>
            {editing?.id === banner.id ? (
              // ===== এডিট মোড =====
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>ব্যানার টাইটেল</label>
                  <input 
                    value={editing.title} 
                    onChange={e => setEditing({...editing, title: e.target.value})}
                    style={inputStyle} 
                    placeholder="টাইটেল লিখুন"
                  />
                </div>
                
                <div>
                  <label style={labelStyle}>সাবটাইটেল</label>
                  <input 
                    value={editing.subtitle} 
                    onChange={e => setEditing({...editing, subtitle: e.target.value})}
                    style={inputStyle} 
                    placeholder="সাবটাইটেল লিখুন"
                  />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div>
                    <label style={labelStyle}>কালার</label>
                    <input 
                      type="color"
                      value={editing.color} 
                      onChange={e => setEditing({...editing, color: e.target.value})}
                      style={{ width: '80px', height: '40px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>আইকন</label>
                    <input 
                      value={editing.icon} 
                      onChange={e => setEditing({...editing, icon: e.target.value})}
                      style={{...inputStyle, width: '80px', textAlign: 'center', fontSize: '28px'}}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => updateBanner(editing)} style={saveBtn}>
                    💾 সেভ করুন
                  </button>
                  <button onClick={() => setEditing(null)} style={cancelBtn}>
                    ❌ বাতিল
                  </button>
                </div>
              </div>
            ) : (
              // ===== ভিউ মোড =====
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  {/* আইকন প্রিভিউ */}
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '12px',
                    background: banner.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    color: 'white',
                  }}>
                    {banner.icon}
                  </div>
                  
                  {/* ব্যানার ইনফো */}
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#222' }}>
                      {banner.title}
                    </h3>
                    <p style={{ margin: '0 0 6px 0', color: '#666', fontSize: '14px' }}>
                      {banner.subtitle}
                    </p>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      background: banner.is_active ? '#e6f4ea' : '#fce8e6',
                      color: banner.is_active ? '#00a651' : '#e62e04',
                    }}>
                      {banner.is_active ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                  </div>
                </div>

                {/* অ্যাকশন বাটন */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    onClick={() => toggleActive(banner.id, banner.is_active)}
                    style={{
                      background: banner.is_active ? '#fce8e6' : '#e6f4ea',
                      color: banner.is_active ? '#e62e04' : '#00a651',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '12px',
                    }}
                  >
                    {banner.is_active ? '⏸ নিষ্ক্রিয়' : '▶ সক্রিয়'}
                  </button>
                  <button 
                    onClick={() => setEditing(banner)} 
                    style={editBtn}
                  >
                    ✏️ এডিট
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ব্যানার সংখ্যা */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '30px', 
        color: '#999', 
        fontSize: '13px' 
      }}>
        মোট ব্যানার: {banners.length} টি | অ্যাক্টিভ: {banners.filter(b => b.is_active).length} টি
      </div>
    </div>
  );
}

// ===== স্টাইল =====
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#555',
  marginBottom: '5px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '14px',
  outline: 'none',
  transition: 'border 0.2s',
};

const saveBtn: React.CSSProperties = {
  background: 'linear-gradient(135deg, #00a651, #00c853)',
  color: 'white',
  border: 'none',
  padding: '10px 24px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '14px',
  flex: 1,
};

const cancelBtn: React.CSSProperties = {
  background: '#f5f5f5',
  color: '#666',
  border: '1px solid #ddd',
  padding: '10px 24px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '14px',
  flex: 1,
};

const editBtn: React.CSSProperties = {
  background: '#1a73e8',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '13px',
};