"use client";

interface Category {
  icon: string;
  label: string;
  slug: string;
}

interface CategoriesProps {
  categories: Category[];
  onCategoryClick: (slug: string) => void;
}

export default function Categories({ categories, onCategoryClick }: CategoriesProps) {
  return (
    <div className="mobile-categories" style={{ marginTop: '10px' }}>
      <div style={{ fontSize: '16px', fontWeight: '700', color: '#333', marginBottom: '10px', paddingLeft: '4px' }}>
        🏷️ Shop by Category
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {categories.map((cat, i) => (
          <div 
            key={i} 
            onClick={() => onCategoryClick(cat.slug)}
            style={{
              background: 'white', 
              borderRadius: '10px', 
              padding: '12px 4px', 
              textAlign: 'center', 
              cursor: 'pointer', 
              border: '1px solid #eee', 
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}>{cat.icon}</span>
            <span style={{ fontSize: '10px', color: '#555', fontWeight: '600' }}>{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}