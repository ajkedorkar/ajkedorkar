"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PCHeader from '@/components/PCHeader';
import MobileHeader from '@/components/MobileHeader';
import { getWebPUrl } from '@/lib/imageCompress'; // ✅ যোগ করুন

const categoryMap: Record<string, { label: string; icon: string }> = {
  'offer-zone': { label: 'অফার জোন', icon: '🎯' },
  'mobile': { label: 'ফোন', icon: '📱' },
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
  'agriculture': { label: 'কৃষি', icon: '🌾' },
  'gifts': { label: 'উপহার', icon: '🎁' },
  'handicraft': { label: 'হস্তশিল্প', icon: '🔪' },
  'second-hand': { label: 'পুরাতন', icon: '🏚️' },
  'home-service': { label: 'হোম সার্ভিস', icon: '🏠' },
};

const allCategories = [
  { icon: '🎯', label: 'অফার জোন', slug: 'offer-zone' },
  { icon: '📱', label: 'ফোন', slug: 'mobile' },
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
  { icon: '🌾', label: 'কৃষি', slug: 'agriculture' },
  { icon: '🎁', label: 'উপহার', slug: 'gifts' },
  { icon: '🔪', label: 'হস্তশিল্প', slug: 'handicraft' },
  { icon: '🏚️', label: 'পুরাতন', slug: 'second-hand' },
  { icon: '🏠', label: 'হোম সার্ভিস', slug: 'home-service' },
];

