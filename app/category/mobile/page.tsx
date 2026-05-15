"use client";

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const categories = [
  { label: 'অফার জোন', slug: 'offer-zone', icon: '🎯', color: '#FFF0F0', bgColor: '#FF416C' },
  { label: 'ফোন', slug: 'mobile', icon: '📱', color: '#F0F5FF', bgColor: '#1a73e8' },
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
  { label: 'কৃষি', slug: 'agriculture', icon: '🌾', color: '#F0FFF5', bgColor: '#10B981' },
  { label: 'উপহার', slug: 'gifts', icon: '🎁', color: '#FFF5FF', bgColor: '#EC4899' },
  { label: 'হস্তশিল্প', slug: 'handicraft', icon: '🔪', color: '#FFF0E8', bgColor: '#D44800' },
  { label: 'পুরাতন', slug: 'second-hand', icon: '🏚️', color: '#FFF5F0', bgColor: '#8B4513' },
  { label: 'হোম সার্ভিস', slug: 'home-service', icon: '🏠', color: '#FFF8F0', bgColor: '#FF6B35' },
];

const announcementTexts = [
  "🔥 Flash Sale চলছে! ৫০% পর্যন্ত ছাড়!",
  "🚚 ফ্রি ডেলিভারি ৯৯৯৳+ অর্ডারে!",
  "🎁 নতুন ইউজার? ১৫% ছাড় পান!",
  "⭐ বেস্ট সেলার প্রোডাক্ট দেখুন!",
  "💎 প্রিমিয়াম কোয়ালিটি প্রোডাক্ট!",
];

function MobileCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const themeSlug = searchParams.get('theme');

  const [activeCategory, setActiveCategory] = useState('offer-zone');
  const [products, setProducts] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({ total: 0, avgRating: 0, totalSold: 0 });
  const [announceText, setAnnounceText] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeCat = categories.find(c => c.slug === activeCategory);
  const currentColor = activeCat?.bgColor || '#e62e04';

  // ✅ সাব-ক্যাটাগরি
  useEffect(() => {
    supabase.from('subcategories').select('id, name, slug')
      .eq('category_slug', activeCategory).eq('is_active', true).order('name')
      .then(({ data }) => { if (data) setSubCategories(data); });
  }, [activeCategory]);

  // অ্যানাউন্সমেন্ট
  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => { setAnnounceText(p => (p + 1) % announcementTexts.length); setIsAnimating(false); }, 300);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // ✅ ৫টা করে পেজিনেশন
  const loadProducts = useCallback(async (pageNum = 0, append = false) => {
    if (pageNum === 0) setLoading(true); else setLoadingMore(true);
    const from = pageNum * 5, to = from + 4;
    const { data, count } = await supabase.from('products').select('*', { count: 'exact' })
      .eq('category', activeCategory).order('created_at', { ascending: false }).range(from, to);
    
    if (data?.length) {
      if (append) setProducts(p => [...p, ...data]); else setProducts(data);
      setStats({
        total: count || data.length,
        avgRating: Math.round(data.reduce((s: number, p: any) => s + (p.rating || 0), 0) / data.length * 10) / 10,
        totalSold: data.reduce((s: number, p: any) => s + (p.sold || 0), 0)
      });
      setHasMore(count ? to + 1 < count : false);
    } else if (!append) {
      setProducts(Array.from({ length: 5 }, (_, i) => ({
        id: i + 1, title: `${activeCat?.label || ''} প্রোডাক্ট ${i + 1}`, price: Math.floor(Math.random() * 5000) + 500,
        image_url: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&sig=${i}`,
        rating: (Math.random() * 2 + 3).toFixed(1), sold: Math.floor(Math.random() * 1000),
      })));
      setHasMore(false);
    }
    setLoading(false); setLoadingMore(false);
  }, [activeCategory]);

  useEffect(() => { setPage(0); loadProducts(0); }, [loadProducts]);

  // ✅ Infinite Scroll
  const handleLoadMore = useCallback(() => { const np = page + 1; setPage(np); loadProducts(np, true); }, [page, loadProducts]);
  useEffect(() => {
    const h = () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        if (loadingMore || !hasMore) return;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 200) handleLoadMore();
      }, 150);
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => { window.removeEventListener('scroll', h); if (scrollTimer.current) clearTimeout(scrollTimer.current); };
  }, [loadingMore, hasMore, handleLoadMore]);

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F8', fontFamily: 'system-ui, sans-serif', paddingBottom: '80px', display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      <div style={{ background: `linear-gradient(135deg, ${currentColor}, ${currentColor}dd)`, padding: '10px 14px', color: 'white', zIndex: 100, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: 'white', padding: '5px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>← Home</button>
          <span style={{ fontSize: '24px' }}>{activeCat?.icon || '🛍️'}</span>
          <h1 style={{ fontSize: '17px', fontWeight: '800', margin: 0 }}>{activeCat?.label || 'ক্যাটাগরি'}</h1>
        </div>
        <div style={{ display: 'flex', gap: '14px', fontSize: '12px', opacity: 0.95, marginBottom: '8px', flexWrap: 'wrap' }}>
          <span>📦 {stats.total}টি</span>
          {stats.avgRating > 0 && <span>⭐ {stats.avgRating}</span>}
          {stats.totalSold > 0 && <span>🔥 {stats.totalSold} বিক্রি</span>}
        </div>
        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', fontWeight: '600', textAlign: 'center', position: 'relative', overflow: 'hidden', minHeight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <span style={{ transition: 'all 0.3s ease', opacity: isAnimating ? 0 : 1, transform: isAnimating ? 'translateY(-10px)' : 'translateY(0)' }}>{announcementTexts[announceText]}</span>
          <div style={{ display: 'flex', gap: '3px', position: 'absolute', right: '10px' }}>
            {announcementTexts.map((_, i) => (<div key={i} style={{ width: i === announceText ? '14px' : '4px', height: '4px', borderRadius: '2px', background: i === announceText ? 'white' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s ease' }} />))}
          </div>
        </div>
        {subCategories.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '6px 0 2px' }}>
            {subCategories.map((s: any) => (
              <button key={s.id} onClick={() => setActiveCategory(s.slug)} style={{ flexShrink: 0, padding: '5px 12px', borderRadius: '16px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>{s.name}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%' }}>
        <div style={{ width: '100px', background: '#FFFFFF', overflowY: 'auto', borderRight: '1px solid #EBEBEB', flexShrink: 0, height: '100%', WebkitOverflowScrolling: 'touch' }}>
          {categories.map((cat, i) => {
            const isActive = activeCategory === cat.slug;
            return (
              <div key={i} onClick={() => { setActiveCategory(cat.slug); setPage(0); }} style={{ padding: '14px 8px', textAlign: 'center', cursor: 'pointer', background: isActive ? cat.color : 'transparent', color: isActive ? '#FA5A28' : '#4B5563', borderLeft: isActive ? '3px solid #FA5A28' : '3px solid transparent', fontWeight: isActive ? '700' : '500' }}>
                <div style={{ fontSize: '22px', marginBottom: '3px' }}>{cat.icon}</div>
                <div style={{ fontSize: '10px', lineHeight: '1.2' }}>{cat.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', background: '#fff', height: '100%', WebkitOverflowScrolling: 'touch' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>⏳ লোড হচ্ছে...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>📭 কোনো প্রোডাক্ট নেই</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {products.map((p, i) => (
                  <div key={i} onClick={() => p.id && router.push(`/product/${p.id}`)} style={{ background: '#FFFFFF', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #f0f0f0' }}>
                    <img src={p.image_url || p.webp_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'} style={{ width: '100%', height: '100px', objectFit: 'cover' }} alt="" loading="lazy" />
                    <div style={{ padding: '8px' }}>
                      <p style={{ fontSize: '11px', fontWeight: '600', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                      {p.rating > 0 && <span style={{ fontSize: '10px', color: '#FFB347', fontWeight: '600' }}>⭐ {p.rating}</span>}
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#FA5A28', marginTop: '3px' }}>৳{p.price?.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
              {hasMore && (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <button onClick={handleLoadMore} disabled={loadingMore} style={{ padding: '10px 24px', background: loadingMore ? '#ccc' : currentColor, color: 'white', border: 'none', borderRadius: '20px', cursor: loadingMore ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px' }}>{loadingMore ? '⏳' : '🔥 আরো ৫টি'}</button>
                </div>
              )}
              {!hasMore && products.length > 0 && <p style={{ textAlign: 'center', color: '#999', fontSize: '12px', padding: '12px' }}>✅ শেষ</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>⏳</div>}>
      <MobileCategoryPage />
    </Suspense>
  );
}