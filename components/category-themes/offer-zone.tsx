"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== টাইপস ====================
interface Product { id: number; title: string; price: number; original_price?: number; image_url?: string; webp_url?: string; rating?: number; sold?: number; stock?: number; subcategory?: string; }
interface SubCategory { id: number; name: string; slug: string; icon?: string; }
interface LiveStats { activeVisitors: number; ordersToday: number; revenueToday: number; }

// ==================== কনস্ট্যান্ট ====================
const CATEGORY_SLUG = 'offer-zone';
const PAGE_SIZE = 5;
const rankEmojis = ['👑', '🥈', '🥉'];
const subIcons: Record<string, string> = {
  'flash-sale': '🎯', 'daily-deal': '🔥', 'coupon': '🎁',
  'bundle': '🏷️', 'clearance': '🧹', 'best-seller': '⭐',
};

const dummyNotifications = [
  { id: 1, location: 'কুষ্টিয়া', product: 'Samsung Galaxy', time: 'এইমাত্র' },
  { id: 2, location: 'ঢাকা', product: 'iPhone 15', time: '২ মিনিট আগে' },
  { id: 3, location: 'রাজশাহী', product: 'Redmi Note 12', time: '৫ মিনিট আগে' },
];

const dummySubs: SubCategory[] = [
  { id: 1, name: 'ফ্ল্যাশ সেল', slug: 'flash-sale', icon: '🎯' },
  { id: 2, name: 'ডেইলি ডিল', slug: 'daily-deal', icon: '🔥' },
  { id: 3, name: 'কুপন', slug: 'coupon', icon: '🎁' },
  { id: 4, name: 'বান্ডেল', slug: 'bundle', icon: '🏷️' },
  { id: 5, name: 'ক্লিয়ারেন্স', slug: 'clearance', icon: '🧹' },
  { id: 6, name: 'বেস্ট সেলার', slug: 'best-seller', icon: '⭐' },
];

