"use client";

import { useRouter } from 'next/navigation';

interface PCHeaderProps {
  typingText: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function PCHeader({ typingText, searchQuery, onSearchChange }: PCHeaderProps) {
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      alert(`🔍 "${searchQuery}" সার্চ করা হচ্ছে!`);
      // ভবিষ্যতে: router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
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
        {/* লোগো - ক্লিক করলে হোমে যাবে */}
        <div 
          onClick={() => router.push('/')}
          style={{ fontSize: '26px', fontWeight: '900', color: 'white', cursor: 'pointer' }}
        >
          AjkeDorkar
        </div>
        
        {/* সার্চ বার */}
        <div style={{ width: '400px', display: 'flex', background: 'white', borderRadius: '4px', overflow: 'hidden' }}>
          <input 
            type="text" 
            placeholder={typingText} 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyPress}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 15px', fontSize: '13px' }} 
          />
          <button 
            onClick={handleSearch}
            style={{ background: '#222', color: 'white', border: 'none', padding: '0 20px', cursor: 'pointer' }}
          >
            🔍
          </button>
        </div>

        {/* অ্যাকশন আইকন */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '15px', color: 'white', fontSize: '20px' }}>
            <span 
              onClick={() => alert('🛒 কার্ট খুলছে!')}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              🛒
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: '#222', color: 'white', fontSize: '10px',
                width: '16px', height: '16px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>0</span>
            </span>
            <span 
              onClick={() => alert('❤️ ফেবারিট খুলছে!')}
              style={{ cursor: 'pointer' }}
            >
              ❤️
            </span>
          </div>
          <button 
            onClick={() => alert('👤 লগইন/সাইনআপ খুলছে!')}
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: '1px solid white', 
              color: 'white', 
              padding: '6px 15px', 
              borderRadius: '4px', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer' 
            }}
          >
            Login / Signup
          </button>
        </div>
      </div>
    </header>
  );
}