"use client";

import { useRouter } from 'next/navigation';

interface MobileHeaderProps {
  typingText: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function MobileHeader({ typingText, searchQuery, onSearchChange }: MobileHeaderProps) {
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="mobile-header-root">
      <div className="header-flex">
        
        {/* ১. ইউনিক লোগো সেকশন */}
        <div className="brand-badge" onClick={() => router.push('/')}>
          <span className="logo-main">A</span>
          <span className="logo-sub">D</span>
        </div>

        {/* ২. মডার্ন সার্চ বার (কোনো পুরনো আইকন নেই) */}
        <div className="search-input-area">
          <input 
            type="text" 
            placeholder={typingText}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="header-input"
          />
          <div className="search-btn-icon" onClick={handleSearch}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
             </svg>
          </div>
        </div>

        {/* ৩. রাইট সাইড বাটন (পারফেক্ট প্যাডিং ফিক্স) */}
        <div className="header-actions-wrap">
          {/* Wishlist */}
          <div className="action-unit" onClick={() => router.push('/account/wishlist')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          
          {/* Cart with Fixed Badge */}
          <div className="action-unit cart-box" onClick={() => router.push('/cart')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="cart-badge-ui">0</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mobile-header-root {
          background: #e62e04; /* প্রিমিয়াম রেড ব্যাকগ্রাউন্ড */
          padding: 8px 16px; /* রাইট সাইড ফিক্স করার জন্য ১৬px প্যাডিং দেওয়া হয়েছে */
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
        }

        .header-flex {
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 100%;
        }

        /* লোগো ডিজাইন */
        .brand-badge {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.15);
          padding: 4px 10px;
          border-radius: 10px;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .logo-main { color: white; font-weight: 900; font-size: 18px; }
        .logo-sub { color: rgba(255,255,255,0.7); font-weight: 900; font-size: 18px; margin-left: 2px; }

        /* মডার্ন সার্চ বার */
        .search-input-area {
          flex: 1;
          display: flex;
          align-items: center;
          background: white;
          height: 38px;
          border-radius: 12px;
          padding: 0 4px 0 12px;
          overflow: hidden;
        }
        .header-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 13px;
          color: #333;
          background: transparent;
        }
        .search-btn-icon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e62e04;
          cursor: pointer;
        }

        /* রাইট বাটন ও কার্ট ব্যাজ ফিক্স */
        .header-actions-wrap {
          display: flex;
          align-items: center;
          gap: 14px; /* আইকনগুলোর মাঝে নিরাপদ দূরত্ব */
          padding-right: 2px; /* স্ক্রিনের একদম কোণা থেকে ২px গ্যাপ */
        }
        .action-unit {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .action-unit:active { transform: scale(0.9); }

        .cart-badge-ui {
          position: absolute;
          top: -6px;
          right: -8px; /* ব্যাজ পজিশন একদম রাইট এ ফিক্স করা হয়েছে */
          background: #222;
          color: white;
          font-size: 10px;
          font-weight: bold;
          min-width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #e62e04;
          z-index: 10;
        }

        @media (min-width: 1024px) {
          .mobile-header-root { display: none !important; }
        }
      `}</style>
    </header>
  );
}