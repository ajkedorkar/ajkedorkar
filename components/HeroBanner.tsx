"use client";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
}

interface HeroBannerProps {
  banners: Banner[];
  currentBanner: number;
}

export default function HeroBanner({ banners, currentBanner }: HeroBannerProps) {
  return (
    <div className="hero-banner" style={{ flex: 1, height: '350px', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
      <div style={{ display: 'flex', height: '100%', transition: 'transform 0.5s ease', transform: `translateX(-${currentBanner * 100}%)` }}>
        {banners.map(banner => (
          <div key={banner.id} style={{ 
            minWidth: '100%', background: banner.color, 
            display: 'flex', flexDirection: 'column', 
            alignItems: 'center', justifyContent: 'center', color: 'white' 
          }}>
            <span style={{ fontSize: '60px' }}>{banner.icon}</span>
            <h2 style={{ margin: '10px 0' }}>{banner.title}</h2>
            <p style={{ fontSize: '14px' }}>{banner.subtitle}</p>
            <button style={{ 
              marginTop: '10px', background: 'white', color: banner.color, 
              border: 'none', padding: '8px 20px', borderRadius: '20px', 
              fontWeight: '700', cursor: 'pointer' 
            }}>
              Shop Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}