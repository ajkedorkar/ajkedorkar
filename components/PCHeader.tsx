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
    <header className="pc-header" style={{ 
      background: '#e62e04', 
      padding: '12px 5%', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* লোগো */}
        <div onClick={() => router.push('/')} style={{ fontSize: '26px', fontWeight: '900', color: 'white', cursor: 'pointer' }}>
          AjkeDorkar
        </div>
        
        {/* সার্চ বার */}
        <div style={{ width: '350px', display: 'flex', background: 'white', borderRadius: '4px', overflow: 'hidden' }}>
          <input type="text" placeholder={typingText} value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)} onKeyDown={handleKeyPress}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 15px', fontSize: '13px' }} />
          <button onClick={handleSearch} style={{ background: '#222', color: 'white', border: 'none', padding: '0 20px', cursor: 'pointer' }}>🔍</button>
        </div>

        {/* ডান পাশের আইকন + বাটন */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          
          {/* 📤 Upload বাটন (সাদা) */}
          <button onClick={() => router.push('/mobile/upload')} style={{
            background: 'white', color: '#e62e04', border: 'none',
            padding: '6px 14px', borderRadius: '4px', fontSize: '13px',
            fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
          }}>
            📤 Upload
          </button>

          {/* ❤️ Wishlist — SVG সাদা হার্ট (fill="white") */}
          <svg onClick={() => router.push('/account/wishlist')} width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" style={{ cursor: 'pointer' }}>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          
          {/* 🛒 Cart — SVG সাদা কার্ট (fill="white") */}
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => router.push('/cart')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: '#222', color: 'white', fontSize: '10px',
                width: '16px', height: '16px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartCount}</span>
            )}
          </div>

          {/* Login / Account (সাদা) */}
          {user ? (
            <button onClick={() => router.push('/account')} style={{ 
              background: 'white', color: '#e62e04', border: 'none', padding: '6px 15px', 
              borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              👤 অ্যাকাউন্ট
            </button>
          ) : (
            <button onClick={() => router.push('/auth/login')} style={{ 
              background: 'white', color: '#e62e04', border: 'none',
              padding: '6px 15px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>
              Login / Signup
            </button>
          )}
        </div>
      </div>
    </header>
  );
}