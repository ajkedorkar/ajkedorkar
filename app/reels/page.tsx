"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ==================== এম্বেড URL জেনারেটর ====================
function getEmbedUrl(reel: any) {
  const base = reel?.video_id || '';
  if (reel.platform === 'youtube') {
    return `https://www.youtube.com/embed/${base}?autoplay=1&mute=0&loop=0&controls=1&modestbranding=1&rel=0&showinfo=0&enablejsapi=1`;
  }
  if (reel.platform === 'facebook') {
    return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/${base}&show_text=false&autoplay=true&width=476`;
  }
  if (reel.platform === 'tiktok') {
    return `https://www.tiktok.com/embed/v2/${base}?autoplay=1&mute=0`;
  }
  return '';
}

// ==================== প্রোডাক্ট ডাটা ফেচ ====================
async function getProductInfo(productId: number) {
  if (!productId) return null;
  const { data } = await supabase.from('products').select('id, title, price, image_url').eq('id', productId).single();
  return data;
}

// ==================== গ্লাস বাটন কম্পোনেন্ট ====================
function GlassButton({ emoji, label, count, onClick, active }: { 
  emoji: string; label: string; count?: string; onClick?: () => void; active?: boolean;
}) {
  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <div onClick={onClick} style={{
        width: '44px', height: '44px',
        background: active ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        border: active ? '2px solid #FFB347' : '1px solid rgba(255,255,255,0.18)',
        transition: 'all 0.2s',
        margin: '0 auto',
      }}>
        <span style={{ fontSize: '20px' }}>{emoji}</span>
      </div>
      {count && <p style={{ margin: '2px 0 0', fontSize: '9px', fontWeight: '600' }}>{count}</p>}
      <p style={{ margin: '0', fontSize: '8px', color: 'rgba(255,255,255,0.7)' }}>{label}</p>
    </div>
  );
}

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [productInfo, setProductInfo] = useState<any>(null);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [showShare, setShowShare] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  useEffect(() => {
    supabase.from('reels').select('*').order('id').then(({ data }) => {
      if (data) setReels(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (reels.length === 0) return;
    const currentReel = reels[currentIndex];
    if (currentReel?.product_id) {
      getProductInfo(currentReel.product_id).then(data => setProductInfo(data));
    } else {
      setProductInfo(null);
    }
  }, [currentIndex, reels]);

  // লাইক টগল
  const toggleLike = (index: number) => {
    setLiked(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // শেয়ার
  const handleShare = async () => {
    const reel = reels[currentIndex];
    const url = `https://www.youtube.com/shorts/${reel?.video_id}`;
    if (navigator.share) {
      await navigator.share({ title: reel?.title, url });
    } else {
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  };

  // কমেন্ট — ইউটিউবে ওপেন
  const openComments = () => {
    const reel = reels[currentIndex];
    window.open(`https://www.youtube.com/shorts/${reel?.video_id}`, '_blank');
  };

  // কিনুন — প্রোডাক্ট পেজ
  const buyProduct = () => {
    if (productInfo) {
      window.open(`/product/${productInfo.id}`, '_blank');
    }
  };

  const goNext = () => {
    if (currentIndex < reels.length - 1) setCurrentIndex(prev => prev + 1);
  };
  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  // টাচ সোয়াইপ
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 50) goNext();
    else if (diff < -50) goPrev();
  };

  // মাউস হুইল
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 40) goNext();
    else if (e.deltaY < -40) goPrev();
  }, [currentIndex, reels.length]);

  // কি-বোর্ড
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
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
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '420px', height: '75vh', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 0 30px rgba(255,255,255,0.1)', position: 'relative' }}>
              <iframe src={getEmbedUrl(currentReel)} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay; fullscreen" allowFullScreen />
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', borderRadius: '8px', padding: '4px 10px', color: 'white', fontSize: '10px', fontWeight: '700' }}>⚡ AjkeReels</div>
              
              {/* PC বাটন */}
              <div style={{ position: 'absolute', right: '10px', bottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <GlassButton emoji={liked[currentIndex] ? '❤️' : '🤍'} label="লাইক" count="১২.৩K" onClick={() => toggleLike(currentIndex)} active={liked[currentIndex]} />
                <GlassButton emoji="💬" label="কমেন্ট" count="৪৫৬" onClick={openComments} />
                <GlassButton emoji="📤" label="শেয়ার" onClick={handleShare} />
                {productInfo && <GlassButton emoji="🛒" label="কিনুন" onClick={buyProduct} />}
              </div>
            </div>
          </div>

          {productInfo && (
            <div style={{ width: '300px', background: '#1a1a1a', borderRadius: '16px', padding: '24px', color: 'white' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>🛍️ ফিচার্ড প্রোডাক্ট</h3>
              {productInfo.image_url && <img src={productInfo.image_url} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px', marginBottom: '12px' }} alt="" />}
              <p>{productInfo.title}</p>
              <p style={{ fontSize: '22px', fontWeight: '700', color: '#FFB347' }}>৳ {productInfo.price?.toLocaleString()}</p>
              <button onClick={buyProduct} style={{ marginTop: '12px', width: '100%', padding: '12px', background: '#FFB347', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>🛒 কিনুন</button>
            </div>
          )}
        </div>
      </div>

      {/* ====== Mobile Layout ====== */}
      <div className="reel-mobile-container">
        <div ref={containerRef} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
          style={{ position: 'relative', height: '100vh', width: '100%', touchAction: 'pan-y' }}>
          <div style={{ transform: `translateY(-${currentIndex * 100}vh)`, transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }}>
            {reels.map((reel, index) => (
              <div key={index} style={{ height: '100vh', position: 'relative', background: '#000' }}>
                {index === currentIndex && (
                  <iframe src={getEmbedUrl(reel)} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay; fullscreen" allowFullScreen />
                )}
                
                {/* AjkeReels ব্র্যান্ডিং */}
                <div style={{ position: 'absolute', top: '16px', left: '12px', background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', borderRadius: '10px', padding: '6px 14px', color: 'white', fontSize: '13px', fontWeight: '800', zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>⚡ AjkeReels</div>

                {/* প্রোডাক্ট ট্যাগ */}
                {reel.product_id && productInfo && index === currentIndex && (
                  <div style={{ position: 'absolute', bottom: '20px', left: '12px', right: '80px', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', borderRadius: '12px', padding: '12px', color: 'white', zIndex: 10 }}>
                    <p style={{ margin: 0, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{productInfo.title}</p>
                    <p style={{ margin: '2px 0', fontSize: '15px', fontWeight: '700', color: '#FFB347' }}>৳ {productInfo.price?.toLocaleString()}</p>
                    <button onClick={buyProduct} style={{ marginTop: '6px', padding: '6px 14px', background: '#A78BFA', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '11px' }}>কিনুন</button>
                  </div>
                )}

                {/* বাটন গ্রুপ — গ্লাসমরফিক */}
                <div style={{ position: 'absolute', right: '8px', bottom: '100px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', zIndex: 10 }}>
                  <GlassButton emoji={liked[index] ? '❤️' : '🤍'} label="লাইক" count="১২.৩K" onClick={() => toggleLike(index)} active={liked[index]} />
                  <GlassButton emoji="💬" label="কমেন্ট" count="৪৫৬" onClick={openComments} />
                  <GlassButton emoji="📤" label="শেয়ার" onClick={handleShare} />
                  {productInfo && <GlassButton emoji="🛒" label="কিনুন" onClick={buyProduct} />}
                </div>

                {/* প্রগ্রেস বার */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'rgba(255,255,255,0.2)', zIndex: 10 }}>
                  <div style={{ width: index === currentIndex ? '100%' : '0%', height: '100%', background: 'linear-gradient(90deg, #7C3AED, #A78BFA)', transition: index === currentIndex ? 'width 10s linear' : 'none' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* শেয়ার কপি নোটিফিকেশন */}
        {showShare && (
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.9)', color: 'white', padding: '12px 24px', borderRadius: '10px', zIndex: 999, fontSize: '13px' }}>🔗 লিংক কপি হয়েছে!</div>
        )}
      </div>

      <style jsx global>{`
        .reel-pc-container { display: none; }
        .reel-mobile-container { display: block; }
        @media (min-width: 1024px) { .reel-pc-container { display: block !important; } .reel-mobile-container { display: none !important; } }
      `}</style>
    </div>
  );
}