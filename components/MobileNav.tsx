export default function MobileNav() {
  const navItems = [
    { icon: '🏠', label: 'Home' },
    { icon: '🗂️', label: 'Category' },
    { icon: '🛒', label: 'Cart' },
    { icon: '👤', label: 'Account' },
  ];

  return (
    <div className="mobile-nav" style={{ 
      position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', 
      display: 'flex', justifyContent: 'space-around', padding: '12px 0', 
      borderTop: '1px solid #eee', zIndex: 100 
    }}>
      {navItems.map((item, i) => (
        <div key={i} style={{ 
          display: 'flex', flexDirection: 'column', alignItems: 'center', 
          gap: '2px', cursor: 'pointer', color: i === 0 ? '#e62e04' : '#888' 
        }}>
          <span style={{ fontSize: '20px' }}>{item.icon}</span>
          <span style={{ fontSize: '10px', fontWeight: i === 0 ? '700' : '400' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}