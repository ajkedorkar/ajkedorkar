"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const categories = [
  { label: 'অফার জোন', slug: 'offer-zone', icon: '🎯', color: '#FFF0F0', bgColor: '#FF416C' },
  { label: 'মোবাইল', slug: 'mobile', icon: '📱', color: '#F0F5FF', bgColor: '#1a73e8' },
  { label: 'কম্পিউটার', slug: 'computer', icon: '💻', color: '#F0FFF0', bgColor: '#00a651' },
  { label: 'ইলেকট্রনিক্স', slug: 'electronics', icon: '⚡', color: '#FFF8F0', bgColor: '#f85606' },
  { label: 'ফ্যাশন', slug: 'fashion', icon: '👗', color: '#FFF0F8', bgColor: '#e62e04' },
  { label: 'গাড়ি', slug: 'car', icon: '🚗', color: '#F0F8FF', bgColor: '#FF6B35' },
  { label: 'চাকরি', slug: 'job', icon: '💼', color: '#F8F0FF', bgColor: '#8B5CF6' },
  { label: 'সার্ভিস', slug: 'service', icon: '🔧', color: '#FFFFF0', bgColor: '#4A90D9' },
  { label: 'জমি', slug: 'property', icon: '🏠', color: '#FFF5F0', bgColor: '#00A651' },
  { label: 'তথ্য', slug: 'info', icon: '📢', color: '#F0FFFF', bgColor: '#06B6D4' },
  { label: 'পাত্রপাত্রী', slug: 'matrimony', icon: '💑', color: '#FFF0FF', bgColor: '#FF6B8A' },
  { label: 'ভাড়া', slug: 'rent', icon: '🔑', color: '#F5FFF0', bgColor: '#F59E0B' },
  { label: 'জরুরি', slug: 'emergency', icon: '🚑', color: '#FFF0F0', bgColor: '#FF0000' },
  { label: 'পশু', slug: 'animal', icon: '🐄', color: '#F0FFF5', bgColor: '#10B981' },
  { label: 'খাদ্য', slug: 'food', icon: '🍪', color: '#FFF8F0', bgColor: '#FFB347' },
  { label: 'নিত্যপণ্য', slug: 'daily-needs', icon: '🛒', color: '#F8FFF0', bgColor: '#6366F1' },
  { label: 'উপহার', slug: 'gifts', icon: '🎁', color: '#FFF5FF', bgColor: '#EC4899' },
  { label: 'হস্তশিল্প', slug: 'handicraft', icon: '🔪', color: '#FFF0E8', bgColor: '#D44800' },
];

const announcementTexts = [
  "🔥 Flash Sale চলছে! ৫০% পর্যন্ত ছাড়!",
  "🚚 ফ্রি ডেলিভারি ৯৯৯৳+ অর্ডারে!",
  "🎁 নতুন ইউজার? ১৫% ছাড় পান!",
  "⭐ বেস্ট সেলার প্রোডাক্ট দেখুন!",
  "💎 প্রিমিয়াম কোয়ালিটি প্রোডাক্ট!",
];

export default function MobileCategoryPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('offer-zone');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, avgRating: 0, totalSold: 0 });
  const [announceText, setAnnounceText] = useState(0);

  const activeCat = categories.find(c => c.slug === activeCategory);
  const currentColor = activeCat?.bgColor || '#e62e04';

  // অ্যানাউন্সমেন্ট স্লাইডার
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnounceText(prev => (prev + 1) % announcementTexts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // ক্যাটাগরি ক্লিক করলে প্রোডাক্ট লোড
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const { data, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('category', activeCategory)
        .order('created_at', { ascending: false })
        .limit(15);
      
      if (data && data.length > 0) {
        setProducts(data);
        const avgRating = data.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / data.length;
        const totalSold = data.reduce((sum: number, p: any) => sum + (p.sold || 0), 0);
        setStats({ total: count || data.length, avgRating: Math.round(avgRating * 10) / 10, totalSold });
      } else {
        const dummy = Array.from({ length: 9 }, (_, i) => ({
          id: i + 1,
          title: `${activeCat?.label || ''} প্রোডাক্ট ${i + 1}`,
          price: Math.floor(Math.random() * 5000) + 500,
          image_url: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&sig=${i}`,
          rating: (Math.random() * 2 + 3).toFixed(1),
          sold: Math.floor(Math.random() * 1000),
        }));
        setProducts(dummy);
        setStats({ total: dummy.length, avgRating: 4.2, totalSold: 2345 });
      }
      setLoading(false);
    }
    loadProducts();
  }, [activeCategory]);

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F8', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px' }}>
      
      {/* ===== কমপ্যাক্ট হেডার ===== */}
      <div style={{
        background: `linear-gradient(135deg, ${currentColor}, ${currentColor}dd)`,
        padding: '10px 14px',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* উপরের রো: ব্যাক + ক্যাটাগরি নাম */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <button onClick={() => router.push('/')} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white',
            padding: '4px 10px', borderRadius: '14px', cursor: 'pointer',
            fontSize: '11px', fontWeight: '600',
          }}>←</button>
          <span style={{ fontSize: '22px' }}>{activeCat?.icon || '🛍️'}</span>
          <h1 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>
            {activeCat?.label || 'ক্যাটাগরি'}
          </h1>
        </div>

        {/* স্ট্যাট + অ্যানিমেশন এক লাইনে */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
          <div style={{ display: 'flex', gap: '10px', fontSize: '10px', opacity: 0.9 }}>
            <span>📦 {stats.total}টি</span>
            {stats.avgRating > 0 && <span>⭐ {stats.avgRating}</span>}
            {stats.totalSold > 0 && <span>🔥 {stats.totalSold}</span>}
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '3px 8px',
            fontSize: '9px', fontWeight: '500', maxWidth: '180px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {announcementTexts[announceText]}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 125px)', overflow: 'hidden' }}>
        
        {/* বাম পাশের ক্যাটাগরি লিস্ট */}
        <div style={{ 
          width: '100px', 
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
                onClick={() => setActiveCategory(cat.slug)}
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
        <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', background: '#fff' }}>
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
                    background: '#FFFFFF', borderRadius: '10px', overflow: 'hidden',
                    cursor: 'pointer', border: '1px solid #f0f0f0', transition: 'all 0.2s',
                  }}
                >
                  <img 
                    src={product.image_url || product.webp_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                    style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                    alt={product.title}
                  />
                  <div style={{ padding: '8px' }}>
                    <p style={{
                      fontSize: '10px', fontWeight: '600', color: '#333', margin: '0 0 2px 0',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{product.title}</p>
                    {product.rating > 0 && (
                      <span style={{ fontSize: '9px', color: '#FFB347' }}>⭐ {product.rating}</span>
                    )}
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#FA5A28', marginTop: '2px' }}>
                      ৳{product.price?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}