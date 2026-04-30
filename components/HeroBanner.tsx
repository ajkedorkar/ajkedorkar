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
  // কোনো ব্যানার না থাকলে
  if (!banners || banners.length === 0) {
    return (
      <div className="hero-banner" style={{ 
        flex: 1, height: '200px', borderRadius: '4px', overflow: 'hidden', 
        background: '#e62e04', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '40px' }}>🛒</span>
          <h2 style={{ fontSize: '18px' }}>AjkeDorkar</h2>
          <p style={{ fontSize: '12px' }}>Welcome!</p>
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
          const pcHeight = banner.banner_height || 350;
          const showBtn = banner.show_button !== false;
          const btnText = banner.button_text || 'Shop Now';
          
          return (
            <div key={banner.id} 
              className="banner-slide"
              style={{ 
                minWidth: '100%', 
                height: '200px',  // মোবাইলের জন্য ফিক্সড 200px
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
              {/* ইমেজ ওভারলে */}
              {banner.image_url && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.35)',
                }} />
              )}
              
              {/* কন্টেন্ট */}
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '15px' }}>
                {!banner.image_url && (
                  <span className="banner-icon" style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>
                    {banner.icon}
                  </span>
                )}
                <h2 className="banner-title" style={{ 
                  margin: '0 0 6px 0', 
                  fontSize: '20px',
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
                    color: '#e62e04', 
                    border: 'none', 
                    padding: '8px 20px', 
                    borderRadius: '20px', 
                    fontWeight: '700', 
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                  }}>
                    {btnText}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CSS for responsive */}
      <style jsx>{`
        /* PC-তে ব্যানার বড় হবে */
        @media (min-width: 1024px) {
          .banner-slide {
            height: ${banners[0]?.banner_height || 350}px !important;
          }
          .banner-title {
            font-size: 28px !important;
          }
          .banner-subtitle {
            font-size: 15px !important;
          }
          .banner-btn {
            padding: 10px 28px !important;
            font-size: 14px !important;
          }
          .banner-icon {
            font-size: 60px !important;
          }
        }
      `}</style>
    </div>
  );
}