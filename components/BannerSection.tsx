"use client";

import { useState, useEffect } from 'react';
import HeroBanner from './HeroBanner';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  image_url?: string;
  banner_height?: number;
  show_button?: boolean;
  button_text?: string;
}

interface BannerSectionProps {
  banners: Banner[];
}

export default function BannerSection({ banners }: BannerSectionProps) {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;
    const slider = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(slider);
  }, [banners]);

  const handleBannerClick = () => {
    const b = banners[currentBanner];
    if (b) alert(`🎯 ${b.title}\n${b.subtitle}`);
  };

  const handleSwipe = (dir: 'left' | 'right') => {
    if (banners.length === 0) return;
    if (dir === 'left') setCurrentBanner(prev => (prev + 1) % banners.length);
    else setCurrentBanner(prev => (prev - 1 + banners.length) % banners.length);
  };

  // ডিফল্ট ব্যানার (Supabase খালি থাকলে)
  const displayBanners = banners.length > 0 ? banners : [
    { id: 1, title: 'AjkeDorkar', subtitle: 'Best Deals in Bangladesh', color: '#e62e04', icon: '🛒' },
  ];

  return (
    <div style={{ flex: 1 }}>
      <div style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden' }}>
        <HeroBanner banners={displayBanners} currentBanner={currentBanner} />
        
        {/* নেভিগেশন */}
        <button onClick={() => handleSwipe('right')} style={{
          position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.4)', border: 'none', color: 'white',
          width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', zIndex: 10,
        }}>‹</button>
        <button onClick={() => handleSwipe('left')} style={{
          position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.4)', border: 'none', color: 'white',
          width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', zIndex: 10,
        }}>›</button>
      </div>

      {/* ডট ইন্ডিকেটর */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', padding: '8px 0' }}>
        {displayBanners.map((_, i) => (
          <div key={i} onClick={() => setCurrentBanner(i)} style={{
            width: i === currentBanner ? '18px' : '6px', height: '6px', borderRadius: '3px',
            background: i === currentBanner ? '#e62e04' : '#ccc',
            transition: 'all 0.3s', cursor: 'pointer',
          }} />
        ))}
      </div>

      {/* টেক্সট বার */}
      {displayBanners.length > 0 && (
        <div onClick={handleBannerClick} style={{
          background: `linear-gradient(90deg, ${displayBanners[currentBanner]?.color || '#e62e04'}, ${displayBanners[currentBanner]?.color || '#e62e04'}dd)`,
          borderRadius: '0 0 8px 8px', padding: '10px 16px',
          textAlign: 'center', cursor: 'pointer',
        }}>
          <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '800', margin: 0 }}>
            {displayBanners[currentBanner]?.title || 'AjkeDorkar'}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', margin: '3px 0 0 0' }}>
            {displayBanners[currentBanner]?.subtitle || 'Best Deals'} 🔥
          </p>
        </div>
      )}
    </div>
  );
}