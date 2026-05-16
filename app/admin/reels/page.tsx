"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ReelsAdminPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    platform: 'youtube',
    video_url: '',
    title: '',
    product_id: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    loadReels();
    loadProducts();
  }, []);

  async function loadReels() {
    setLoading(true);
    const { data } = await supabase.from('reels').select('*').order('id', { ascending: false });
    if (data) setReels(data);
    setLoading(false);
  }

  async function loadProducts() {
    const { data } = await supabase.from('products').select('id, title, price, category').order('id');
    if (data) setProducts(data);
  }

  function extractVideoId(url: string, platform: string): string {
    if (!url) return '';
    
    if (platform === 'youtube') {
      const match = url.match(/shorts\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : url;
    }
    if (platform === 'facebook') {
      const match = url.match(/reel\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : url;
    }
    if (platform === 'tiktok') {
      const match = url.match(/video\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : url;
    }
    return url;
  }

  function getEmbedUrl(reel: any): string {
    if (reel.platform === 'youtube') {
      return `https://www.youtube.com/embed/${reel.video_id}`;
    }
    if (reel.platform === 'facebook') {
      return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/${reel.video_id}&show_text=false`;
    }
    if (reel.platform === 'tiktok') {
      return `https://www.tiktok.com/embed/${reel.video_id}`;
    }
    return '';
  }

  function getPlatformLabel(platform: string): string {
    if (platform === 'youtube') return '🎬 YouTube';
    if (platform === 'facebook') return '📹 Facebook';
    if (platform === 'tiktok') return '📱 TikTok';
    return platform;
  }

  async function saveReel() {
    if (!form.video_url || !form.title) return alert('ভিডিও URL ও টাইটেল দাও!');

    const videoId = extractVideoId(form.video_url, form.platform);
    
    if (!videoId) return alert('ভিডিও ID বের করা যায়নি! URL চেক করুন!');
    
    const data: any = {
      platform: form.platform,
      video_id: videoId,
      title: form.title,
      product_id: form.product_id ? parseInt(form.product_id) : null,
    };

    if (editingId) {
      await supabase.from('reels').update(data).eq('id', editingId);
      alert('✅ রিল আপডেট হয়েছে!');
    } else {
      await supabase.from('reels').insert(data);
      alert('✅ নতুন রিল যোগ হয়েছে!');
    }

    setForm({ platform: 'youtube', video_url: '', title: '', product_id: '' });
    setShowForm(false);
    setEditingId(null);
    loadReels();
  }

  async function deleteReel(id: number) {
    if (!confirm('ডিলিট করবেন?')) return;
    await supabase.from('reels').delete().eq('id', id);
    loadReels();
    alert('🗑️ ডিলিট হয়েছে!');
  }

  function editReel(reel: any) {
    let url = '';
    if (reel.platform === 'youtube') url = `https://www.youtube.com/shorts/${reel.video_id}`;
    else if (reel.platform === 'facebook') url = `https://www.facebook.com/reel/${reel.video_id}`;
    else if (reel.platform === 'tiktok') url = `https://www.tiktok.com/@user/video/${reel.video_id}`;
    
    setForm({
      platform: reel.platform || 'youtube',
      video_url: url,
      title: reel.title || '',
      product_id: reel.product_id ? String(reel.product_id) : '',
    });
    setEditingId(reel.id);
    setShowForm(true);
  }

  const [previewReel, setPreviewReel] = useState<any>(null);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      
      {/* হেডার */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
        padding: '20px 24px', borderRadius: '16px', color: 'white', marginBottom: '20px',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, fontWeight: '800' }}>🎬 AjkeReels ম্যানেজমেন্ট</h1>
          <p style={{ fontSize: '12px', margin: '4px 0 0', opacity: 0.9 }}>
            {reels.length}টি রিল • YouTube | Facebook | TikTok
          </p>
        </div>
        <button onClick={() => { setForm({ platform: 'youtube', video_url: '', title: '', product_id: '' }); setEditingId(null); setShowForm(!showForm); }} style={{
          background: 'white', color: '#7C3AED', border: 'none',
          padding: '10px 20px', borderRadius: '10px', cursor: 'pointer',
          fontWeight: '700', fontSize: '14px',
        }}>
          ➕ {showForm ? 'ফর্ম বন্ধ' : 'নতুন রিল'}
        </button>
      </div>

      {/* ফর্ম */}
      {showForm && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '14px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>{editingId ? '✏️ এডিট রিল' : '➕ নতুন রিল যোগ'}</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            
            {/* প্ল্যাটফর্ম সিলেক্ট */}
            <div>
              <label style={lbl}>🌐 প্ল্যাটফর্ম</label>
              <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} style={inp}>
                <option value="youtube">🎬 YouTube Shorts</option>
                <option value="facebook">📹 Facebook Reels</option>
                <option value="tiktok">📱 TikTok</option>
              </select>
            </div>

            {/* ভিডিও URL */}
            <div>
              <label style={lbl}>🔗 ভিডিও URL *</label>
              <input 
                value={form.video_url} 
                onChange={e => setForm({...form, video_url: e.target.value})} 
                placeholder={
                  form.platform === 'youtube' ? 'https://www.youtube.com/shorts/...' :
                  form.platform === 'facebook' ? 'https://www.facebook.com/reel/...' :
                  'https://www.tiktok.com/@user/video/...'
                }
                style={inp} 
              />
              <p style={{ fontSize: '10px', color: '#888', margin: '2px 0 0' }}>
                {form.platform === 'youtube' && 'ইউটিউব Shorts-এর URL পেস্ট করুন'}
                {form.platform === 'facebook' && 'ফেসবুক Reels-এর URL পেস্ট করুন'}
                {form.platform === 'tiktok' && 'TikTok ভিডিওর URL পেস্ট করুন'}
              </p>
            </div>

            {/* টাইটেল */}
            <div>
              <label style={lbl}>📝 টাইটেল *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inp} />
            </div>

            {/* প্রোডাক্ট সিলেক্ট */}
            <div>
              <label style={lbl}>🛍️ প্রোডাক্ট লিংক (অপশনাল)</label>
              <select value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} style={inp}>
                <option value="">কোনো প্রোডাক্ট না</option>
                {products.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.title} - ৳{p.price}</option>
                ))}
              </select>
            </div>

            {/* বাটন */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={saveReel} style={{ flex: 1, padding: '12px', background: '#7C3AED', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                {editingId ? '💾 আপডেট' : '💾 সেভ'}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ flex: 1, padding: '12px', background: '#f5f5f5', color: '#666', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}>
                ❌ বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* রিল লিস্ট */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>⏳ লোড হচ্ছে...</div>
      ) : reels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#999' }}>
          🎬 কোনো রিল নেই! নতুন যোগ করুন!
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {reels.map((reel: any) => (
            <div key={reel.id} style={{
              background: 'white', borderRadius: '10px', padding: '14px 16px',
              border: '1px solid #e8eaed', display: 'flex', flexWrap: 'wrap',
              gap: '12px', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{
                  width: '60px', height: '80px', background: '#1a1a1a', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '24px',
                }}>
                  {reel.platform === 'youtube' ? '▶️' : reel.platform === 'facebook' ? '📹' : '📱'}
                </div>
                <div>
                  <strong style={{ fontSize: '14px' }}>{reel.title}</strong>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                    {getPlatformLabel(reel.platform)} | ID: {reel.video_id}
                  </div>
                  {reel.product_id && (
                    <span style={{ fontSize: '10px', background: '#F3E8FF', color: '#7C3AED', padding: '2px 8px', borderRadius: '8px' }}>
                      🛍️ প্রোডাক্ট #{reel.product_id}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setPreviewReel(reel)} style={{ background: '#f0f0f0', color: '#666', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>👁️</button>
                <button onClick={() => editReel(reel)} style={{ background: '#E8E0FF', color: '#7C3AED', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>✏️</button>
                <button onClick={() => deleteReel(reel.id)} style={{ background: '#FCE8E6', color: '#E53935', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* প্রিভিউ মোডাল */}
      {previewReel && (
        <div onClick={() => setPreviewReel(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 200,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: '14px', padding: '20px',
            maxWidth: '450px', width: '100%', maxHeight: '80vh',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>👁️ {previewReel.title}</h3>
              <button onClick={() => setPreviewReel(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
              <iframe
                src={getEmbedUrl(previewReel)}
                style={{ width: '100%', height: '400px', border: 'none' }}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
            <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
              {getPlatformLabel(previewReel.platform)} | ID: {previewReel.video_id}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#444', marginBottom: '4px' };
const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };