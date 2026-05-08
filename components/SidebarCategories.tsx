"use client";

interface Category {
  icon: string;
  label: string;
  slug: string;
}

interface SidebarCategoriesProps {
  categories: Category[];
  onCategoryClick: (slug: string) => void;
}

export default function SidebarCategories({ categories, onCategoryClick }: SidebarCategoriesProps) {
  return (
    <div className="pc-sidebar" style={{ 
      width: '100%', 
      background: 'white', 
      borderRadius: '4px', 
      padding: '0', 
      margin: '0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {categories.map((cat, i) => (
        <div 
          key={i} 
          className="cat-item" 
          onClick={() => onCategoryClick(cat.slug)}
          style={{ 
            padding: '6px 12px', 
            margin: '0',
            fontSize: '13px', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            borderBottom: '1px solid #f0f0f0',
            flex: '1'
          }}
        >
          <span className="cat-icon" style={{ width: '20px', flexShrink: 0 }}>{cat.icon}</span> 
          <span>{cat.label}</span>
        </div>
      ))}
    </div>
  );
}