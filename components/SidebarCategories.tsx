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
    <div className="pc-sidebar-container">
      {categories.map((cat, i) => (
        <div 
          key={i} 
          className="dynamic-cat-item" 
          onClick={() => onCategoryClick(cat.slug)}
        >
          {/* কালারফুল গোল আইকন বক্স */}
          <span className="dynamic-icon-wrap">{cat.icon}</span> 
          
          {/* বোল্ড ও ক্লিন টেক্সট */}
          <span className="dynamic-cat-label">{cat.label}</span>
        </div>
      ))}

      <style jsx>{`
        /* মেইন কন্টেইনার বক্স */
        .pc-sidebar-container {
          width: 100%; 
          background: white; 
          border-radius: 8px; /* কর্নার একটু স্মুথ করা হয়েছে */
          padding: 6px; 
          margin: 0;
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
          
          /* 🚀 ওস্তাদ ফিক্স: height: 100% বদলে fit-content করা হলো, যাতে সাইডবার মেইন লেআউটকে নিচে টেনে লম্বা না করে */
          height: fit-content; 
          
          display: flex;
          flex-direction: column;
          gap: 2px; /* প্রতিটি আইটেমের মাঝে হালকা গ্যাপ */
        }

        /* প্রতিটি ক্যাটাগরি রো (Row) */
        .dynamic-cat-item {
          padding: 8px 12px; 
          margin: 0;
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          gap: 12px;
          border-radius: 6px;
          background: transparent;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        /* আইকনের চারপাশের গোল কালারফুল ব্যাকগ্রাউন্ড */
        .dynamic-icon-wrap {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 13px;
          flex-shrink: 0;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          background: #f1f5f9; /* ডিফল্ট ব্যাকগ্রাউন্ড */
        }

        /* ক্যাটাগরি টেক্সট */
        .dynamic-cat-label {
          font-size: 13px; 
          font-weight: 700; /* টেক্সট বোল্ড করা হয়েছে */
          color: #334155;
          transition: color 0.2s ease;
        }

        /* 🎯 মাউস হোভার ইফেক্ট (Hover Effect) - সাইট ল্যাগ করবে না */
        .dynamic-cat-item:hover {
          background: rgba(230, 46, 4, 0.05); /* আপনার থিমের হালকা লালচে ছোঁয়া */
          transform: translateX(4px); /* হালকা ডান পাশে সরবে */
        }

        .dynamic-cat-item:hover .dynamic-cat-label {
          color: #e62e04; /* হোভার করলে লেখা আপনার মেইন থিমের লাল হবে */
        }

        .dynamic-cat-item:hover .dynamic-icon-wrap {
          transform: scale(1.15) rotate(8deg); /* আইকন একটু বড় হয়ে ঘুরবে */
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }

        /* 🌈 ২০ রকম কালার মিক্সিং (লুপ অনুযায়ী ব্যাকগ্রাউন্ড গ্রেডিয়েন্ট অটো চেঞ্জ হবে) */
        .dynamic-cat-item:nth-child(5n+1) .dynamic-icon-wrap {
          background: linear-gradient(135deg, #ff9900, #ff4d00);
          color: white;
        }
        .dynamic-cat-item:nth-child(5n+2) .dynamic-icon-wrap {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        .dynamic-cat-item:nth-child(5n+3) .dynamic-icon-wrap {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }
        .dynamic-cat-item:nth-child(5n+4) .dynamic-icon-wrap {
          background: linear-gradient(135deg, #7c3aed, #9333ea);
          color: white;
        }
        .dynamic-cat-item:nth-child(5n+5) .dynamic-icon-wrap {
          background: linear-gradient(135deg, #db2777, #e11d48);
          color: white;
        }
      `}</style>
    </div>
  );
}