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
          </div>
        </div>
      </div>
    );
  }

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
                filter: 'brightness(1.1) contrast(1.05) saturate(1.1)',
              }}>
              
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '15px' }}>
                {!banner.image_url && (
                  <span className="banner-icon" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>
                    {banner.icon}
                  </span>
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

        @media (min-width: 1024px) {
          .hero-banner {
            border-radius: 8px !important;
          }
          .banner-slide {
            height: ${activeBanners[0]?.banner_height || 350}px !important;
          }
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