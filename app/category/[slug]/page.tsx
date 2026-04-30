"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// ক্যাটাগরি ম্যাপ
const categoryMap: Record<string, { label: string; icon: string }> = {
  'offer-zone': { label: 'অফার জোন', icon: '🎯' },
  'mobile': { label: 'মোবাইল', icon: '📱' },
  'computer': { label: 'কম্পিউটার', icon: '💻' },
  'electronics': { label: 'ইলেকট্রনিক্স', icon: '⚡' },
  'fashion': { label: 'ফ্যাশন', icon: '👗' },
  'car': { label: 'গাড়ি', icon: '🚗' },
  'job': { label: 'চাকরি', icon: '💼' },
  'service': { label: 'সার্ভিস', icon: '🔧' },
  'property': { label: 'জমি প্রপার্টি', icon: '🏠' },
  'info': { label: 'তথ্য', icon: '📢' },
  'matrimony': { label: 'পাত্রপাত্রী', icon: '💑' },
  'rent': { label: 'ভাড়া রেন্ট', icon: '🔑' },
  'emergency': { label: 'জরুরি সেবা', icon: '🚑' },
  'animal': { label: 'পশু', icon: '🐄' },
  'food': { label: 'খাদ্য পণ্য', icon: '🍪' },
  'daily-needs': { label: 'নিত্যপ্রয়োজনীয়', icon: '🛒' },
  'gifts': { label: 'উপহার', icon: '🎁' },
  'handicraft': { label: 'হস্তশিল্প', icon: '🔪' },
};

// সব ক্যাটাগরি (সাইডবারের জন্য)
const allCategories = [
  { icon: '🎯', label: 'অফার জোন', slug: 'offer-zone' },
  { icon: '📱', label: 'মোবাইল', slug: 'mobile' },
  { icon: '💻', label: 'কম্পিউটার', slug: 'computer' },
  { icon: '⚡', label: 'ইলেকট্রনিক্স', slug: 'electronics' },
  { icon: '👗', label: 'ফ্যাশন', slug: 'fashion' },
  { icon: '🚗', label: 'গাড়ি', slug: 'car' },
  { icon: '💼', label: 'চাকরি', slug: 'job' },
  { icon: '🔧', label: 'সার্ভিস', slug: 'service' },
  { icon: '🏠', label: 'জমি প্রপার্টি', slug: 'property' },
  { icon: '📢', label: 'তথ্য', slug: 'info' },
  { icon: '💑', label: 'পাত্রপাত্রী', slug: 'matrimony' },
  { icon: '🔑', label: 'ভাড়া রেন্ট', slug: 'rent' },
  { icon: '🚑', label: 'জরুরি সেবা', slug: 'emergency' },
  { icon: '🐄', label: 'পশু', slug: 'animal' },
  { icon: '🍪', label: 'খাদ্য পণ্য', slug: 'food' },
  { icon: '🛒', label: 'নিত্যপ্রয়োজনীয়', slug: 'daily-needs' },
  { icon: '🎁', label: 'উপহার', slug: 'gifts' },
  { icon: '🔪', label: 'হস্তশিল্প', slug: 'handicraft' },
];

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const category = categoryMap[slug] || { label: slug, icon: '🛍️' };

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category', slug)
        .order('created_at', { ascending: false })
        .limit(40);

      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(
          Array.from({ length: 12 }, (_, i) => ({
            id: i + 1,
            title: `${category.label} প্রোডাক্ট ${i + 1}`,
            price: Math.floor(Math.random() * 3000) + 500,
            image_url: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&sig=${i}`,
            sold: Math.floor(Math.random() * 2000) + 10,
          }))
        );
      }
      setLoading(false);
    }
    loadProducts();
  }, [slug]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      
      {/* ===== হেডার ===== */}
      <header style={{
        background: '#1a73e8', padding: '12px 20px', color: 'white',
        display: 'flex', alignItems: 'center', gap: '10px', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => router.push('/')} style={{
          background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer', padding: 0,
        }}>←</button>
        <span style={{ fontSize: '22px' }}>{category.icon}</span>
        <div>
          <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
            SHOWING RESULTS FOR {slug.toUpperCase()}
          </h1>
          <p style={{ margin: 0, fontSize: '11px', opacity: 0.8 }}>{products.length} Results</p>
        </div>
      </header>

      {/* ===== মেইন ===== */}
      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', padding: '15px', gap: '15px' }}>
        
        {/* বাম সাইডবার (PC Only) */}
        <div className="cat-sidebar" style={{
          width: '200px', background: 'white', borderRadius: '6px', padding: '8px 0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)', flexShrink: 0, display: 'none', height: 'fit-content',
        }}>
          {allCategories.map((cat, i) => (
            <div key={i} onClick={() => router.push(`/category/${cat.slug}`)} style={{
              padding: '7px 16px', cursor: 'pointer', fontSize: '12px',
              display: 'flex', alignItems: 'center', gap: '6px',
              background: slug === cat.slug ? '#e8f0fe' : 'transparent',
              color: slug === cat.slug ? '#1a73e8' : '#555',
              fontWeight: slug === cat.slug ? '600' : '400',
            }}>
              <span style={{ fontSize: '14px' }}>{cat.icon}</span> {cat.label}
            </div>
          ))}
        </div>

        {/* প্রোডাক্ট গ্রিড */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>⏳ লোড হচ্ছে...</div>
          ) : (
            <div className="product-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
            }}>
              {products.map((product, i) => (
                <div key={i} style={{
                  background: 'white', borderRadius: '6px', overflow: 'hidden',
                  cursor: 'pointer', border: '1px solid #e8eaed', transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
                >
                  <img src={product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontSize: '12px', color: '#333', margin: '0 0 6px 0', lineHeight: '1.4', height: '32px', overflow: 'hidden' }}>
                      {product.title || product.name}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a73e8' }}>
                        ৳{product.price?.toLocaleString() || '0'}
                      </span>
                      <span style={{ fontSize: '10px', color: '#888' }}>{product.sold || 0} SOLD</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CSS */}
      <style jsx global>{`
        .cat-sidebar { display: none; }
        .product-grid { grid-template-columns: repeat(2, 1fr); }
        
        @media (min-width: 768px) {
          .cat-sidebar { display: block !important; }
          .product-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        
        @media (min-width: 1024px) {
          .product-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}