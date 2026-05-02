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
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: 'Arial', paddingBottom: '80px' }}>
      
      {/* হেডার */}
      <div style={{ padding: '20px 16px 12px', background: '#fff' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#222', margin: 0 }}>
          Explore Categories
        </h1>
        <p style={{ fontSize: '12px', color: '#999', margin: '4px 0 0' }}>
          আপনার পছন্দের ক্যাটাগরি বেছে নিন
        </p>
      </div>

      {/* ক্যাটাগরি গ্রিড - ৩ কলাম */}
      <div style={{ padding: '0 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {categories.map((cat, i) => (
          <div key={i} 
            onClick={() => router.push(`/category/${cat.slug}`)}
            style={{
              background: cat.color,
              borderRadius: '14px',
              padding: '18px 6px',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '95px',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.03)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '30px', display: 'block', marginBottom: '6px' }}>{cat.icon}</span>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#444', lineHeight: '1.3' }}>
              {cat.label}
            </span>
          </div>
        ))}
      </div>

      {/* নিচের এক্সট্রা স্পেস */}
      <div style={{ height: '20px' }} />
    </div>
  );
}