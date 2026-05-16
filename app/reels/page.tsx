"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ==================== এম্বেড URL জেনারেটর ====================
function getEmbedUrl(reel: any) {
  if (reel.platform === 'youtube') {
    return `https://www.youtube.com/embed/${reel.video_id}?autoplay=1&mute=0&loop=1&playlist=${reel.video_id}`;
  }
  if (reel.platform === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/${reel.video_id}&show_text=false&autoplay=true&width=476`;
  }
  if (reel.platform === 'tiktok') {
    return `https://www.tiktok.com/embed/v2/${reel.video_id}`;
  }
  return '';
}

// ==================== প্রোডাক্ট ডাটা ফেচ ====================
async function getProductInfo(productId: number) {
  if (!productId) return null;
  const { data } = await supabase.from('products').select('id, title, price, image_url').eq('id', productId).single();
  return data;
}

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productInfo, setProductInfo] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from('reels').select('*').order('id').then(({ data }) => {
      if (data) setReels(data);
      setLoading(false);
    });
  }, []);

  // বর্তমান রিলের প্রোডাক্ট লোড
  useEffect(() => {
    if (reels.length === 0) return;
    const currentReel = reels[currentIndex];
    if (currentReel?.product_id) {
      getProductInfo(currentReel.product_id).then(data => setProductInfo(data));
    } else {
      setProductInfo(null);
    }
  }, [currentIndex, reels]);

  // মোবাইল: স্ক্রল/সোয়াইপ
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 40 && currentIndex < reels.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (e.deltaY < -40 && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, reels.length]);

  // PC: কি-বোর্ড
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentIndex < reels.length - 1) setCurrentIndex(prev => prev + 1);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, reels.length]);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleKeyDown]);

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', fontSize: '18px' }}>⏳ লোড হচ্ছে...</div>;
  if (reels.length === 0) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', fontSize: '18px' }}>🎬 কোনো রিল নেই!</div>;

  const currentReel = reels[currentIndex];

  return (
    <div style={{ height: '100vh', background: '#000', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* ====== PC Layout ====== */}
      <div className="reel-pc-container">
        <div style={{ display: 'flex', height: '100vh', maxWidth: '1200px', margin: '0 auto', alignItems: 'center', gap: '40px', padding: '0 20px' }}>
          
          {/* ভিডিও সেকশন */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '420px', height: '75vh', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 0 30px rgba(255,255,255,0.1)', position: 'relative' }}>
              <iframe
                src={getEmbedUrl(currentReel)}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; fullscreen"
                allowFullScreen
              />
              {/* ⚡ AjkeReels ব্র্যান্ডিং */}
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', borderRadius: '8px', padding: '4px 10px', color: 'white', fontSize: '10px', fontWeight: '700' }}>
                ⚡ AjkeReels
              </div>
            </div>
          </div>

          {/* প্রোডাক্ট কার্ড (PC) */}
          {productInfo && (
            <div style={{ width: '300px', background: '#1a1a1a', borderRadius: '16px', padding: '24px', color: 'white' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>🛍️ ফিচার্ড প্রোডাক্ট</h3>
              {productInfo.image_url && (
                <img src={productInfo.image_url} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }} alt="" />
              )}
              <p style={{ margin: 0, fontSize: '14px', color: '#ccc' }}>{productInfo.title}</p>
              <p style={{ margin: '4px 0', fontSize: '22px', fontWeight: '700', color: '#FFB347' }}>৳ {productInfo.price?.toLocaleString()}</p>
              <button onClick={() => window.open(`/product/${productInfo.id}`, '_blank')} style={{ marginTop: '12px', width: '100%', padding: '12px', background: '#FFB347', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
                🛒 কিনুন
              </button>
            </div>
          )}
        </div>

        {/* PC নেভিগেশন ডটস */}
        <div style={{ position: 'fixed', right: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {reels.map((_, i) => (
            <div key={i} onClick={() => setCurrentIndex(i)} style={{
              width: i === currentIndex ? '4px' : '3px',
              height: i === currentIndex ? '24px' : '16px',
              borderRadius: '2px',
              background: i === currentIndex ? '#A78BFA' : 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }} />
          ))}
        </div>
      </div>

      {/* ====== Mobile Layout ====== */}
      <div className="reel-mobile-container">
        <div ref={containerRef} style={{ position: 'relative', height: '100vh', width: '100%' }}>
          <div style={{
            transform: `translateY(-${currentIndex * 100}vh)`,
            transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          }}>
            {reels.map((reel, index) => (
              <div key={index} style={{ height: '100vh', position: 'relative', background: '#000' }}>
                <iframe
                  src={getEmbedUrl(reel)}
                  style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
                
                {/* ⚡ AjkeReels ব্র্যান্ডিং (মোবাইল) */}
                <div style={{ position: 'absolute', top: '16px', left: '12px', background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', borderRadius: '8px', padding: '5px 12px', color: 'white', fontSize: '11px', fontWeight: '700', zIndex: 10 }}>
                  ⚡ AjkeReels
                </div>

                {/* প্রোডাক্ট ট্যাগ (মোবাইল) */}
                {reel.product_id && productInfo && index === currentIndex && (
                  <div style={{
                    position: 'absolute', bottom: '20px', left: '12px', right: '12px',
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                    borderRadius: '12px', padding: '12px', color: 'white', zIndex: 10
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ margin: 0, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{productInfo.title}</p>
                        <p style={{ margin: '2px 0', fontSize: '15px', fontWeight: '700', color: '#FFB347' }}>৳ {productInfo.price?.toLocaleString()}</p>
                      </div>
                      <button onClick={() => window.open(`/product/${productInfo.id}`, '_blank')} style={{ flexShrink: 0, padding: '8px 16px', background: '#A78BFA', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '11px' }}>
                        কিনুন
                      </button>
                    </div>
                  </div>
                )}

                {/* ডান পাশের বাটন (মোবাইল) */}
                <div style={{ position: 'absolute', right: '10px', bottom: '120px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', zIndex: 10 }}>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <span style={{ fontSize: '22px' }}>❤️</span>
                    <p style={{ margin: 0, fontSize: '9px' }}>১২.৩K</p>
                  </div>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <span style={{ fontSize: '22px' }}>💬</span>
                    <p style={{ margin: 0, fontSize: '9px' }}>৪৫৬</p>
                  </div>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <span style={{ fontSize: '22px' }}>📤</span>
                    <p style={{ margin: 0, fontSize: '9px' }}>শেয়ার</p>
                  </div>
                  <div style={{ textAlign: 'center', color: 'white' }}>
                    <span style={{ fontSize: '22px' }}>🛒</span>
                    <p style={{ margin: 0, fontSize: '9px' }}>কিনুন</p>
                  </div>
                </div>

                {/* প্রগ্রেস বার */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.2)', zIndex: 10 }}>
                  <div style={{
                    width: index === currentIndex ? '100%' : '0%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #7C3AED, #A78BFA)',
                    transition: index === currentIndex ? 'width 10s linear' : 'none',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .reel-pc-container { display: none; }
        .reel-mobile-container { display: block; }
        
        @media (min-width: 1024px) {
          .reel-pc-container { display: block !important; }
          .reel-mobile-container { display: none !important; }
        }
      `}</style>
    </div>
  );
}