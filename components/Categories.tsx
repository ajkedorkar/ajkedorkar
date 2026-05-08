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
      
      {/* ১৫ সেকেন্ডের স্লো এবং স্মুথ ৭ কালার চেঞ্জিং বক্স */}
      <div className="triple-header-container">
        
        {/* বক্স ১: আপনার যা প্রয়োজন */}
        <div className="equal-box rainbow-slow-1">
          <span className="icon-style">✨</span>
          <span className="box-text">আপনার যা প্রয়োজন</span>
        </div>
        
        {/* বক্স ২: Flash Sale */}
        <div className="equal-box rainbow-slow-2">
          <span className="icon-style">⚡</span>
          <span className="box-text">Flash Sale</span>
        </div>

        {/* বক্স ৩: Discount */}
        <div className="equal-box rainbow-slow-3">
          <span className="box-text">১০% Discount</span>
        </div>
        
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
            }}
          >
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '4px' }}>{cat.icon}</span>
            <span style={{ fontSize: '10px', color: '#555', fontWeight: '600' }}>{cat.label}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .triple-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding: 0 4px;
          gap: 6px;
        }

        .equal-box {
          flex: 1; 
          height: 36px; 
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .box-text {
          font-size: 8.5px;
          font-weight: 900;
          color: white;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
          text-transform: uppercase;
        }

        .icon-style { font-size: 11px; margin-right: 3px; }

        /* ১৫ সেকেন্ডের অতি ধীরগতির অ্যানিমেশন (চোখের জন্য আরামদায়ক) */
        @keyframes rainbow-slow {
          0%   { background-color: #ff3b3b; } /* লাল */
          14%  { background-color: #ff9800; } /* কমলা */
          28%  { background-color: #ffeb3b; } /* হলুদ */
          42%  { background-color: #4caf50; } /* সবুজ */
          57%  { background-color: #2196f3; } /* নীল */
          71%  { background-color: #673ab7; } /* বেগুনী */
          85%  { background-color: #9c27b0; } /* ভায়োলেট */
          100% { background-color: #ff3b3b; } /* আবার লাল */
        }

        .rainbow-slow-1 {
          animation: rainbow-slow 15s infinite ease-in-out;
        }

        .rainbow-slow-2 {
          animation: rainbow-slow 15s infinite ease-in-out;
          animation-delay: -5s; /* ৫ সেকেন্ড ডিলে */
        }

        .rainbow-slow-3 {
          animation: rainbow-slow 15s infinite ease-in-out;
          animation-delay: -10s; /* ১০ সেকেন্ড ডিলে */
        }
      `}</style>
    </div>
  );
}