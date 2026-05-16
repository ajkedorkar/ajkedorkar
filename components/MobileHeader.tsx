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
    <header className="mobile-header-root rainbow-bg-20">
      <div className="header-flex">
        
        {/* লোগো সেকশন */}
        <div className="brand-badge" onClick={() => router.push('/')}>
          <span className="logo-main">A</span>
          <span className="logo-sub">D</span>
        </div>

        {/* সার্চ বার - ফিক্সড আইকন পজিশন */}
        <div className="search-input-area">
          <input 
            type="text" 
            placeholder={typingText}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="header-input"
          />
          {/* আইকনটি এখন ইনপুটের বাইরে ডান পাশে থাকবে */}
          <div className="search-btn-icon" onClick={handleSearch}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
             </svg>
          </div>
        </div>

        {/* রাইট সাইড অ্যাকশনস */}
        <div className="header-actions-wrap">
          <div className="action-unit" onClick={() => router.push('/account/wishlist')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          
          <div className="action-unit cart-box" onClick={() => router.push('/cart')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="cart-badge-ui">0</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ৬০ সেকেন্ডের অতি ধীরগতির এবং প্রিমিয়াম অ্যানিমেশন ব্যাকগ্রাউন্ড */
        .mobile-header-root {
          padding: 8px 12px;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 10px rgba(0,0,0,0.15);
          animation: headerRainbow 60s linear infinite; /* ২৫ সেকেন্ড থেকে বাড়িয়ে ৬০ সেকেন্ড করা হলো */
        }

        .header-flex {
          display: flex;
          align-items: center;
          gap: 8px;
          max-width: 100%;
        }

        .brand-badge {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 10px;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.25);
          flex-shrink: 0;
        }
        .logo-main { color: white; font-weight: 900; font-size: 18px; }
        .logo-sub { color: rgba(255,255,255,0.8); font-weight: 900; font-size: 18px; margin-left: 1px; }

        .search-input-area {
          flex: 1;
          display: flex;
          align-items: center;
          background: white;
          height: 38px;
          border-radius: 10px;
          padding: 0 4px 0 12px;
          position: relative;
          overflow: hidden;
          min-width: 0;
        }
        
        .header-input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 13px;
          color: #333;
          background: transparent;
          padding-right: 5px;
        }

        .search-btn-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e62e04;
          cursor: pointer;
          flex-shrink: 0;
          transition: color 0.5s ease;
        }

        .header-actions-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        
        .action-unit {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-badge-ui {
          position: absolute;
          top: -6px;
          right: -8px;
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
          border: 2px solid #222;
        }

        /* ২০টি ইউনিক কালারের ধীরগতির সিকোয়েন্স */
        @keyframes headerRainbow {
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

        @media (min-width: 1024px) {
          .mobile-header-root { display: none !important; }
        }
      `}</style>
    </header>
  );
}