interface Category {
  icon: string;
  label: string;
}

interface CategoriesProps {
  categories: Category[];
}

export default function Categories({ categories }: CategoriesProps) {
  return (
    <div className="mobile-categories" style={{ marginTop: '10px' }}>
      <div style={{ fontSize: '16px', fontWeight: '700', color: '#333', marginBottom: '10px', paddingLeft: '4px' }}>
        🏷️ Shop by Category
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {categories.map((cat, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '10px', padding: '12px 4px', 
            textAlign: 'center', cursor: 'pointer', border: '1px solid #eee', 
            transition: 'all 0.2s',
          }}>
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}>{cat.icon}</span>
            <span style={{ fontSize: '10px', color: '#555', fontWeight: '600' }}>{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}