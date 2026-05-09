"use client";

import { useState, useEffect } from 'react';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  image_url?: string | null;
  banner_height?: number;
  show_button?: boolean;
  button_text?: string;
}

interface HeroBannerProps {
  banners: Banner[];
  currentBanner: number;
}

// ✅ ডিফল্ট ব্যানার - সার্ভার ও ক্লায়েন্ট সাইডে একই থাকবে
const DEFAULT_BANNER: Banner = {
  id: 0,
  title: 'AjkeDorkar',
  subtitle: 'Best Deals',
  color: '#e62e04',
  icon: '🛒',
};

export default function HeroBanner({ banners, currentBanner }: HeroBannerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ mounting এর সময় ডিফল্ট ব্যানার দেখাবে (কোন ফ্লিক নেই)
  if (!mounted) {
    return (
      <div className="hero-banner" style={{ 
        flex: 1, 
        overflow: 'hidden', 
        position: 'relative' 
      }}>
        <div className="banner-slide" style={{ 
          minWidth: '100%', 
          background: `linear-gradient(135deg, ${DEFAULT_BANNER.color}, ${DEFAULT_BANNER.color}cc)`,
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: 'white',
          position: 'relative',
          height: '200px'
        }}>
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '15px' }}>
            <span className="banner-icon" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>
              {DEFAULT_BANNER.icon}
            </span>
            <h2 className="banner-title" style={{ margin: '0 0 6px 0', fontWeight: '800' }}>
              {DEFAULT_BANNER.title}
            </h2>
            <p className="banner-subtitle" style={{ fontSize: '13px', margin: '0 0 10px 0' }}>
              {DEFAULT_BANNER.subtitle}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ব্যানার না থাকলে ডিফল্ট
  const activeBanners = (!banners || banners.length === 0) ? [DEFAULT_BANNER] : banners;
  const activeCurrentBanner = (!banners || banners.length === 0) ? 0 : currentBanner;

  return (
    <div className="hero-banner" style={{ 
      flex: 1, 
      overflow: 'hidden', 
      position: 'relative' 
    }}>
      <div style={{ 
        display: 'flex', 
        height: '100%', 
        transition: 'transform 0.5s ease', 
        transform: `translateX(-${activeCurrentBanner * 100}%)` 
      }}>
        {activeBanners.map((banner) => {
          const showBtn = banner.show_button !== false;
          const btnText = banner.button_text || 'Shop Now';
          
          return (
            <div key={banner.id} 
              className="banner-slide"
              style={{ 
                minWidth: '100%', 
                background: banner.image_url 
                  ? `url(${banner.image_url}) center/cover no-repeat` 
                  : `linear-gradient(135deg, ${banner.color}, ${banner.color}cc)`, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                position: 'relative',
              }}>
              
              {banner.image_url && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.35)',
                }} />
              )}
              
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '15px' }}>
                {!banner.image_url && (
                  <span className="banner-icon" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>
                    {banner.icon}
                  </span>
                )}
                <h2 className="banner-title" style={{ 
                  margin: '0 0 6px 0', 
                  fontWeight: '800',
                  textShadow: banner.image_url ? '0 2px 10px rgba(0,0,0,0.6)' : 'none',
                }}>
                  {banner.title}
                </h2>
                <p className="banner-subtitle" style={{ 
                  fontSize: '13px',
                  margin: '0 0 10px 0',
                  textShadow: banner.image_url ? '0 1px 5px rgba(0,0,0,0.6)' : 'none',
                }}>
                  {banner.subtitle}
                </p>
                
                {showBtn && (
                  <button className="banner-btn" style={{
                    background: 'white',
                    color: banner.color,
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '25px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '5px',
                  }}>
                    {btnText}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        .banner-slide { 
          height: 200px !important; 
        }
        .banner-title { font-size: 20px; }
        .banner-subtitle { font-size: 13px; }

        @media (min-width: 1024px) {
          .hero-banner {
            border-radius: 8px !important;
          }
          .banner-slide {
            height: ${activeBanners[0]?.banner_height || 350}px !important;
          }
          .banner-title { font-size: 28px !important; }
          .banner-subtitle { font-size: 15px !important; }
          .banner-btn { padding: 10px 28px !important; font-size: 14px !important; }
          .banner-icon { font-size: 60px !important; }
        }
        
        @media (max-width: 1023px) {
          .hero-banner {
            border-radius: 0px !important;
          }
        }
      `}</style>
    </div>
  );
}