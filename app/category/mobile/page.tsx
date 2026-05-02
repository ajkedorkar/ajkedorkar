"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const categories = [
  { label: 'অফার জোন', slug: 'offer-zone', icon: '🎯' },
  { label: 'মোবাইল', slug: 'mobile', icon: '📱' },
  { label: 'কম্পিউটার', slug: 'computer', icon: '💻' },
  { label: 'ইলেকট্রনিক্স', slug: 'electronics', icon: '⚡' },
  { label: 'ফ্যাশন', slug: 'fashion', icon: '👗' },
  { label: 'গাড়ি', slug: 'car', icon: '🚗' },
  { label: 'চাকরি', slug: 'job', icon: '💼' },
  { label: 'সার্ভিস', slug: 'service', icon: '🔧' },
  { label: 'জমি', slug: 'property', icon: '🏠' },
  { label: 'তথ্য', slug: 'info', icon: '📢' },
  { label: 'পাত্রপাত্রী', slug: 'matrimony', icon: '💑' },
  { label: 'ভাড়া', slug: 'rent', icon: '🔑' },
  { label: 'জরুরি', slug: 'emergency', icon: '🚑' },
  { label: 'পশু', slug: 'animal', icon: '🐄' },
  { label: 'খাদ্য', slug: 'food', icon: '🍪' },
  { label: 'নিত্যপণ্য', slug: 'daily-needs', icon: '🛒' },
  { label: 'উপহার', slug: 'gifts', icon: '🎁' },
  { label: 'হস্তশিল্প', slug: 'handicraft', icon: '🔪' },
];

const subProducts = [
  { label: 'Digital product', icon: '🎮', imageStyle: 'linear-gradient(135deg, #2C3E50 0%, #000000 100%)' },
  { label: 'Decor', icon: '🛋️', imageStyle: 'linear-gradient(135deg, #16A085 0%, #1ABC9C 100%)' },
  { label: 'Furniture', icon: '🪑', imageStyle: 'linear-gradient(135deg, #7F8C8D 0%, #2C3E50 100%)' },
  { label: 'Fashion', icon: '👔', imageStyle: 'linear-gradient(135deg, #E74C3C 0%, #C0392B 100%)' },
  { label: 'Electronics', icon: '📺', imageStyle: 'linear-gradient(135deg, #8E44AD 0%, #2980B9 100%)' },
  { label: 'Wall Decor', icon: '🖼️', imageStyle: 'linear-gradient(135deg, #D35400 0%, #E67E22 100%)' },
  { label: 'Outdoor & Garden', icon: '🪴', imageStyle: 'linear-gradient(135deg, #27AE60 0%, #2ECC71 100%)' },
  { label: 'Craft kits', icon: '🎨', imageStyle: 'linear-gradient(135deg, #F39C12 0%, #F1C40F 100%)' },
  { label: 'Vegetable', icon: '🥦', imageStyle: 'linear-gradient(135deg, #27AE60 0%, #16A085 100%)' },
];

export default function MobileCategoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState('offer-zone');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    }
    load();
  }, []);

  const navItems = [
    { icon: '🏠', label: 'Home', href: '/' },
    { icon: '🗂️', label: 'Category', href: '/category/mobile' },
    { icon: '🛒', label: 'Cart', href: '/cart' },
    { icon: '👤', label: user ? 'Account' : 'Login', href: user ? '/account' : '/auth/login' },
  ];

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  const getActiveTab = () => {
    if (pathname === '/') return 0;
    if (pathname.startsWith('/category')) return 1;
    if (pathname.startsWith('/cart')) return 2;
    if (pathname.startsWith('/account') || pathname.startsWith('/auth')) return 3;
    return 1; // ক্যাটাগরি পেজে থাকলে ক্যাটাগরি ট্যাব সিলেক্টেড থাকবে
  };

  const activeTab = getActiveTab();

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F8', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '80px' }}>
      
      {/* হেডার */}
      <div style={{ padding: '16px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>
            All Popular
          </h1>
          <p style={{ fontSize: '11px', color: '#9095A0', margin: '2px 0 0' }}>
            Popular Categories
          </p>
        </div>
        <div style={{ fontSize: '12px', color: '#FA5A28', fontWeight: '600', cursor: 'pointer' }}>
          Popular
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 145px)', overflow: 'hidden' }}>
        
        {/* বামপাশের ক্যাটাগরি লিস্ট (Left Navigation) */}
        <div style={{ 
          width: '100px', 
          background: '#FFFFFF', 
          overflowY: 'auto', 
          borderRight: '1px solid #EBEBEB',
          WebkitOverflowScrolling: 'touch' 
        }}>
          {categories.map((cat, i) => {
            const isActive = activeCategory === cat.slug;
            return (
              <div 
                key={i}
                onClick={() => setActiveCategory(cat.slug)}
                style={{
                  padding: '16px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: isActive ? '#FA5A28' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#4B5563',
                  borderLeft: isActive ? '4px solid #1A1A1A' : '4px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{cat.icon}</div>
                <div style={{ fontSize: '10px', fontWeight: isActive ? '700' : '500', lineHeight: '1.2' }}>
                  {cat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* ডানপাশের ৩-কলাম গ্রিড (Right Content) */}
        <div style={{ 
          flex: 1, 
          padding: '16px 12px', 
          overflowY: 'auto', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '10px',
          alignContent: 'start'
        }}>
          {subProducts.map((item, index) => (
            <div 
              key={index}
              onClick={() => router.push('/category/detail')}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '12px 6px',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '95px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                border: '1px solid #F8F8F8'
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                background: item.imageStyle,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '6px',
                color: '#fff',
                fontSize: '20px'
              }}>
                {item.icon}
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: '600',
                color: '#374151',
                lineHeight: '1.2',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '92%'
              }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* মোবাইল নেভিগেশন বার (সরাসরি পেজে যোগ করা হয়েছে) */}
      <div className="mobile-nav-custom">
        <div className="nav-content">
          {navItems.map((item, i) => (
            <div 
              key={i} 
              className={`nav-item ${activeTab === i ? 'active' : ''}`}
              onClick={() => handleNavClick(item.href)}
            >
              <div className="icon-wrapper">
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
              </div>
              <span className="nav-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .mobile-nav-custom {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
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
        .nav-item.active { color: #e62e04; }
        .icon-wrapper {
          margin-bottom: 1px;
          transition: transform 0.2s ease;
        }
        .nav-item.active .icon-wrapper { transform: scale(1.05); }
        .nav-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.2px;
        }
        .nav-item.active .nav-label { font-weight: 700; }
        .nav-item:active {
          opacity: 0.6;
          transform: scale(0.96);
        }
      `}</style>
    </div>
  );
}