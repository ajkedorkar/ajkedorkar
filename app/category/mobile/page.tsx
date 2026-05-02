"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const categories = [
  { label: 'অফার জোন', slug: 'offer-zone', icon: '🎯', color: '#FFF0F0' },
  { label: 'মোবাইল', slug: 'mobile', icon: '📱', color: '#F0F5FF' },
  { label: 'কম্পিউটার', slug: 'computer', icon: '💻', color: '#F0FFF0' },
  { label: 'ইলেকট্রনিক্স', slug: 'electronics', icon: '⚡', color: '#FFF8F0' },
  { label: 'ফ্যাশন', slug: 'fashion', icon: '👗', color: '#FFF0F8' },
  { label: 'গাড়ি', slug: 'car', icon: '🚗', color: '#F0F8FF' },
  { label: 'চাকরি', slug: 'job', icon: '💼', color: '#F8F0FF' },
  { label: 'সার্ভিস', slug: 'service', icon: '🔧', color: '#FFFFF0' },
  { label: 'জমি', slug: 'property', icon: '🏠', color: '#FFF5F0' },
  { label: 'তথ্য', slug: 'info', icon: '📢', color: '#F0FFFF' },
  { label: 'পাত্রপাত্রী', slug: 'matrimony', icon: '💑', color: '#FFF0FF' },
  { label: 'ভাড়া', slug: 'rent', icon: '🔑', color: '#F5FFF0' },
  { label: 'জরুরি', slug: 'emergency', icon: '🚑', color: '#FFF0F0' },
  { label: 'পশু', slug: 'animal', icon: '🐄', color: '#F0FFF5' },
  { label: 'খাদ্য', slug: 'food', icon: '🍪', color: '#FFF8F0' },
  { label: 'নিত্যপণ্য', slug: 'daily-needs', icon: '🛒', color: '#F8FFF0' },
  { label: 'উপহার', slug: 'gifts', icon: '🎁', color: '#FFF5FF' },
  { label: 'হস্তশিল্প', slug: 'handicraft', icon: '🔪', color: '#FFF0E8' },
];

export default function MobileCategoryPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('offer-zone');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ক্যাটাগরি ক্লিক করলে প্রোডাক্ট লোড
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category', activeCategory)
        .order('created_at', { ascending: false })
        .limit(15);
      
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        // ডামি ডাটা
        const dummy = Array.from({ length: 9 }, (_, i) => ({
          id: i + 1,
          title: `${categories.find(c => c.slug === activeCategory)?.label || ''} প্রোডাক্ট ${i + 1}`,
          price: Math.floor(Math.random() * 5000) + 500,
          image_url: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&sig=${i}`,
        }));
        setProducts(dummy);
      }
      setLoading(false);
    }
    loadProducts();
  }, [activeCategory]);

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F8', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px' }}>
      
      {/* হেডার */}
      <div style={{ padding: '16px', background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <button onClick={() => router.push('/')} style={{
          background: 'none', border: 'none', fontSize: '14px', color: '#FA5A28',
          cursor: 'pointer', fontWeight: '600', marginBottom: '8px',
        }}>← Home</button>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1A1A1A', margin: 0 }}>
          {categories.find(c => c.slug === activeCategory)?.label || 'ক্যাটাগরি'}
        </h1>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 145px)', overflow: 'hidden' }}>
        
        {/* বাম পাশের ক্যাটাগরি লিস্ট */}
        <div style={{ 
          width: '105px', 
          background: '#FFFFFF', 
          overflowY: 'auto', 
          borderRight: '1px solid #EBEBEB',
          flexShrink: 0,
        }}>
          {categories.map((cat, i) => {
            const isActive = activeCategory === cat.slug;
            return (
              <div 
                key={i}
                onClick={() => {
                  setActiveCategory(cat.slug);
                }}
                style={{
                  padding: '14px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: isActive ? cat.color : 'transparent',
                  color: isActive ? '#FA5A28' : '#4B5563',
                  borderLeft: isActive ? '3px solid #FA5A28' : '3px solid transparent',
                  transition: 'all 0.15s ease',
                  fontWeight: isActive ? '700' : '500',
                }}
              >
                <div style={{ fontSize: '22px', marginBottom: '3px' }}>{cat.icon}</div>
                <div style={{ fontSize: '10px', lineHeight: '1.2' }}>{cat.label}</div>
              </div>
            );
          })}
        </div>

        {/* ডান পাশের ৩-কলাম প্রোডাক্ট গ্রিড */}
        <div style={{ 
          flex: 1, 
          padding: '12px 10px', 
          overflowY: 'auto',
          background: '#fff',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>⏳</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '8px' }}>📭</span>
              প্রোডাক্ট নেই
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {products.map((product, idx) => (
                <div 
                  key={idx}
                  onClick={() => product.id && router.push(`/product/${product.id}`)}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.2s',
                  }}
                >
                  <img 
                    src={product.image_url || product.webp_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                    style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                    alt={product.title}
                  />
                  <div style={{ padding: '8px' }}>
                    <p style={{
                      fontSize: '10px', fontWeight: '600', color: '#333', margin: '0 0 4px 0',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {product.title}
                    </p>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#FA5A28' }}>
                      ৳{product.price?.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}