// ==================== মেইন ====================
export default function OfferZoneTheme() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentNotif, setCurrentNotif] = useState(0);
  const [bannerSlide, setBannerSlide] = useState(0);
  const [liveStats, setLiveStats] = useState<LiveStats>({ activeVisitors: 23, ordersToday: 12, revenueToday: 15000 });
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 32, seconds: 15 });
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bannerProducts = useMemo(() => products.slice(0, 5), [products]);
  const bestSellers = useMemo(() => products.slice(0, 2), [products]);
  const newArrivals = useMemo(() => products.slice(2, 4), [products]);

  // ==================== Supabase: সাব-ক্যাটাগরি ====================
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('subcategories').select('id, name, slug').eq('category_slug', CATEGORY_SLUG).eq('is_active', true).order('name');
      if (!cancelled && data?.length) {
        setSubCategories(data.map((s: any) => ({ ...s, icon: subIcons[s.slug] || '📦' })));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const displaySubs = subCategories.length > 0 ? subCategories : dummySubs;

  // ==================== Supabase: প্রোডাক্ট (Pagination) ====================
  const loadProducts = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    const from = (pageNum - 1) * PAGE_SIZE, to = from + PAGE_SIZE - 1;
    let q = supabase.from('products').select('id,title,price,original_price,image_url,webp_url,rating,sold,stock,subcategory', { count: 'exact' }).eq('category', CATEGORY_SLUG).order('created_at', { ascending: false }).range(from, to);
    if (activeSubCategory !== 'all') q = q.eq('subcategory', activeSubCategory);
    const { data, count } = await q;
    if (data?.length) {
      const f = data.map((p: any) => ({ ...p, original_price: p.original_price || Math.floor(p.price * 1.5), stock: p.stock || Math.floor(Math.random() * 20) + 1 }));
      if (append) setProducts(prev => [...prev, ...f]); else setProducts(f);
      setHasMore(count ? from + data.length < count : false);
    } else {
      if (!append) setProducts(Array.from({ length: PAGE_SIZE }, (_, i) => ({ id: i + 1 + (pageNum - 1) * PAGE_SIZE, title: `অফার প্রোডাক্ট ${i + 1}`, price: Math.floor(Math.random() * 5000) + 200, original_price: Math.floor(Math.random() * 8000) + 500, image_url: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&sig=${i + (pageNum - 1) * PAGE_SIZE}`, rating: +(Math.random() * 2 + 3).toFixed(1), sold: Math.floor(Math.random() * 1000), stock: Math.floor(Math.random() * 15) + 1 })));
      setHasMore(pageNum < 5);
    }
    setLoading(false); setLoadingMore(false);
  }, [activeSubCategory]);

  useEffect(() => { setPage(1); loadProducts(1); }, [loadProducts]);
  const handleLoadMore = useCallback(() => { const np = page + 1; setPage(np); loadProducts(np, true); }, [page, loadProducts]);

  // ==================== Infinite Scroll ====================
  useEffect(() => {
    const h = () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        if (loadingMore || !hasMore) return;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 300) handleLoadMore();
      }, 150);
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => { window.removeEventListener('scroll', h); if (scrollTimer.current) clearTimeout(scrollTimer.current); };
  }, [loadingMore, hasMore, handleLoadMore]);

  // ==================== কাউন্টডাউন ====================
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(p => {
      if (p.seconds > 0) return { ...p, seconds: p.seconds - 1 };
      if (p.minutes > 0) return { ...p, minutes: p.minutes - 1, seconds: 59 };
      if (p.hours > 0) return { hours: p.hours - 1, minutes: 59, seconds: 59 };
      return p;
    }), 1000);
    return () => clearInterval(t);
  }, []);

  // ==================== ব্যানার অটো স্লাইড ====================
  useEffect(() => {
    if (bannerProducts.length === 0) return;
    const t = setInterval(() => setBannerSlide(p => (p + 1) % bannerProducts.length), 3000);
    return () => clearInterval(t);
  }, [bannerProducts]);

  // ==================== নোটিফিকেশন ====================
  useEffect(() => {
    const t = setInterval(() => setCurrentNotif(p => (p + 1) % dummyNotifications.length), 5000);
    return () => clearInterval(t);
  }, []);

  // ==================== লাইভ ভিজিটর ====================
  useEffect(() => {
    let cancelled = false;
    (async () => { try { await supabase.rpc('increment_visitor', { page_slug_param: CATEGORY_SLUG }); } catch {} })();
    const unload = () => { try { supabase.rpc('decrement_visitor', { page_slug_param: CATEGORY_SLUG }); } catch {} };
    window.addEventListener('beforeunload', unload);
    const ch = supabase.channel(`pg-${CATEGORY_SLUG}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'page_analytics', filter: `page_slug=eq.${CATEGORY_SLUG}` }, (pl: any) => {
      if (!cancelled && pl.new) setLiveStats({ activeVisitors: pl.new.active_visitors || 0, ordersToday: pl.new.total_orders_today || 0, revenueToday: pl.new.total_revenue_today || 0 });
    }).subscribe();
    return () => { cancelled = true; unload(); window.removeEventListener('beforeunload', unload); supabase.removeChannel(ch); };
  }, []);

  // ==================== হ্যান্ডলার ====================
  const handleSubClick = useCallback((slug: string) => { setActiveSubCategory(slug); setPage(1); setProducts([]); setHasMore(true); }, []);
  const handleProductClick = useCallback((id: number) => router.push(`/product/${id}`), [router]);

  // ==================== ফ্লিপ ডিজিট ====================
  const FlipDigit = ({ value, label }: { value: number; label: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <div style={{ background: '#FFF', border: '2px solid #FF2D55', borderRadius: '8px', padding: '8px 10px', minWidth: '40px', textAlign: 'center', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.span key={value} initial={{ rotateX: -90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} exit={{ rotateX: 90, opacity: 0 }} transition={{ duration: 0.3 }} style={{ fontSize: '22px', fontWeight: '900', color: '#FF2D55', fontFamily: 'monospace', display: 'block' }}>{String(value).padStart(2, '0')}</motion.span>
        </AnimatePresence>
      </div>
      <span style={{ fontSize: '8px', color: '#999' }}>{label}</span>
    </div>
  );

  // ==================== প্রোডাক্ট কার্ড ====================
  const ProductCard = ({ product, rank, large }: { product: Product; rank?: number; large?: boolean }) => {
    const disc = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0;
    const savings = product.original_price ? product.original_price - product.price : 0;
    const soldP = product.stock ? Math.min(100, Math.round(((product.stock - 2) / product.stock) * 100)) : 80;
    const imgH = large ? '180px' : '120px';

    return (
      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-20px' }} transition={{ duration: 0.3 }} whileHover={{ scale: 1.02 }}
        style={{ background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F0F0F0', position: 'relative' }}
        onClick={() => product.id && handleProductClick(product.id)}>
        {rank !== undefined && rank < 3 && <div style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 5, background: rank === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' : rank === 1 ? '#C0C0C0' : '#CD7F32', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '800', color: rank === 0 ? '#000' : '#FFF' }}>{rankEmojis[rank]}</div>}
        {disc > 0 && <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 5, background: '#FF2D55', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: '800', color: '#FFF' }}>-{disc}%</div>}
        <div style={{ width: '100%', height: imgH, background: '#F5F5F5', overflow: 'hidden' }}><img src={product.image_url || product.webp_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" decoding="async" /></div>
        <div style={{ padding: large ? '12px' : '8px' }}>
          <p style={{ fontSize: large ? '13px' : '11px', fontWeight: '600', color: '#212121', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</p>
          {product.rating && <span style={{ fontSize: '10px', color: '#FFA500', fontWeight: '600' }}>⭐ {product.rating}</span>}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: large ? '16px' : '14px', fontWeight: '800', color: '#FF2D55' }}>৳{product.price?.toLocaleString()}</span>
            {product.original_price && <span style={{ fontSize: '10px', color: '#9E9E9E', textDecoration: 'line-through' }}>৳{product.original_price?.toLocaleString()}</span>}
          </div>
          {savings > 0 && <p style={{ fontSize: '9px', color: '#2AB573', margin: '2px 0 0', fontWeight: '600' }}>💰 সেভ ৳{savings.toLocaleString()}</p>}
          {product.stock && product.stock <= 10 && <div style={{ marginTop: '6px' }}><div style={{ width: '100%', height: '3px', background: '#F0F0F0', borderRadius: '2px', overflow: 'hidden' }}><motion.div initial={{ width: 0 }} whileInView={{ width: `${soldP}%` }} viewport={{ once: true }} transition={{ duration: 1 }} style={{ height: '100%', background: 'linear-gradient(90deg, #FF2D55, #FF6B35)', borderRadius: '2px' }} /></div><p style={{ fontSize: '8px', color: '#FF2D55', margin: '2px 0 0' }}>⚡ মাত্র {product.stock}টি</p></div>}
        </div>
      </motion.div>
    );
  };

  // ==================== সেকশন টাইটেল ====================
  const SectionTitle = ({ children, color }: { children: React.ReactNode; color?: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '0 16px' }}>
      <span style={{ fontSize: '15px', fontWeight: '700', color: color || '#212121' }}>{children}</span>
      <div style={{ flex: 1, height: '1px', background: '#E8E8E8' }} />
    </div>
  );

  const LoadingDots = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '20px' }}>
      {['#FF2D55', '#FF6B35', '#FFA500'].map((c, i) => <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }} style={{ width: '8px', height: '8px', background: c, borderRadius: '50%' }} />)}
    </div>
  );

  // ==================== রেন্ডার ====================
  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', fontFamily: 'system-ui, sans-serif', paddingBottom: '60px' }}>

      {/* ===== হিরো ব্যানার স্লাইডার ===== */}
      {bannerProducts.length > 0 && (
        <div style={{ padding: '12px 16px' }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)', borderRadius: '14px', padding: '14px', color: '#FFF', position: 'relative', overflow: 'hidden', minHeight: '120px' }}>
            <AnimatePresence mode="wait">
              <motion.div key={bannerSlide} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={bannerProducts[bannerSlide]?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'} style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.5)' }} alt="" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '11px', opacity: 0.9, margin: '0 0 2px' }}>⚡ ফ্ল্যাশ ডিল</p>
                  <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px' }}>{bannerProducts[bannerSlide]?.title}</p>
                  <span style={{ fontSize: '18px', fontWeight: '900' }}>৳{bannerProducts[bannerSlide]?.price?.toLocaleString()}</span>
                </div>
              </motion.div>
            </AnimatePresence>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '10px' }}>
              {bannerProducts.map((_, i) => <div key={i} style={{ width: i === bannerSlide ? '16px' : '6px', height: '6px', borderRadius: '3px', background: i === bannerSlide ? '#FFF' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s' }} />)}
            </div>
          </motion.div>
        </div>
      )}

      {/* ===== লাইভ স্ট্যাটস ===== */}
      <div style={{ padding: '0 16px', marginBottom: '12px' }}>
        <div style={{ background: '#FFF', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-around', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          {[{ icon: '👁️', value: liveStats.activeVisitors, label: 'দেখছে' }, { icon: '🛒', value: liveStats.ordersToday, label: 'অর্ডার' }, { icon: '💰', value: `৳${(liveStats.revenueToday / 1000).toFixed(0)}K`, label: 'বিক্রি' }].map((s, i) => (
            <div key={i}><span style={{ fontSize: '16px', display: 'block' }}>{s.icon}</span><span style={{ fontSize: '13px', fontWeight: '700', color: '#212121', display: 'block' }}>{s.value}</span><span style={{ fontSize: '9px', color: '#999' }}>{s.label}</span></div>
          ))}
        </div>
      </div>

      {/* ===== ৬-কলাম সাব-ক্যাটাগরি ===== */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <SectionTitle color="#212121">🛍️ Shopping Guide</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
          {displaySubs.map((sub) => (
            <motion.div key={sub.id} whileTap={{ scale: 0.95 }} onClick={() => handleSubClick(sub.slug)}
              style={{ background: activeSubCategory === sub.slug ? '#FFF0F0' : '#FFF', borderRadius: '10px', padding: '10px 4px', textAlign: 'center', cursor: 'pointer', border: activeSubCategory === sub.slug ? '2px solid #FF2D55' : '1px solid #F0F0F0', transition: 'all 0.2s', boxShadow: activeSubCategory === sub.slug ? '0 2px 8px rgba(255,45,85,0.15)' : '0 1px 3px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '22px', display: 'block', marginBottom: '4px' }}>{sub.icon || '📦'}</span>
              <span style={{ fontSize: '9px', fontWeight: '600', color: '#212121', lineHeight: '1.2' }}>{sub.name}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ===== বেস্ট সেলার + নিউ অ্যারাইভাল ===== */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <SectionTitle color="#FF2D55">💰 Best Sellers</SectionTitle>
            {loading ? <LoadingDots /> : bestSellers.map((p, i) => <div key={i} style={{ marginBottom: '8px' }}><ProductCard product={p} rank={i} large /></div>)}
          </div>
          <div>
            <SectionTitle color="#2AB573">🆕 New Arrivals</SectionTitle>
            {loading ? <LoadingDots /> : newArrivals.map((p, i) => <div key={i} style={{ marginBottom: '8px' }}><ProductCard product={p} large /></div>)}
          </div>
        </div>
      </div>

      {/* ===== সব প্রোডাক্ট ৩ কলাম ===== */}
      <div style={{ padding: '0 16px', marginBottom: '16px' }}>
        <SectionTitle>🛒 All Products</SectionTitle>
        {loading ? <LoadingDots /> : products.length === 0 ? <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>📭 নেই</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {products.map((p, i) => <ProductCard key={i} product={p} />)}
          </div>
        )}
      </div>

      {/* ===== PC Layout ===== */}
      <div className="hidden lg:block" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        {/* PC ব্যানার */}
        {bannerProducts.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)', borderRadius: '16px', padding: '24px', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center', overflow: 'hidden' }}>
            {bannerProducts.slice(0, 5).map((p, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} style={{ flex: 1, textAlign: 'center', color: '#FFF', cursor: 'pointer' }} onClick={() => p.id && handleProductClick(p.id)}>
                <img src={p.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'} style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.5)', marginBottom: '6px' }} alt="" />
                <p style={{ fontSize: '10px', fontWeight: '600', margin: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</p>
                <span style={{ fontSize: '12px', fontWeight: '800' }}>৳{p.price?.toLocaleString()}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* PC ৬-কলাম */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {displaySubs.map((sub) => (
            <motion.div key={sub.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleSubClick(sub.slug)}
              style={{ background: activeSubCategory === sub.slug ? '#FFF0F0' : '#FFF', borderRadius: '12px', padding: '16px 8px', textAlign: 'center', cursor: 'pointer', border: activeSubCategory === sub.slug ? '2px solid #FF2D55' : '1px solid #F0F0F0', boxShadow: activeSubCategory === sub.slug ? '0 4px 16px rgba(255,45,85,0.15)' : '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '6px' }}>{sub.icon || '📦'}</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#212121' }}>{sub.name}</span>
            </motion.div>
          ))}
        </div>

        {/* PC বেস্ট সেলার + নিউ অ্যারাইভাল */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div><SectionTitle color="#FF2D55">💰 Best Sellers</SectionTitle>{loading ? <LoadingDots /> : bestSellers.map((p, i) => <div key={i} style={{ marginBottom: '12px' }}><ProductCard product={p} rank={i} large /></div>)}</div>
          <div><SectionTitle color="#2AB573">🆕 New Arrivals</SectionTitle>{loading ? <LoadingDots /> : newArrivals.map((p, i) => <div key={i} style={{ marginBottom: '12px' }}><ProductCard product={p} large /></div>)}</div>
        </div>

        {/* PC সব ৪ কলাম */}
        <SectionTitle>🛒 All Products</SectionTitle>
        {loading ? <LoadingDots /> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>{products.map((p, i) => <ProductCard key={i} product={p} />)}</div>}
      </div>

      {/* ===== লোড মোর ===== */}
      {hasMore && <div style={{ textAlign: 'center', padding: '20px' }}>{loadingMore ? <LoadingDots /> : <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleLoadMore} style={{ background: 'linear-gradient(135deg, #FF2D55, #FF6B35)', border: 'none', borderRadius: '25px', padding: '10px 24px', fontSize: '13px', fontWeight: '700', color: '#FFF', cursor: 'pointer' }}>🔥 আরো {PAGE_SIZE}টা দেখুন</motion.button>}</div>}
      {!hasMore && products.length > 0 && <p style={{ textAlign: 'center', color: '#999', fontSize: '12px', padding: '16px' }}>✅ সব দেখা শেষ!</p>}

      {/* ===== ফ্রি শিপিং বার ===== */}
      <div className="lg:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FFF', borderTop: '1px solid #F0F0F0', padding: '10px 16px', textAlign: 'center', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: '#FF2D55', margin: 0 }}>🎁 ফ্রি ডেলিভারি ৳৫০০+ অর্ডারে</p>
      </div>

    </div>
  );
}