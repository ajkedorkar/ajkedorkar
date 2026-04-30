"use client";

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

export default function HeroBanner({ banners, currentBanner }: HeroBannerProps) {
  if (!banners || banners.length === 0) {
    return (
      <div className="hero-banner" style={{ 
        flex: 1, height: '350px', borderRadius: '4px', overflow: 'hidden', 
        background: '#e62e04', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '60px' }}>🛒</span>
          <h2>AjkeDorkar</h2>
          <p>Welcome to the best online shop!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-banner" style={{ 
      flex: 1, 
      borderRadius: '4px', 
      overflow: 'hidden', 
      position: 'relative' 
    }}>
      <div style={{ 
        display: 'flex', 
        height: '100%', 
        transition: 'transform 0.5s ease', 
        transform: `translateX(-${currentBanner * 100}%)` 
      }}>
        {banners.map(banner => {
          const height = banner.banner_height || 350;
          const showBtn = banner.show_button !== false;
          const btnText = banner.button_text || 'Shop Now';
          
          return (
            <div key={banner.id} style={{ 
              minWidth: '100%', 
              height: `${height}px`,
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
              
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '20px' }}>
                {!banner.image_url && (
                  <span style={{ fontSize: '60px', display: 'block', marginBottom: '10px' }}>
                    {banner.icon}
                  </span>
                )}
                <h2 style={{ 
                  margin: '0 0 10px 0', 
                  fontSize: banner.image_url ? '34px' : '24px',
                  fontWeight: '800',
                  textShadow: banner.image_url ? '0 2px 10px rgba(0,0,0,0.6)' : 'none',
                }}>
                  {banner.title}
                </h2>
                <p style={{ 
                  fontSize: '15px', 
                  margin: '0 0 15px 0',
                  textShadow: banner.image_url ? '0 1px 5px rgba(0,0,0,0.6)' : 'none',
                }}>
                  {banner.subtitle}
                </p>
                {showBtn && (
                  <button style={{ 
                    background: 'white', 
                    color: '#e62e04', 
                    border: 'none', 
                    padding: '10px 28px', 
                    borderRadius: '25px', 
                    fontWeight: '700', 
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                    transition: 'transform 0.2s',
                  }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'}
                  >
                    {btnText}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}