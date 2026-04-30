"use client";

interface PCHeaderProps {
  typingText: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function PCHeader({ typingText, searchQuery, onSearchChange }: PCHeaderProps) {
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
        <div style={{ fontSize: '26px', fontWeight: '900', color: 'white' }}>AjkeDorkar</div>
        <div style={{ width: '400px', display: 'flex', background: 'white', borderRadius: '4px', overflow: 'hidden' }}>
          <input 
            type="text" 
            placeholder={typingText} 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{ flex: 1, border: 'none', outline: 'none', padding: '8px 15px', fontSize: '13px' }} 
          />
          <button style={{ background: '#222', color: 'white', border: 'none', padding: '0 20px' }}>🔍</button>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '15px', color: 'white', fontSize: '20px' }}>
            <span style={{ cursor: 'pointer' }}>🛒</span>
            <span style={{ cursor: 'pointer' }}>❤️</span>
          </div>
          <button style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid white', color: 'white', padding: '6px 15px', borderRadius: '4px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            Login / Signup
          </button>
        </div>
      </div>
    </header>
  );
}