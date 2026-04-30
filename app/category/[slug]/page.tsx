"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
// মূল PCHeader ইমপোর্ট করা হলো
import PCHeader from '@/components/PCHeader';

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
  const slug = params.slug as string || 'offer-zone';
  const category = categoryMap[slug] || { label: slug, icon: '🛍️' };

  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingText, setTypingText] = useState('');
  const [loading, setLoading] = useState(true);

  // সার্চ বারের টাইপিং অ্যানিমেশনের জন্য
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
        // রিয়েল লেডিস আইটেম, শাড়ি ও ব্র্যান্ডের রিয়েল প্রোডাক্ট ডাটা
        const sampleProducts = [
          { id: 1, title: 'Traditional Premium Kanjivaram Silk Saree', price: 4500, image_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500', sold: 420 },
          { id: 2, title: 'Elegant Floral Georgette Salwar Kameez', price: 2850, image_url: 'https://images.unsplash.com/photo-1610030469980-44ea657d4049?w=500', sold: 380 },
          { id: 3, title: 'Designer Embroidered Party Wear Saree', price: 5800, image_url: 'https://images.unsplash.com/photo-1595777457583-95e07b227c19?w=500', sold: 195 },
          { id: 4, title: 'Ladies Soft Leather Handbag Premium Collection', price: 2450, image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', sold: 850 },
          { id: 5, title: 'Heavy Zari Work Bridal Saree', price: 8900, image_url: 'https://images.unsplash.com/photo-1603566138711-d0061e89e471?w=500', sold: 140 },
          { id: 6, title: 'Stylish Casual Ladies Shoes & Heels', price: 1800, image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500', sold: 610 },
          { id: 7, title: 'Cotton Designer Kurti Set for Women', price: 1550, image_url: 'https://images.unsplash.com/photo-1629814101683-113548981604?w=500', sold: 950 },
          { id: 8, title: 'Premium Golden Party Clutch Bag', price: 1900, image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500', sold: 320 }
        ];
        setProducts(sampleProducts);
      }
      setLoading(false);
    }
    loadProducts();
  }, [slug]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Inter, system-ui' }}>

      {/* ===== হেডার সেকশন ===== */}
      <PCHeader 
        typingText={typingText}
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />

      {/* ===== মেইন লেআউট ===== */}
      <div className="main-layout" style={{ display: 'flex', maxWidth: '1440px', margin: '0 auto', padding: '20px 15px', gap: '20px' }}>

        {/* বাম সাইডবার (পিসির জন্য) */}
        <div className="cat-sidebar" style={{
          width: '260px', background: 'white', borderRadius: '10px', padding: '10px 0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)', flexShrink: 0, height: 'fit-content',
          border: '1px solid rgba(0,0,0,0.03)'
        }}>
          {allCategories.map((cat, i) => (
            <div key={i} onClick={() => router.push(`/category/${cat.slug}`)} style={{
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
            <div style={{ textAlign: 'center', padding: '60px', color: '#999', fontSize: '13px', background: 'white', borderRadius: '10px' }}>
              ⏳ প্রোডাক্ট লোড হচ্ছে...
            </div>
          ) : (
            <div className="product-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '14px',
            }}>
              {products.map((product, i) => (
                <div key={i} style={{
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
                  <img 
                    src={product.image_url} 
                    alt={product.title} 
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
                        {product.sold} SOLD
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .cat-sidebar { display: none; }
        .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        
        @media (min-width: 768px) {
          .cat-sidebar { display: block !important; }
          .product-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 16px; }
        }

        @media (min-width: 1024px) {
          .product-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}