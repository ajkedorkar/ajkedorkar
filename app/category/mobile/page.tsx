"use client";

import { useRouter } from 'next/navigation';

const categories = [
  { icon: '🎯', label: 'অফার জোন', slug: 'offer-zone', color: '#FFF0F0' },
  { icon: '📱', label: 'মোবাইল', slug: 'mobile', color: '#F0F5FF' },
  { icon: '💻', label: 'কম্পিউটার', slug: 'computer', color: '#F0FFF0' },
  { icon: '⚡', label: 'ইলেকট্রনিক্স', slug: 'electronics', color: '#FFF8F0' },
  { icon: '👗', label: 'ফ্যাশন', slug: 'fashion', color: '#FFF0F8' },
  { icon: '🚗', label: 'গাড়ি', slug: 'car', color: '#F0F8FF' },
  { icon: '💼', label: 'চাকরি', slug: 'job', color: '#F8F0FF' },
  { icon: '🔧', label: 'সার্ভিস', slug: 'service', color: '#FFFFF0' },
  { icon: '🏠', label: 'জমি', slug: 'property', color: '#FFF5F0' },
  { icon: '📢', label: 'তথ্য', slug: 'info', color: '#F0FFFF' },
  { icon: '💑', label: 'পাত্রপাত্রী', slug: 'matrimony', color: '#FFF0FF' },
  { icon: '🔑', label: 'ভাড়া', slug: 'rent', color: '#F5FFF0' },
  { icon: '🚑', label: 'জরুরি', slug: 'emergency', color: '#FFF0F0' },
  { icon: '🐄', label: 'পশু', slug: 'animal', color: '#F0FFF5' },
  { icon: '🍪', label: 'খাদ্য', slug: 'food', color: '#FFF8F0' },
  { icon: '🛒', label: 'নিত্যপণ্য', slug: 'daily-needs', color: '#F8FFF0' },
  { icon: '🎁', label: 'উপহার', slug: 'gifts', color: '#FFF5FF' },
  { icon: '🔪', label: 'হস্তশিল্প', slug: 'handicraft', color: '#FFF0E8' },
];

export default function MobileCategoryPage() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F8', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: '80px' }}>
      
      {/* হেডার */}
      <div style={{ padding: '16px 16px 12px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>
            All Popular
          </h1>
          <p style={{ fontSize: '11px', color: '#9095A0', margin: '2px 0 0' }}>
            Popular Categories
          </p>
        </div>
        <div style={{ fontSize: '12px', color: '#FA5A28', fontWeight: '600' }}>
          Popular
        </div>
      </div>

      {/* ক্যাটাগরি গ্রিড - ৩ কলাম */}
      <div style={{ padding: '16px 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {categories.map((cat, i) => (
          <div key={i} 
            onClick={() => router.push(`/category/${cat.slug}`)}
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px 8px',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '105px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              border: '1px solid #F0F0F0',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
            }}
          >
            <div style={{ 
              width: '46px', 
              height: '46px', 
              background: cat.color, 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '8px' 
            }}>
              <span style={{ fontSize: '22px' }}>{cat.icon}</span>
            </div>
            <span style={{ 
              fontSize: '11px', 
              fontWeight: '600', 
              color: '#333333', 
              lineHeight: '1.2',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '90%'
            }}>
              {cat.label}
            </span>
          </div>
        ))}
      </div>

      {/* বটম নেভিগেশন বার (Bottom Navigation Bar) */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.04)',
        borderTop: '1px solid #EBEBEB'
      }}>
        {[
          { label: 'Home', icon: '🏠' },
          { label: 'Categories', icon: '⬡' },
          { label: 'Explore', icon: '✨' },
          { label: 'Cart', icon: '🛒' },
          { label: 'Profile', icon: '👤' },
        ].map((item, index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: item.label === 'Categories' ? '#FA5A28' : '#687588',
            fontSize: '10px',
            fontWeight: item.label === 'Categories' ? '600' : 'normal',
            cursor: 'pointer'
          }}>
            <span style={{ fontSize: '20px', marginBottom: '2px' }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}