"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

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

  const productIcons = ['🛍️', '📦', '🛒', '🏷️', '💰', '👕', '👞', '📺'];

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
    load();
  }, []);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'ইউজার';

  return (
    <div className="mobile-nav-premium">
      <div className="nav-content">
        
        {/* হোম বাটন - ইউনিক পালস অ্যানিমেশন */}
        <div className="nav-item" onClick={() => router.push('/')}>
          <div className={`home-btn-unique ${pathname === '/' ? 'active' : ''}`}>
            <span className="home-icon">🏠</span>
            {pathname === '/' && <span className="pulse-ring"></span>}
          </div>
        </div>

        {/* ১. Category বাটন */}
        <div className="nav-item" onClick={() => router.push('/category/mobile')}>
          <div className="animated-box orange-border">
            <div className="track slide-slow">
              {[...allCategories, ...allCategories].map((cat, i) => (
                <span key={i} className="slide-item">{cat.icon}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ২. মাঝখানের প্রোডাক্ট বাটন */}
        <div className="nav-item">
          <div className="animated-box gray-border">
            <div className="track slide-fast">
              {[...productIcons, ...productIcons].map((icon, i) => (
                <span key={i} className="slide-item">{icon}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ৩. প্রোমো/আপলোড বাটন */}
        <div className="nav-item" onClick={() => router.push('/mobile/upload')}>
          <div className="animated-box red-border">
            <div className="track text-slide">
              <span className="promo-text">পণ্য বিক্রয় করুন ৫% কমিশন — </span>
              <span className="promo-text">পণ্য বিক্রয় করুন ৫% কমিশন — </span>
            </div>
          </div>
        </div>

        {/* ৪. অ্যাকাউন্ট বাটন */}
        <div className="nav-item" onClick={() => router.push(user ? '/account' : '/auth/login')}>
          <div className={`animated-box ${user ? 'active-acc-box' : 'blue-border'}`}>
            <div className="track text-slide-account">
              {user ? (
                <>
                  <span className="account-text">✅ ধন্যবাদ, {userName}! — </span>
                  <span className="account-text">✅ লগইন সম্পন্ন হয়েছে — </span>
                </>
              ) : (
                <>
                  <span className="account-text">👤 পণ্য কিনতে হলে Login করুন — </span>
                  <span className="account-text">👤 পণ্য কিনতে হলে Login করুন — </span>
                </>
              )}
            </div>
          </div>
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

        /* ইউনিক হোম বাটন ডিজাইন */
        .home-btn-unique {
          position: relative;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-radius: 14px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .home-icon { font-size: 22px; z-index: 2; }
        
        .home-btn-unique.active {
          background: #fff5f0;
          transform: scale(1.1) translateY(-2px);
          border: 1px solid #ff4d00;
        }

        /* পালস ইফেক্ট - শুধুমাত্র হোমে থাকলে দেখা যাবে */
        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 14px;
          background: #ff4d00;
          opacity: 0.6;
          animation: pulseAnim 2s infinite;
          z-index: 1;
        }

        @keyframes pulseAnim {
          0% { transform: scale(1); opacity: 0.4; }
          70% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        
        .animated-box {
          width: 62px; 
          height: 32px;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          position: relative;
          border: 1.5px solid transparent;
          transition: all 0.3s ease;
        }
        
        .orange-border { background: #fff5f0; border-color: #ff4d00; }
        .red-border { background: #fef2f2; border-color: #ef4444; }
        .gray-border { background: #f9fafb; border-color: #94a3b8; }
        .blue-border { background: #f0f7ff; border-color: #3b82f6; }

        .active-acc-box {
          background: linear-gradient(135deg, #10b981, #059669);
          border-color: transparent;
          box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
        }
        .active-acc-box .account-text { color: white !important; }

        .track { display: flex; white-space: nowrap; align-items: center; }
        .slide-slow { gap: 18px; padding: 0 10px; animation: slideAll 25s linear infinite; }
        .slide-fast { gap: 15px; padding: 0 10px; animation: slideAll 15s linear infinite; }
        .text-slide { animation: slideAll 12s linear infinite; }
        .text-slide-account { animation: slideAll 10s linear infinite; }

        @keyframes slideAll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .slide-item { font-size: 18px; flex-shrink: 0; }
        .promo-text, .account-text { 
          font-size: 8px; 
          font-weight: 800; 
          padding-right: 20px; 
          white-space: nowrap;
        }
        .promo-text { color: #dc2626; }
        .account-text { color: #2563eb; }

        @media (min-width: 1024px) { .mobile-nav-premium { display: none !important; } }
      `}</style>
    </div>
  );
}