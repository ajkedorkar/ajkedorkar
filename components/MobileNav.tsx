"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  // ২০টি ক্যাটাগরি আইকন (Category বাটনের জন্য)
  const allCategories = [
    { icon: '🎯', slug: 'offer' }, { icon: '📱', slug: 'mobile' },
    { icon: '💻', slug: 'laptop' }, { icon: '⚡', slug: 'gadget' },
    { icon: '👗', slug: 'fashion' }, { icon: '🚗', slug: 'car' },
    { icon: '💼', slug: 'job' }, { icon: '🔧', slug: 'service' },
    { icon: '🏠', slug: 'property' }, { icon: '📢', slug: 'info' },
    { icon: '💑', slug: 'wedding' }, { icon: '🔑', slug: 'rent' },
    { icon: '🚑', slug: 'health' }, { icon: '🐄', slug: 'farm' },
    { icon: '🍪', slug: 'food' }, { icon: '🌾', slug: 'agri' },
    { icon: '🎁', slug: 'gift' }, { icon: '🔪', slug: 'craft' },
    { icon: '🏚️', slug: 'old' }, { icon: '🛠️', slug: 'home' },
  ];

  // মাঝখানের বাটনের জন্য প্রোডাক্ট আইকন
  const productIcons = ['🛍️', '📦', '🛒', '🏷️', '💰', '👕', '👞', '📺'];

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    }
    load();
  }, []);

  return (
    <div className="mobile-nav-premium">
      <div className="nav-content">
        
        {/* Home */}
        <div className="nav-item" onClick={() => router.push('/')}>
          <div className={`icon-only ${pathname === '/' ? 'active' : ''}`}>🏠</div>
        </div>

        {/* ১. Category বাটন (অ্যানিমেটেড ২০টি আইকন) */}
        <div className="nav-item" onClick={() => router.push('/category/mobile')}>
          <div className="animated-box orange-border">
            <div className="track slide-slow">
              {[...allCategories, ...allCategories].map((cat, i) => (
                <span key={i} className="slide-item">{cat.icon}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ২. মাঝখানের বাটন (প্রোডাক্ট আইকন) */}
        <div className="nav-item">
          <div className="animated-box gray-border">
            <div className="track slide-fast">
              {[...productIcons, ...productIcons].map((icon, i) => (
                <span key={i} className="slide-item">{icon}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ৩. Upload বাটন (এডজাস্ট করা সাইজ) */}
        <div className="nav-item" onClick={() => router.push('/mobile/upload')}>
          <div className="animated-box red-border">
            <div className="track text-slide">
              <span className="promo-text">পণ্য বিক্রয় করুন ৫% কমিশন — </span>
              <span className="promo-text">পণ্য বিক্রয় করুন ৫% কমিশন — </span>
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="nav-item" onClick={() => router.push(user ? '/account' : '/auth/login')}>
          <div className={`icon-only ${pathname.includes('account') ? 'active' : ''}`}>👤</div>
        </div>

      </div>

      <style jsx>{`
        .mobile-nav-premium {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: #ffffff;
          padding: 8px 0 calc(env(safe-area-inset-bottom) + 8px) 0;
          z-index: 10000;
          border-top: 1px solid #f0f0f0;
          box-shadow: 0 -5px 15px rgba(0,0,0,0.05);
        }
        .nav-content {
          display: flex;
          justify-content: space-around;
          align-items: center;
          max-width: 500px;
          margin: 0 auto;
        }
        .nav-item {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 20%;
          cursor: pointer;
        }
        
        /* সব বাটন এখন একদম সেম সাইজ (62px) */
        .animated-box {
          width: 62px; 
          height: 32px;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          position: relative;
          border: 1.5px solid transparent;
        }
        
        .orange-border { background: #fff5f0; border-color: #ff4d00; }
        .red-border { background: #fef2f2; border-color: #ef4444; }
        .gray-border { background: #f9fafb; border-color: #94a3b8; }

        .track { display: flex; white-space: nowrap; align-items: center; }
        
        /* অ্যানিমেশনগুলো */
        .slide-slow { gap: 18px; padding: 0 10px; animation: slideAll 25s linear infinite; }
        .slide-fast { gap: 15px; padding: 0 10px; animation: slideAll 15s linear infinite; }
        .text-slide { animation: slideAll 12s linear infinite; }

        @keyframes slideAll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .slide-item { font-size: 18px; flex-shrink: 0; }
        .promo-text { 
          font-size: 8px; 
          font-weight: 800; 
          color: #dc2626; 
          padding-right: 20px; 
          white-space: nowrap;
        }

        .icon-only { font-size: 24px; color: #94a3b8; transition: color 0.2s; }
        .icon-only.active { color: #ff4d00; }

        @media (min-width: 1024px) { .mobile-nav-premium { display: none !important; } }
      `}</style>
    </div>
  );
}