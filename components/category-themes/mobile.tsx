"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== টাইপস ====================
interface Product { id: number; title: string; price: number; original_price?: number; image_url?: string; webp_url?: string; rating?: number; sold?: number; stock?: number; }
interface SubCategory { id: number; name: string; slug: string; }
interface LiveStats { activeVisitors: number; ordersToday: number; revenueToday: number; }

// ==================== কনস্ট্যান্ট ====================
const CATEGORY_SLUG = 'mobile';
const PAGE_SIZE = 5;
const rankEmojis = ['👑', '🥈', '🥉'];
const accentColor = '#0071E3';
const goldGradient = 'linear-gradient(135deg, #FFD700, #FFA500)';

const dummySubs = ['iPhone', 'Samsung', 'Pixel', 'OnePlus', 'Xiaomi', 'Charger', 'Cover'];
const dummyNotifications = [
  { id: 1, location: 'কুষ্টিয়া', product: 'iPhone 16 Pro', time: 'এইমাত্র' },
  { id: 2, location: 'ঢাকা', product: 'Samsung S25', time: '২ মিনিট আগে' },
  { id: 3, location: 'রাজশাহী', product: 'Google Pixel 9', time: '৫ মিনিট আগে' },
];

const generatePrismParticles = (count: number) => Array.from({ length: count }, (_, i) => ({
  id: i, left: Math.random() * 100, top: Math.random() * 100,
  size: Math.random() * 4 + 2, delay: Math.random() * 6,
  duration: Math.random() * 5 + 3,
  hue: Math.floor(Math.random() * 360),
}));

