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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <header className="mobile-header" style={{ 
      background: '#e62e04', 
      padding: '12px 15px', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
  <div style={{ fontSize: '22px', fontWeight: '900', color: 'white', letterSpacing: '0.5px' }}>
    AjkeDorkar
  </div>
  <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
    
    {/* ❤️ Wishlist — SVG সাদা হার্ট */}
    <svg onClick={() => router.push('/account/wishlist')} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ cursor: 'pointer' }}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
    
    {/* 🛒 Cart — SVG সাদা কার্ট */}
    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => router.push('/cart')}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      <span style={{
        position: 'absolute', top: '-6px', right: '-6px',
        background: '#222', color: 'white', fontSize: '10px',
        width: '16px', height: '16px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>0</span>
    </div>

  </div>
</div>

      <div style={{ 
        display: 'flex', alignItems: 'center', 
        background: 'white', borderRadius: '25px', 
        padding: '8px 14px', gap: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <span style={{ fontSize: '16px', color: '#999' }}>🔍</span>
        <input 
          type="text" 
          placeholder={typingText}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyPress}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: '#333', background: 'transparent' }} 
        />
        {searchQuery && (
          <span onClick={() => onSearchChange('')} style={{ fontSize: '14px', color: '#999', cursor: 'pointer' }}>✕</span>
        )}
        <button 
          onClick={handleSearch}
          style={{
            background: '#222', color: 'white', border: 'none',
            padding: '6px 14px', borderRadius: '20px', fontSize: '12px',
            fontWeight: '700', cursor: 'pointer',
          }}
        >
          খুঁজুন
        </button>
      </div>
    </header>
  );
}