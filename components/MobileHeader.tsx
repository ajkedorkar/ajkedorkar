"use client";

interface MobileHeaderProps {
  typingText: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function MobileHeader({ typingText, searchQuery, onSearchChange }: MobileHeaderProps) {
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
          <span style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }}>❤️</span>
          <span style={{ fontSize: '20px', color: 'white', cursor: 'pointer', position: 'relative' }}>
            🛒
            <span style={{
              position: 'absolute', top: '-6px', right: '-6px',
              background: '#222', color: 'white', fontSize: '10px',
              width: '16px', height: '16px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>0</span>
          </span>
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
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', color: '#333', background: 'transparent' }} 
        />
        {searchQuery && (
          <span onClick={() => onSearchChange('')} style={{ fontSize: '14px', color: '#999', cursor: 'pointer' }}>✕</span>
        )}
      </div>
    </header>
  );
}