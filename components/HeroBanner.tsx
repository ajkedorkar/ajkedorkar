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
        position: 'relative',
        background: 'transparent'
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
    <div className="hero-banner">
      <div className="slider-track" style={{ 
        transform: `translateX(-${activeCurrentBanner * 100}%)`,
      }}>
        {activeBanners.map((banner) => {
          return (
            <div key={banner.id} 
              className="banner-slide"
              style={{ 
                /* 🎯 ফিক্স ১: ইমেজ থাকলে ব্যাকগ্রাউন্ড একদম ট্রান্সপারেন্ট, না থাকলে সলিড কালার */
                background: banner.image_url ? 'transparent' : (banner.color || '#e62e04'),
              }}>
              
              {/* 🎯 ফিক্স ২: ইনলাইন ব্যাকগ্রাউন্ডের ঝামেলা বাদ দিয়ে সরাসরি <img> ট্যাগ, যা অবজেক্ট-ফিট কাভার মেনে চলবে */}
              {banner.image_url && (
                <img 
                  src={banner.image_url} 
                  alt={banner.title} 
                  className="banner-pure-img"
                />
              )}
              
              <div className="banner-content-box">
                {!banner.image_url && (
                  <>
                    <span className="banner-icon" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>
                      {banner.icon}
                    </span>
                    <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '5px 0' }}>{banner.title}</h2>
                    <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 10px 0' }}>{banner.subtitle}</p>
                    {(banner.show_button ?? true) && (
                      <button style={{
                        marginTop: '5px', background: 'white', color: '#222', border: 'none',
                        padding: '6px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer'
                      }}>
                        {banner.button_text || "Shop Now"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <style jsx>{`
        /* 🎯 মেইন গ্লোবাল কন্টেইনার ফিক্স */
        .hero-banner {
          flex: 1; 
          overflow: hidden; 
          position: relative;
          width: 100%;
          background: transparent !important;
        }

        .slider-track {
          display: flex; 
          height: 100%; 
          transition: transform 0.5s ease; 
          background: transparent !important;
        }

        .banner-slide { 
          min-width: 100%; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          color: white;
          position: relative;
          overflow: hidden;
          background: transparent !important;
        }

        /* 🚀 ফিক্স ৩: ইমেজকে পুরো কন্টেইনারের আনাচে-কানাচে জোর করে ফিট করানোর ম্যাজিক সিএসএস */
        .banner-pure-img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important; 
          object-position: center !important;
          z-index: 1;
          filter: brightness(1.1) contrast(1.05) saturate(1.1);
        }

        .banner-content-box {
          position: relative; 
          z-index: 2; 
          text-align: center; 
          padding: 15px;
        }

        /* 📱 ডিফল্ট মোবাইল হাইট ২০০px (একদম আগের মতোই সেফ) */
        @media (max-width: 1023px) {
          .hero-banner {
            border-radius: 0px !important;
          }
          .banner-slide { 
            height: 200px !important; 
          }
        }

        /* 💻 পিসি সাইজ: সুপাবেস থেকে আসা ৪২০px এখানে মাখনের মতো লক হবে */
        @media (min-width: 1024px) {
          .hero-banner {
            border-radius: 8px !important;
          }
          .banner-slide {
            /* 🚀 সুপাবেসের নতুন ৪২০px ভ্যালু এখানে নিখুঁতভাবে বসবে */
            height: ${activeBanners[0]?.banner_height || 420}px !important; 
          }
          .banner-icon { font-size: 60px !important; }
        }
      `}</style>
    </div>
  );
}