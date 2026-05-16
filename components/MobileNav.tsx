"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

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
        
        <button 
          className={`nav-item ${pathname === '/' ? 'active' : ''}`} 
          onClick={() => router.push('/')}
        >
          <div className="icon-wrapper">
            <span className="nav-icon">🏠</span>
          </div>
          <span className="nav-label">হোম</span>
        </button>

        <button 
          className={`nav-item ${pathname.startsWith('/category') ? 'active' : ''}`} 
          onClick={() => router.push('/category/mobile')}
        >
          <div className="icon-wrapper">
            <span className="nav-icon">🎯</span>
          </div>
          <span className="nav-label">ক্যাটাগরি</span>
        </button>

        <button 
          className={`nav-item sale-special-btn ${pathname === '/mobile/upload' ? 'active' : ''}`} 
          onClick={() => router.push('/mobile/upload')}
        >
          <div className="icon-wrapper">
            <span className="nav-icon">✨</span>
          </div>
          <span className="nav-label">বিক্রয়</span>
        </button>

        <button 
          className={`nav-item reels-special-btn ${pathname.startsWith('/reels') ? 'active' : ''}`} 
          onClick={() => router.push('/reels')}
        >
          <div className="icon-wrapper">
            <span className="nav-icon">🔥</span>
          </div>
          <span className="nav-label">Reels</span>
        </button>
        
        <button 
          className={`nav-item ${pathname === '/account' || pathname.startsWith('/auth') ? 'active' : ''}`} 
          onClick={() => router.push(user ? '/account' : '/auth/login')}
        >
          <div className="icon-wrapper">
            <span className="nav-icon">{user ? '✅' : '👤'}</span>
          </div>
          <span className="nav-label user-name-label">
            {user ? userName : 'লগইন'}
          </span>
        </button>

      </div>

      <style jsx>{`
        .mobile-nav-premium {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          /* প্যাডিং ও হাইট অনেক কমিয়ে স্লিম করা হয়েছে */
          padding: 4px 0 calc(env(safe-area-inset-bottom) + 2px) 0;
          z-index: 10000;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.02);
        }
        
        .nav-content {
          display: flex;
          justify-content: space-around;
          align-items: center;
          max-width: 420px; /* উইডথ কিছুটা কমিয়ে বাটনগুলো কাছাকাছি আনা হয়েছে */
          margin: 0 auto;
          padding: 0 6px;
        }
        
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          background: none;
          border: none;
          outline: none;
          cursor: pointer;
          padding: 2px 0;
          gap: 2px; /* আইকন ও লেখার দূরত্ব কমানো হয়েছে */
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .icon-wrapper {
          position: relative;
          width: 22px; /* আইকন কন্টেইনার ছোট করা হয়েছে */
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-icon {
          font-size: 17px; /* আইকন সাইজ ১7px করে ছোট করা হয়েছে */
          transition: transform 0.2s ease;
        }

        .nav-label {
          font-size: 9.5px; /* ফন্ট সাইজ আরও মিনিমাল করা হয়েছে */
          font-weight: 600;
          color: #64748b;
          max-width: 55px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        /* বিক্রয় বাটনে প্লাসের বদলে মডার্ন স্পার্কল/ম্যাজিক আইকন */
        .sale-special-btn.active .nav-icon {
          filter: drop-shadow(0 2px 4px rgba(234, 179, 8, 0.3));
        }

        /* রিলস বাটনে ট্রেন্ডিং ফায়ার বাটন */
        .reals-special-btn.active .nav-icon {
          filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3));
        }

        /* একটিভ বাটন স্টাইল */
        .nav-item.active .nav-icon {
          transform: scale(1.08);
        }

        .nav-item.active .nav-label {
          color: #ff4d00;
          font-weight: 700;
        }

        /* ক্লিক বাউন্স ইফেক্ট */
        .nav-item:active .nav-icon {
          transform: scale(0.92);
        }

        .user-name-label {
          max-width: 55px;
        }

        @media (min-width: 1024px) { 
          .mobile-nav-premium { display: none !important; } 
        }
      `}</style>
    </div>
  );
}