// ✅ Skeleton Loader
const ProductSkeleton = () => (
  <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.04)' }}>
    <div style={{ width: '100%', height: '190px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ padding: '12px' }}>
      <div style={{ height: '34px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '60px', height: '20px', background: '#f0f0f0', borderRadius: '4px' }} />
        <div style={{ width: '50px', height: '20px', background: '#f0f0f0', borderRadius: '4px' }} />
      </div>
    </div>
    <style jsx>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string || 'offer-zone';
  const category = categoryMap[slug] || { label: slug, icon: '🛍️' };

  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingText, setTypingText] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // ✅ সার্চ টাইপিং অ্যানিমেশন
  useEffect(() => {
    let i = 0, isDeleting = false;
    const typing = setInterval(() => {
      const fullText = "Search items...";
      if (!isDeleting) {
        if (i < fullText.length) { 
          setTypingText(fullText.slice(0, i + 1)); 
          i++; 
        } else { 
          isDeleting = true; 
        }
      } else {
        if (i > 0) { 
          setTypingText(fullText.slice(0, i - 1)); 
          i--; 
        } else { 
          isDeleting = false; 
        }
      }
    }, 100);
    return () => clearInterval(typing);
  }, []);

  // ✅ প্রোডাক্ট লোড (Pagination সহ)
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const { data, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('category', slug)
        .order('created_at', { ascending: false })
        .range(0, 15); // প্রথম 16 টি

      if (data && data.length > 0) {
        setProducts(data);
        setHasMore((count || 0) > 16);
      } else {
        // ✅ Sample Products with WebP
        const sampleProducts = [
          { id: 1, title: 'Traditional Premium Kanjivaram Silk Saree', price: 4500, image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', webp_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&fm=webp', sold: 420 },
          { id: 2, title: 'Elegant Floral Georgette Salwar Kameez', price: 2850, image_url: 'https://images.unsplash.com/photo-1610030469980-44ea657d4049?w=500', webp_url: 'https://images.unsplash.com/photo-1610030469980-44ea657d4049?w=500&fm=webp', sold: 380 },
          { id: 3, title: 'Designer Embroidered Party Wear Saree', price: 5800, image_url: 'https://images.unsplash.com/photo-1595777457583-95e07b227c19?w=500', webp_url: 'https://images.unsplash.com/photo-1595777457583-95e07b227c19?w=500&fm=webp', sold: 195 },
          { id: 4, title: 'Ladies Soft Leather Handbag Premium Collection', price: 2450, image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', webp_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&fm=webp', sold: 850 },
          { id: 5, title: 'Heavy Zari Work Bridal Saree', price: 8900, image_url: 'https://images.unsplash.com/photo-1603566138711-d0061e89e471?w=500', webp_url: 'https://images.unsplash.com/photo-1603566138711-d0061e89e471?w=500&fm=webp', sold: 140 },
          { id: 6, title: 'Stylish Casual Ladies Shoes & Heels', price: 1800, image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500', webp_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&fm=webp', sold: 610 }
        ];
        setProducts(sampleProducts);
        setHasMore(false);
      }
      setLoading(false);
    }
    loadProducts();
  }, [slug]);

  // ✅ Load More (Pagination)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    
    const nextPage = page + 1;
    const start = nextPage * 16;
    const end = start + 15;
    
    const { data, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('category', slug)
      .order('created_at', { ascending: false })
      .range(start, end);
      
    if (data && data.length > 0) {
      setProducts(prev => [...prev, ...data]);
      setPage(nextPage);
      setHasMore((count || 0) > end + 1);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  }, [page, loadingMore, hasMore, slug]);

  // ✅ Category Click Handler
  const handleCategoryClick = useCallback((catSlug: string) => {
    router.push(`/category/${catSlug}`);
  }, [router]);

  // ✅ Memoized Categories
  const memoizedCategories = useMemo(() => allCategories, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Inter, system-ui' }}>

      <div className="pc-header-wrapper">
        <PCHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>

      <div className="mobile-header-wrapper">
        <MobileHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>

      <div className="main-layout" style={{ display: 'flex', maxWidth: '1440px', margin: '0 auto', padding: '20px 15px', gap: '20px' }}>

        {/* বাম সাইডবার */}
        <div className="cat-sidebar" style={{
          width: '260px', background: 'white', borderRadius: '10px', padding: '10px 0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)', flexShrink: 0, height: 'fit-content',
          border: '1px solid rgba(0,0,0,0.03)'
        }}>
          {memoizedCategories.map((cat, i) => (
            <div key={i} onClick={() => handleCategoryClick(cat.slug)} style={{
              padding: '10px 18px', cursor: 'pointer', fontSize: '12px',
              display: 'flex', alignItems: 'center', gap: '8px',
              background: slug === cat.slug ? '#fdf2f0' : 'transparent',
              color: slug === cat.slug ? '#e62e04' : '#444',
              fontWeight: slug === cat.slug ? '700' : '400',
              transition: 'all 0.2s ease'
            }}
              onMouseEnter={(e) => { if (slug !== cat.slug) e.currentTarget.style.paddingLeft = '22px'; }}
              onMouseLeave={(e) => { if (slug !== cat.slug) e.currentTarget.style.paddingLeft = '18px'; }}
            >
              <span style={{ fontSize: '16px' }}>{cat.icon}</span> {cat.label}
            </div>
          ))}
        </div>

        {/* প্রোডাক্ট গ্রিড */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '10px', color: '#999' }}>
              🛍️ কোন প্রোডাক্ট পাওয়া যায়নি
            </div>
          ) : (
            <>
              <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                {products.map((product, i) => (
                  <div key={i} 
                    onClick={() => product.id && router.push(`/product/${product.id}`)}
                    style={{
                      cursor: 'pointer',
                      background: 'white', borderRadius: '10px', overflow: 'hidden',
                      border: '1px solid rgba(0,0,0,0.04)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                    }}
                  >
                    {/* ✅ WebP Image with Lazy Loading */}
                    <img 
                      src={getWebPUrl(product.webp_url || product.image_url, 300)} 
                      alt={product.title} 
                      loading="lazy"
                      style={{ width: '100%', height: '190px', objectFit: 'cover', borderBottom: '1px solid rgba(0,0,0,0.03)' }} 
                    />
                    <div style={{ padding: '12px' }}>
                      <p style={{ fontSize: '12px', color: '#333', margin: '0 0 8px 0', lineHeight: '1.4', height: '34px', overflow: 'hidden', fontWeight: '500' }}>
                        {product.title}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: '#e62e04' }}>
                          ৳{product.price?.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '10px', color: '#888', background: '#f8f9fa', padding: '3px 8px', borderRadius: '6px' }}>
                          {product.sold || 0} SOLD
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* ✅ Load More Button */}
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button 
                    onClick={loadMore} 
                    disabled={loadingMore}
                    style={{
                      background: 'white',
                      border: '1px solid #e62e04',
                      color: '#e62e04',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      cursor: loadingMore ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      fontSize: '13px',
                      opacity: loadingMore ? 0.6 : 1
                    }}
                  >
                    {loadingMore ? '⏳ লোড হচ্ছে...' : 'আরও দেখুন +'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        .cat-sidebar { display: none; }
        .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .mobile-header-wrapper { display: block; }
        .pc-header-wrapper { display: none; }
        
        @media (min-width: 768px) {
          .cat-sidebar { display: block !important; }
          .product-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 16px; }
          .mobile-header-wrapper { display: none; }
          .pc-header-wrapper { display: block; }
        }

        @media (min-width: 1024px) {
          .product-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}