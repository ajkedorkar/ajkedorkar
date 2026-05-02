"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: '🏠', label: 'Home', href: '/' },
    { icon: '🗂️', label: 'Category', href: '/category/offer-zone' },
    { icon: '🛒', label: 'Cart', href: '/cart' },
    { icon: '👤', label: 'Account', href: '/auth/login' },
  ];

  const handleClick = (href: string, index: number) => {
    router.push(href);
  };

  // এক্টিভ ট্যাব বের করা
  const getActiveIndex = () => {
    if (pathname === '/') return 0;
    if (pathname.startsWith('/category')) return 1;
    if (pathname.startsWith('/cart')) return 2;
    if (pathname.startsWith('/auth')) return 3;
    return 0;
  };

  const activeTab = getActiveIndex();

  return (
    <div className="mobile-nav-custom">
      <div className="nav-content">
        {navItems.map((item, i) => (
          <div 
            key={i} 
            className={`nav-item ${activeTab === i ? 'active' : ''}`}
            onClick={() => handleClick(item.href, i)}
          >
            <div className="icon-wrapper">
              <span style={{ fontSize: '20px' }}>{item.icon}</span>
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
          color: #e62e04;
        }
        .icon-wrapper {
          margin-bottom: 1px;
          transition: transform 0.2s ease;
        }
        .nav-item.active .icon-wrapper {
          transform: scale(1.05);
        }
        .nav-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.2px;
        }
        .nav-item.active .nav-label {
          font-weight: 700;
        }
        .nav-item:active {
          opacity: 0.6;
          transform: scale(0.96);
        }
      `}</style>
    </div>
  );
}