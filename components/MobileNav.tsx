"use client";

import { useState } from 'react';

export default function MobileNav() {
  const [activeTab, setActiveTab] = useState(0);

  const navItems = [
    { icon: 'home', label: 'Home' },
    { icon: 'grid_view', label: 'Category' },
    { icon: 'shopping_bag', label: 'Cart' },
    { icon: 'person_outline', label: 'Account' },
  ];

  return (
    <>
      {/* মেটেরিয়াল আইকন লাইব্রেরি লোড করার জন্য */}
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />

      <div className="mobile-nav-custom">
        <div className="nav-content">
          {navItems.map((item, i) => (
            <div 
              key={i} 
              className={`nav-item ${activeTab === i ? 'active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              <div className="icon-wrapper">
                <span className="material-icons-round">{item.icon}</span>
              </div>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </div>

        <style jsx>{`
          .mobile-nav-custom {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-top: 1px solid rgba(0, 0, 0, 0.06);
            /* মোবাইলের নিচের দিকের সেফ জোনের সাথে ফিট করার জন্য প্যাডিং */
            padding: 6px 0 calc(env(safe-area-inset-bottom) + 6px) 0;
            z-index: 10000;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
          }

          .nav-content {
            display: flex;
            justify-content: space-around;
            align-items: center;
            max-width: 600px;
            margin: 0 auto;
          }

          .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 25%;
            cursor: pointer;
            transition: all 0.2s ease;
            color: #999;
          }

          .nav-item.active {
            color: #e62e04; /* আপনার সিগনেচার ব্র্যান্ড কালার */
          }

          .icon-wrapper {
            margin-bottom: 1px;
            transition: transform 0.2s ease;
          }

          .nav-item.active .icon-wrapper {
            transform: scale(1.05);
          }

          .material-icons-round {
            font-size: 20px; /* আইকন সাইজ ছোট করা হয়েছে */
          }

          .nav-label {
            font-size: 9px; /* ফন্ট সাইজ ছোট করা হয়েছে */
            font-weight: 600;
            letter-spacing: 0.2px;
          }

          .nav-item.active .nav-label {
            font-weight: 700;
          }

          /* ট্যাপ করার সময় অ্যানিমেশন */
          .nav-item:active {
            opacity: 0.6;
            transform: scale(0.96);
          }
        `}</style>
      </div>
    </>
  );
}