// ==================== মেইন ====================
export default function MobileTheme() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [activeSubCategory, setActiveSubCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentNotif, setCurrentNotif] = useState(0);
  const [liveStats] = useState<LiveStats>({ activeVisitors: 23, ordersToday: 12, revenueToday: 250000 });
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prismParticles = useMemo(() => generatePrismParticles(15), []);

  // সাব-ক্যাটাগরি
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('subcategories').select('id, name, slug').eq('category_slug', CATEGORY_SLUG).eq('is_active', true).order('name');
      if (!cancelled && data?.length) setSubCategories(data);
    })();
    return () => { cancelled = true; };
  }, []);

  // প্রোডাক্ট (Pagination ৫টা)
  const loadProducts = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    const from = (pageNum - 1) * PAGE_SIZE, to = from + PAGE_SIZE - 1;
    let q = supabase.from('products').select('id,title,price,original_price,image_url,webp_url,rating,sold,stock', { count: 'exact' }).eq('category', CATEGORY_SLUG).order('created_at', { ascending: false }).range(from, to);
    if (activeSubCategory !== 'all') q = q.eq('subcategory', activeSubCategory);
    const { data, count } = await q;
    if (data?.length) {
      const f = data.map((p: any) => ({ ...p, original_price: p.original_price || Math.floor(p.price * 1.5), stock: p.stock || Math.floor(Math.random() * 20) + 1 }));
      if (append) setProducts(prev => [...prev, ...f]); else setProducts(f);
      setHasMore(count ? from + data.length < count : false);
    } else {
      if (!append) setProducts(Array.from({ length: PAGE_SIZE }, (_, i) => ({ id: i + 1, title: `ফোন ${i + 1}`, price: Math.floor(Math.random() * 50000) + 15000, original_price: Math.floor(Math.random() * 80000) + 20000, image_url: `https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&sig=${i}`, rating: +(Math.random() * 1.5 + 3.5).toFixed(1), sold: Math.floor(Math.random() * 500), stock: Math.floor(Math.random() * 10) + 1 })));
      setHasMore(false);
    }
    setLoading(false); setLoadingMore(false);
  }, [activeSubCategory]);

  useEffect(() => { setPage(1); loadProducts(1); }, [loadProducts]);
  const handleLoadMore = useCallback(() => { const np = page + 1; setPage(np); loadProducts(np, true); }, [page, loadProducts]);

  // Infinite Scroll
  useEffect(() => {
    const h = () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current);
      scrollTimer.current = setTimeout(() => {
        if (loadingMore || !hasMore) return;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 300) handleLoadMore();
      }, 200);
    };
    window.addEventListener('scroll', h, { passive: true });
    return () => { window.removeEventListener('scroll', h); if (scrollTimer.current) clearTimeout(scrollTimer.current); };
  }, [loadingMore, hasMore, handleLoadMore]);

  // নোটিফিকেশন
  useEffect(() => {
    const t = setInterval(() => setCurrentNotif(p => (p + 1) % dummyNotifications.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSubClick = useCallback((slug: string) => { setActiveSubCategory(slug); setPage(1); setProducts([]); setHasMore(true); }, []);
  const handleProductClick = useCallback((id: number) => router.push(`/product/${id}`), [router]);

  const subList = subCategories.length ? subCategories : dummySubs.map((name, i) => ({ id: i, name, slug: name }));

  // ==================== প্রোডাক্ট কার্ড ====================
  const ProductCard = useCallback(({ product, rank }: { product: Product; rank?: number }) => {
    const disc = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0;
    const savings = product.original_price ? product.original_price - product.price : 0;
    const soldP = product.stock ? Math.min(100, Math.round(((product.stock - 2) / product.stock) * 100)) : 80;
    return (
      <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-20px' }} transition={{ duration: 0.3 }} whileHover={{ scale: 1.02, boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}
        style={{ background: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', position: 'relative', boxShadow: rank === 0 ? '0 4px 20px rgba(255,215,0,0.2)' : '0 2px 10px rgba(0,0,0,0.06)', border: rank === 0 ? '1px solid rgba(255,215,0,0.4)' : '1px solid #F0F0F0' }}
        onClick={() => product.id && handleProductClick(product.id)}>
        {rank !== undefined && rank < 3 && <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 5, background: rank === 0 ? goldGradient : rank === 1 ? '#A0A0A0' : '#CD7F32', borderRadius: '8px', padding: '3px 10px', fontSize: '12px', fontWeight: '800', color: rank === 0 ? '#000' : '#FFF' }}>{rankEmojis[rank]} #{rank + 1}</div>}
        {disc > 0 && <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 5, background: '#FF2D55', borderRadius: '8px', padding: '3px 10px', fontSize: '11px', fontWeight: '800', color: '#FFF' }}>-{disc}%</div>}
        <div style={{ width: '100%', aspectRatio: '1', background: '#F5F5F5', overflow: 'hidden' }}><img src={product.image_url || product.webp_url || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400'} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} loading="lazy" decoding="async" /></div>
        <div style={{ padding: '12px' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>{product.rating && <span style={{ fontSize: '11px', color: '#FFA500', fontWeight: '600' }}>⭐ {product.rating}</span>}<span style={{ fontSize: '10px', color: '#9CA3AF' }}>👁️ {product.sold || 0}</span></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}><span style={{ fontSize: '16px', fontWeight: '800', color: '#FF2D55' }}>৳{product.price?.toLocaleString()}</span>{product.original_price && <span style={{ fontSize: '11px', color: '#9CA3AF', textDecoration: 'line-through' }}>৳{product.original_price?.toLocaleString()}</span>}</div>
          {savings > 0 && <p style={{ fontSize: '10px', color: '#2AB573', margin: '4px 0 0', fontWeight: '600' }}>💰 সেভ ৳{savings.toLocaleString()}</p>}
          {product.stock && product.stock <= 10 && <div style={{ marginTop: '8px' }}><div style={{ width: '100%', height: '3px', background: '#F0F0F0', borderRadius: '2px', overflow: 'hidden' }}><motion.div initial={{ width: 0 }} whileInView={{ width: `${soldP}%` }} viewport={{ once: true }} transition={{ duration: 1 }} style={{ height: '100%', background: goldGradient, borderRadius: '2px' }} /></div><p style={{ fontSize: '9px', color: '#FF2D55', margin: '3px 0 0', fontWeight: '600' }}>⚡ মাত্র {product.stock}টি</p></div>}
        </div>
      </motion.div>
    );
  }, [handleProductClick]);

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '0 16px' }}>
      <span style={{ fontSize: '15px', fontWeight: '700', color: '#1A1A2E' }}>{children}</span>
      <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
    </div>
  );

  const LoadingDots = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '20px' }}>
      {[accentColor, '#FFD700', '#FF2D55'].map((c, i) => <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }} style={{ width: '8px', height: '8px', background: c, borderRadius: '50%' }} />)}
    </div>
  );

  // ==================== রেন্ডার ====================
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #F0F2F5 50%, #F8FAFC 100%)', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
      
      {/* প্রিজম পার্টিকেল */}
      {prismParticles.map(p => <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: [0, 0.5, 0], scale: [0.5, 1.5, 0.5] }} transition={{ duration: p.duration, delay: p.delay, repeat: Infinity }} style={{ position: 'absolute', left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, background: `hsl(${p.hue}, 70%, 65%)`, borderRadius: '50%', filter: `blur(${p.size}px)`, pointerEvents: 'none', zIndex: 1 }} />)}

      <div style={{ position: 'relative', zIndex: 10, paddingBottom: '60px' }}>

        {/* ===== হিরো ===== */}
        <div style={{ padding: '20px 16px', textAlign: 'center' }}>
          <motion.div animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,113,227,0.08)', border: '1px solid rgba(0,113,227,0.2)', borderRadius: '20px', padding: '5px 14px', marginBottom: '14px' }}>
            <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ width: '6px', height: '6px', background: accentColor, borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', fontWeight: '700', color: accentColor }}>⚡ LIVE ড্রপ!</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: '900', color: '#1A1A2E', marginBottom: '4px' }}>📱 ফোন</motion.h1>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>Premium Collection</p>

          {/* গ্লাস কাউন্টডাউন */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'inline-block', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '14px', padding: '12px 20px' }}>
            <span style={{ fontSize: '10px', color: '#6B7280', display: 'block', marginBottom: '4px' }}>⚡ শেষ হচ্ছে</span>
            <span style={{ fontSize: '22px', fontWeight: '900', fontFamily: 'monospace', color: '#1A1A2E', letterSpacing: '2px' }}>০৪ : ৩২ : ১৫</span>
          </motion.div>
        </div>

        {/* ===== লাইভ স্ট্যাটস ===== */}
        <div style={{ margin: '0 16px 20px', padding: '14px', background: '#FFFFFF', borderRadius: '14px', border: '1px solid #F0F0F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            {[{ icon: '👁️', value: liveStats.activeVisitors, label: 'এখন দেখছে' }, { icon: '🛒', value: liveStats.ordersToday, label: 'আজ অর্ডার' }, { icon: '💰', value: `৳${(liveStats.revenueToday / 1000).toFixed(0)}K`, label: 'মোট বিক্রি' }].map((s, i) => (
              <div key={i}><span style={{ fontSize: '20px', display: 'block', marginBottom: '2px' }}>{s.icon}</span><span style={{ fontSize: '15px', fontWeight: '800', color: '#1A1A2E', display: 'block' }}>{s.value}</span><span style={{ fontSize: '9px', color: '#6B7280' }}>{s.label}</span></div>
            ))}
          </div>
          <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(42,181,115,0.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '5px', height: '5px', background: '#2AB573', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', color: '#4B5563' }}><strong style={{ color: '#2AB573' }}>{dummyNotifications[currentNotif].location}</strong> থেকে <strong>{dummyNotifications[currentNotif].product}</strong> {dummyNotifications[currentNotif].time}</span>
          </div>
        </div>

        {/* ===== সাব-ক্যাটাগরি ===== */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '8px 16px 14px', scrollSnapType: 'x mandatory' }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleSubClick('all')} style={{ flexShrink: 0, padding: '7px 16px', borderRadius: '20px', border: activeSubCategory === 'all' ? `1px solid ${accentColor}` : '1px solid #E5E7EB', background: activeSubCategory === 'all' ? 'rgba(0,113,227,0.08)' : '#FFF', color: activeSubCategory === 'all' ? accentColor : '#6B7280', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>সব</motion.button>
          {subList.map(sub => (
            <motion.button key={sub.id} whileTap={{ scale: 0.95 }} onClick={() => handleSubClick(sub.slug)} style={{ flexShrink: 0, padding: '7px 16px', borderRadius: '20px', border: activeSubCategory === sub.slug ? `1px solid ${accentColor}` : '1px solid #E5E7EB', background: activeSubCategory === sub.slug ? 'rgba(0,113,227,0.08)' : '#FFF', color: activeSubCategory === sub.slug ? accentColor : '#6B7280', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>{sub.name}</motion.button>
          ))}
        </div>

        {/* ===== ফ্ল্যাশ ডিল ===== */}
        <div style={{ marginBottom: '24px' }}><SectionTitle>🔥 হটেস্ট</SectionTitle>
          {loading ? <LoadingDots /> : <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '0 16px', scrollSnapType: 'x mandatory' }}>{products.slice(0, 6).map((p, i) => <div key={i} style={{ minWidth: '160px', scrollSnapAlign: 'start' }}><ProductCard product={p} rank={i} /></div>)}</div>}
        </div>

        {/* ===== বেস্ট ডিলস ===== */}
        <div style={{ marginBottom: '24px' }}><SectionTitle>📱 সব ফোন</SectionTitle>
          {loading ? <LoadingDots /> : products.length === 0 ? <p style={{ textAlign: 'center', color: '#6B7280', padding: '20px' }}>📭 নেই</p> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '0 16px' }}>{products.slice(6).map((p, i) => <ProductCard key={i} product={p} />)}</div>}
        </div>

        {/* ===== PC ===== */}
        <div className="hidden lg:block" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ background: '#FFF', borderRadius: '20px', padding: '30px', display: 'flex', gap: '24px', alignItems: 'center', border: '1px solid #F0F0F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <img src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400" style={{ width: '200px', height: '200px', borderRadius: '16px', objectFit: 'cover' }} alt="" loading="lazy" />
              <div><span style={{ fontSize: '14px', fontWeight: '700', color: accentColor }}>⚡ LIVE ড্রপ</span><h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1A1A2E', margin: '6px 0' }}>iPhone 16 Pro</h2><span style={{ fontSize: '28px', fontWeight: '900', color: '#FF2D55' }}>৳১,৫৯,৯৯৯</span><motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ display: 'block', marginTop: '12px', background: accentColor, border: 'none', borderRadius: '25px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', color: '#FFF', cursor: 'pointer' }}>🔥 এখনই কিনুন</motion.button></div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} style={{ background: '#FFF', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px', border: '1px solid #F0F0F0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}><span style={{ fontSize: '16px', fontWeight: '700', color: '#FFD700' }}>💎 এলিট</span><p style={{ color: '#6B7280', fontSize: '13px' }}>🚚 ফ্রি ডেলিভারি</p><p style={{ color: '#6B7280', fontSize: '13px' }}>💰 ৳১০,০০০ ক্যাশব্যাক</p></motion.div>
          </div>
          <SectionTitle>🔥 হটেস্ট</SectionTitle>
          {loading ? <LoadingDots /> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>{products.slice(0, 4).map((p, i) => <ProductCard key={i} product={p} rank={i} />)}</div>}
          <SectionTitle>📱 সব ফোন</SectionTitle>
          {loading ? <LoadingDots /> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>{products.slice(4).map((p, i) => <ProductCard key={i} product={p} />)}</div>}
        </div>

        {/* ===== লোড মোর ===== */}
        {hasMore && <div style={{ textAlign: 'center', padding: '20px' }}>{loadingMore ? <LoadingDots /> : <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleLoadMore} style={{ background: accentColor, border: 'none', borderRadius: '25px', padding: '10px 24px', fontSize: '13px', fontWeight: '700', color: '#FFF', cursor: 'pointer' }}>🔥 আরো {PAGE_SIZE}টা দেখুন</motion.button>}</div>}
        {!hasMore && products.length > 0 && <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '12px', padding: '16px' }}>✅ সব দেখা শেষ!</p>}

        {/* ফ্রি শিপিং */}
        <div className="lg:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderTop: '1px solid #F0F0F0', padding: '10px 16px', textAlign: 'center', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#1A1A2E', margin: 0 }}>🎁 ফ্রি ডেলিভারি ৳৯৯৯+ অর্ডারে</p>
        </div>

      </div>
    </div>
  );
}