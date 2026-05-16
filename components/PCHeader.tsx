"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface PCHeaderProps {
  typingText: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function PCHeader({ typingText, searchQuery, onSearchChange }: PCHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      
      if (data.session?.user) {
        const { count } = await supabase.from('cart').select('*', { count: 'exact' }).eq('user_id', data.session.user.id);
        setCartCount(count || 0);
      }
    }
    load();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <header className="pc-header-root">
      <div className="pc-header-container">
        
        {/* লোগো - আগের মতো বড় ও সুপার বোল্ড */}
        <div onClick={() => router.push('/')} className="pc-logo-bold">
          AjkeDorkar
        </div>
        
        {/* সার্চ বার - সাইজ ছোট করে অ্যাডজাস্ট করা হয়েছে */}
        <div className="pc-search-area-mini">
          <input 
            type="text" 
            placeholder={typingText} 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)} 
            onKeyDown={handleKeyPress}
            className="pc-search-input-mini" 
          />
          <button onClick={handleSearch} className="pc-search-btn-mini">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </button>
        </div>

        {/* ডান পাশের আইকন + বাটন - সাইজ ছোট এবং কম্প্যাক্ট */}
        <div className="pc-actions-wrap-mini">
          
          {/* 📤 Upload বাটন (ছোট সাইজ) */}
          <button onClick={() => router.push('/mobile/upload')} className="pc-upload-btn-mini">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload
          </button>

          {/* ❤️ Wishlist */}
          <div className="pc-icon-btn-mini" onClick={() => router.push('/account/wishlist')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          
          {/* 🛒 Cart */}
          <div className="pc-icon-btn-mini pc-cart-box" onClick={() => router.push('/cart')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="pc-cart-badge-mini">{cartCount}</span>
            )}
          </div>

          {/* Login / Account (ছোট সাইজ) */}
          {user ? (
            <button onClick={() => router.push('/account')} className="pc-auth-btn-mini">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              অ্যাকাউন্ট
            </button>
          ) : (
            <button onClick={() => router.push('/auth/login')} className="pc-auth-btn-mini">
              Login / Signup
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        /* ৯০ সেকেন্ডের অতি ধীরগতির ২০ কালার অ্যানিমেশন ব্যাকগ্রাউন্ড */
        .pc-header-root {
          padding: 10px 5%; /* প্যাডিং সামান্য কমানো হয়েছে */
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          animation: pcHeaderRainbow 90s linear infinite; /* টাইম বাড়িয়ে ৯০ সেকেন্ড করা হলো */
        }

        .pc-header-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* লোগো - আগের মতো সুপার বোল্ড */
        .pc-logo-bold {
          font-size: 28px;
          font-weight: 900;
          color: white;
          cursor: pointer;
          letter-spacing: -0.5px;
        }

        /* সার্চ বার - ছোট ও নিখুঁতভাবে অ্যাডজাস্ট করা */
        .pc-search-area-mini {
          width: 310px; /* উইডথ কমিয়ে ৩১০px করা হয়েছে */
          display: flex;
          background: white;
          border-radius: 6px;
          overflow: hidden;
          height: 34px; /* হাইট কমানো হয়েছে */
        }

        .pc-search-input-mini {
          flex: 1;
          border: none;
          outline: none;
          padding: 0 12px;
          font-size: 12.5px;
          color: #333;
        }

        .pc-search-btn-mini {
          background: #222;
          color: white;
          border: none;
          padding: 0 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* অ্যাকশন বাটন এরিয়া - ছোট সাইজ */
        .pc-actions-wrap-mini {
          display: flex;
          gap: 12px; /* গ্যাপ কমানো হয়েছে */
          align-items: center;
        }

        .pc-upload-btn-mini, .pc-auth-btn-mini {
          background: white;
          color: #222;
          border: none;
          padding: 6px 12px; /* প্যাডিং ছোট করা হয়েছে */
          border-radius: 5px;
          font-size: 12px; /* ফন্ট সাইজ ছোট করা হয়েছে */
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          height: 34px; /* সার্চ বারের সাথে হাইট ম্যাচ করা */
        }

        .pc-icon-btn-mini {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
          width: 32px;
          height: 32px;
        }
        .pc-icon-btn-mini:hover { transform: scale(1.08); }

        .pc-cart-box { position: relative; }

        .pc-cart-badge-mini {
          position: absolute;
          top: -3px;
          right: -3px;
          background: #222;
          color: white;
          font-size: 9px;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ২০টি প্রিমিয়াম কালারের ধীরগতির সিকোয়েন্স (৯০ সেকেন্ড) */
        @keyframes pcHeaderRainbow {
          0%   { background-color: #e62e04; }
          5%   { background-color: #f24e1e; }
          10%  { background-color: #ff6b00; }
          15%  { background-color: #ff9900; }
          20%  { background-color: #e0a900; }
          25%  { background-color: #10b981; }
          30%  { background-color: #059669; }
          35%  { background-color: #0d9488; }
          40%  { background-color: #06b6d4; }
          45%  { background-color: #0ea5e9; }
          50%  { background-color: #2563eb; }
          55%  { background-color: #1d4ed8; }
          60%  { background-color: #4f46e5; }
          65%  { background-color: #6366f1; }
          70%  { background-color: #7c3aed; }
          75%  { background-color: #9333ea; }
          80%  { background-color: #c084fc; }
          85%  { background-color: #db2777; }
          90%  { background-color: #e11d48; }
          95%  { background-color: #dc2626; }
          100% { background-color: #e62e04; }
        }
      `}</style>
    </header>
  );
}