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
    <div className="mobile-categories" style={{ marginTop: '10px', padding: '0 8px' }}>
      
      {/* ওপরের স্লাইডিং প্রিমিয়াম বক্সগুলো */}
      <div className="premium-sliding-container">
        <div className="dynamic-box rainbow-cycle">
          <div className="track text-slide">
             <span>✨ আপনার যা প্রয়োজন — সেরা ডিল এখানে — ✨ </span>
          </div>
        </div>
        
        <div className="dynamic-box rainbow-cycle delay-1">
          <div className="track text-slide">
             <span>⚡ Flash Sale — দ্রুত কিনুন — ⚡ </span>
          </div>
        </div>

        <div className="dynamic-box rainbow-cycle delay-2">
          <div className="track text-slide">
             <span>🎁 ১০% Discount — আজকেই দরকার — 🎁 </span>
          </div>
        </div>
      </div>

      {/* ক্যাটাগরি গ্রিড - এখানে প্রতি লাইনে ৪টি করে আইটেম থাকবে */}
      <div className="categories-grid-fixed">
        {categories.map((cat, i) => (
          <div 
            key={i} 
            onClick={() => onCategoryClick(cat.slug)}
            className="category-card"
          >
            <div className="icon-wrapper">{cat.icon}</div>
            <span className="label-style">{cat.label}</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .premium-sliding-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          gap: 6px;
        }

        .dynamic-box {
          flex: 1; height: 38px; 
          display: flex; align-items: center; 
          overflow: hidden; border-radius: 10px;
        }

        .track { display: flex; white-space: nowrap; }
        .text-slide { animation: slideText 8s linear infinite; }
        @keyframes slideText { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        .dynamic-box span {
          font-size: 8px; font-weight: 900; color: white;
          padding: 0 10px; text-transform: uppercase;
        }

        /* ২০ রঙের অ্যানিমেশন */
        .rainbow-cycle { animation: changeColors 20s linear infinite; }
        .delay-1 { animation-delay: -5s; }
        .delay-2 { animation-delay: -10s; }

        @keyframes changeColors {
          0% { background-color: #ff4d00; }
          25% { background-color: #ef4444; }
          50% { background-color: #3b82f6; }
          75% { background-color: #10b981; }
          100% { background-color: #ff4d00; }
        }

        /* ফিক্সড গ্রিড লেআউট - ৪টি কলাম */
        .categories-grid-fixed {
          display: grid;
          grid-template-columns: repeat(4, 1fr); /* প্রতি লাইনে ৪টি */
          gap: 10px;
          padding-bottom: 20px;
        }

        .category-card {
          background: white;
          border-radius: 12px;
          padding: 12px 4px;
          text-align: center;
          cursor: pointer;
          border: 1px solid #f0f0f0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.03);
          transition: transform 0.2s;
        }

        .category-card:active { transform: scale(0.92); }

        .icon-wrapper {
          font-size: 26px;
          margin-bottom: 6px;
          display: block;
        }

        .label-style {
          font-size: 10px;
          color: #444;
          font-weight: 700;
          display: block;
          line-height: 1.2;
        }
      `}</style>
    </div>
  );
}