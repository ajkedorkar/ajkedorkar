interface Category {
  icon: string;
  label: string;
}

interface SidebarCategoriesProps {
  categories: Category[];
}

export default function SidebarCategories({ categories }: SidebarCategoriesProps) {
  return (
    <div className="pc-sidebar" style={{ 
      width: '220px', background: 'white', borderRadius: '4px', 
      padding: '10px 0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
    }}>
      {categories.map((cat, i) => (
        <div key={i} className="cat-item" style={{ 
          padding: '8px 20px', fontSize: '13px', cursor: 'pointer', 
          display: 'flex', alignItems: 'center', gap: '10px' 
        }}>
          <span className="cat-icon">{cat.icon}</span> {cat.label}
        </div>
      ))}
    </div>
  );
}