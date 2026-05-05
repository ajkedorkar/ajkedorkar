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