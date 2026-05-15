"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PCHeader from '@/components/PCHeader';
import MobileHeader from '@/components/MobileHeader';

// ==================== ২০টা ক্যাটাগরির বাংলা থিম ====================
const themeConfig: Record<string, any> = {
  'offer-zone': { heroBg: 'linear-gradient(135deg, #FF2D55, #FF6B35)', accent: '#FF2D55', title: 'অফার জোন', sub: 'ফ্ল্যাশ সেল - সীমিত সময়!', features: ['countdown', 'flash-badge'], cardStyle: 'flash', defaultBanner: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&q=80' },
  'mobile': { heroBg: 'linear-gradient(135deg, #0071E3, #00C6FF)', accent: '#0071E3', title: 'ফোন', sub: 'প্রিমিয়াম কালেকশন', features: ['spec-table', 'compare-btn'], cardStyle: 'spec', defaultBanner: 'https://images.unsplash.com/photo-1550029402-226115b7c579?w=1200&q=80' },
  'computer': { heroBg: 'linear-gradient(135deg, #00A651, #00C853)', accent: '#00A651', title: 'কম্পিউটার', sub: 'টেক ওয়ার্ল্ড', features: ['spec-chart', 'warranty'], cardStyle: 'spec', defaultBanner: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80' },
  'electronics': { heroBg: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', accent: '#8B5CF6', title: 'ইলেকট্রনিক্স', sub: 'গ্যাজেট জোন', features: ['energy-rating', 'warranty-tag'], cardStyle: 'energy', defaultBanner: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&q=80' },
  'fashion': { heroBg: 'linear-gradient(135deg, #E91E63, #FF4081)', accent: '#E91E63', title: 'ফ্যাশন', sub: 'স্টাইল স্টোর', features: ['size-chart', 'color-variant'], cardStyle: 'fashion', defaultBanner: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80' },
  'car': { heroBg: 'linear-gradient(135deg, #D32F2F, #F44336)', accent: '#D32F2F', title: 'গাড়ি', sub: 'অটো মার্কেট', features: ['mileage', 'year'], cardStyle: 'vehicle', defaultBanner: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80' },
  'job': { heroBg: 'linear-gradient(135deg, #1565C0, #1976D2)', accent: '#1565C0', title: 'চাকরি', sub: 'কেরিয়ার হাব', features: ['salary-range', 'experience-level'], cardStyle: 'list', defaultBanner: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80' },
  'service': { heroBg: 'linear-gradient(135deg, #F57C00, #FF9800)', accent: '#F57C00', title: 'সার্ভিস', sub: 'সেবা হাব', features: ['booking-calendar', 'rating-badge'], cardStyle: 'booking', defaultBanner: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80' },
  'property': { heroBg: 'linear-gradient(135deg, #2E7D32, #388E3C)', accent: '#2E7D32', title: 'জমি প্রপার্টি', sub: 'রিয়েল এস্টেট', features: ['location-map', 'sqft'], cardStyle: 'property', defaultBanner: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80' },
  'info': { heroBg: 'linear-gradient(135deg, #00838F, #00ACC1)', accent: '#00838F', title: 'তথ্য', sub: 'খবর ও আপডেট', features: ['publish-date', 'category-tag'], cardStyle: 'news', defaultBanner: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=1200&q=80' },
  'matrimony': { heroBg: 'linear-gradient(135deg, #C62828, #E53935)', accent: '#C62828', title: 'পাত্রপাত্রী', sub: 'জীবনসঙ্গী খুঁজুন', features: ['biodata-card', 'matching-score'], cardStyle: 'profile', defaultBanner: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200&q=80' },
  'rent': { heroBg: 'linear-gradient(135deg, #6A1B9A, #8E24AA)', accent: '#6A1B9A', title: 'ভাড়া রেন্ট', sub: 'ভাড়ার হাব', features: ['price-per-month', 'location'], cardStyle: 'rental', defaultBanner: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200&q=80' },
  'emergency': { heroBg: 'linear-gradient(135deg, #B71C1C, #D32F2F)', accent: '#B71C1C', title: 'জরুরি সেবা', sub: '২৪/৭ সেবা', features: ['contact-btn', '24-7-badge'], cardStyle: 'emergency', defaultBanner: 'https://images.unsplash.com/photo-1587745416684-47953f16fda3?w=1200&q=80' },
  'animal': { heroBg: 'linear-gradient(135deg, #5D4037, #795548)', accent: '#5D4037', title: 'পশু', sub: 'গবাদিপশু', features: ['health-status', 'breed'], cardStyle: 'livestock', defaultBanner: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1200&q=80' },
  'food': { heroBg: 'linear-gradient(135deg, #E64A19, #F4511E)', accent: '#E64A19', title: 'খাদ্য পণ্য', sub: 'খাদ্য বাজার', features: ['calories', 'expiry-date'], cardStyle: 'food', defaultBanner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80' },
  'agriculture': { heroBg: 'linear-gradient(135deg, #33691E, #558B2F)', accent: '#33691E', title: 'কৃষি', sub: 'কৃষি পণ্য', features: ['harvest-season', 'yield'], cardStyle: 'crop', defaultBanner: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&q=80' },
  'gifts': { heroBg: 'linear-gradient(135deg, #AD1457, #C2185B)', accent: '#AD1457', title: 'উপহার', sub: 'উপহার সম্ভার', features: ['occasion-tag', 'gift-wrap'], cardStyle: 'gift', defaultBanner: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1200&q=80' },
  'handicraft': { heroBg: 'linear-gradient(135deg, #BF360C, #D84315)', accent: '#BF360C', title: 'হস্তশিল্প', sub: 'কারুশিল্প বাজার', features: ['artisan-name', 'material'], cardStyle: 'craft', defaultBanner: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=1200&q=80' },
  'second-hand': { heroBg: 'linear-gradient(135deg, #616161, #757575)', accent: '#616161', title: 'পুরাতন', sub: 'ব্যবহৃত পণ্য', features: ['usage-duration', 'negotiable-badge'], cardStyle: 'used', defaultBanner: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80' },
  'home-service': { heroBg: 'linear-gradient(135deg, #0277BD, #0288D1)', accent: '#0277BD', title: 'হোম সার্ভিস', sub: 'গৃহস্থালি সেবা', features: ['service-charge', 'time-slot'], cardStyle: 'booking', defaultBanner: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80' },
};

const allCategories = [
  { slug: 'offer-zone', label: 'অফার জোন' }, { slug: 'mobile', label: 'ফোন' },
  { slug: 'computer', label: 'কম্পিউটার' }, { slug: 'electronics', label: 'ইলেকট্রনিক্স' },
  { slug: 'fashion', label: 'ফ্যাশন' }, { slug: 'car', label: 'গাড়ি' },
  { slug: 'job', label: 'চাকরি' }, { slug: 'service', label: 'সার্ভিস' },
  { slug: 'property', label: 'জমি প্রপার্টি' }, { slug: 'info', label: 'তথ্য' },
  { slug: 'matrimony', label: 'পাত্রপাত্রী' }, { slug: 'rent', label: 'ভাড়া রেন্ট' },
  { slug: 'emergency', label: 'জরুরি সেবা' }, { slug: 'animal', label: 'পশু' },
  { slug: 'food', label: 'খাদ্য পণ্য' }, { slug: 'agriculture', label: 'কৃষি' },
  { slug: 'gifts', label: 'উপহার' }, { slug: 'handicraft', label: 'হস্তশিল্প' },
  { slug: 'second-hand', label: 'পুরাতন' }, { slug: 'home-service', label: 'হোম সার্ভিস' },
];

// ==================== মেইন ====================
export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params.slug as string) || 'offer-zone';
  const theme = themeConfig[slug] || themeConfig['offer-zone'];

  const [products, setProducts] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [activeSub, setActiveSub] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingText, setTypingText] = useState('');
  const [liveStats, setLiveStats] = useState({ visitors: 0, orders: 0 });
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // টাইপিং অ্যানিমেশন
  useEffect(() => {
    const texts = ["খুঁজুন...", "সার্চ করুন...", "প্রোডাক্ট খুঁজুন..."];
    let i = 0, isDeleting = false, textIndex = 0;
    const typing = setInterval(() => {
      const fullText = texts[textIndex];
      if (!isDeleting) {
        if (i < fullText.length) { setTypingText(fullText.slice(0, i + 1)); i++; }
        else { setTimeout(() => { isDeleting = true; }, 1500); }
      } else {
        if (i > 0) { setTypingText(fullText.slice(0, i - 1)); i--; }
        else { isDeleting = false; textIndex = (textIndex + 1) % texts.length; }
      }
    }, 80);
    return () => clearInterval(typing);
  }, []);

  // ব্যানার
  useEffect(() => { supabase.from('banners').select('*').eq('is_active', true).order('id').then(({ data }) => { if (data?.length) setBanners(data); }); }, []);
  useEffect(() => { if (banners.length === 0) return; const t = setInterval(() => setCurrentBanner(p => (p + 1) % banners.length), 3000); return () => clearInterval(t); }, [banners]);

  // সাব-ক্যাটাগরি
  useEffect(() => { supabase.from('subcategories').select('id, name, slug').eq('category_slug', slug).eq('is_active', true).order('name').then(({ data }) => { if (data?.length) setSubCategories(data); }); }, [slug]);

  // প্রোডাক্ট (Pagination ৫টা)
  const loadProducts = useCallback(async (sub: string, pageNum: number = 0, append: boolean = false) => {
    if (pageNum === 0) setLoading(true); else setLoadingMore(true);
    const from = pageNum * 5, to = from + 4;
    let q = supabase.from('products').select('*', { count: 'exact' }).eq('category', slug).order('created_at', { ascending: false }).range(from, to);
    if (sub !== 'all') q = q.eq('subcategory', sub);
    const { data, count } = await q;
    if (data?.length) {
      if (append) setProducts(prev => [...prev, ...data]); else setProducts(data);
      setHasMore(count ? to + 1 < count : false);
    } else {
      if (!append) setProducts(Array.from({ length: 5 }, (_, i) => ({ id: i + 1, title: `প্রোডাক্ট ${i + 1}`, price: Math.floor(Math.random() * 5000) + 200, image_url: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&sig=${i}`, rating: +(Math.random() * 2 + 3).toFixed(1), stock: Math.floor(Math.random() * 15) + 1 })));
      setHasMore(false);
    }
    setLoading(false); setLoadingMore(false);
  }, [slug, activeSub]);

  useEffect(() => { setPage(0); loadProducts(activeSub, 0); }, [loadProducts]);

  // Infinite Scroll
  const handleLoadMore = useCallback(() => { const np = page + 1; setPage(np); loadProducts(activeSub, np, true); }, [page, loadProducts]);
  useEffect(() => {
    const h = () => { if (scrollTimer.current) clearTimeout(scrollTimer.current); scrollTimer.current = setTimeout(() => { if (loadingMore || !hasMore) return; const { scrollTop, scrollHeight, clientHeight } = document.documentElement; if (scrollTop + clientHeight >= scrollHeight - 300) handleLoadMore(); }, 150); };
    window.addEventListener('scroll', h, { passive: true }); return () => { window.removeEventListener('scroll', h); if (scrollTimer.current) clearTimeout(scrollTimer.current); };
  }, [loadingMore, hasMore, handleLoadMore]);

  // লাইভ ভিজিটর
  useEffect(() => { supabase.from('page_analytics').select('active_visitors, total_orders_today').eq('page_slug', slug).single().then(({ data }) => { if (data) setLiveStats({ visitors: data.active_visitors || 0, orders: data.total_orders_today || 0 }); }); }, [slug]);

  const displaySubs = subCategories.length > 0 ? subCategories : Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: `সাব ক্যাটাগরি ${i + 1}`, slug: `cat-${i + 1}` }));
  const gridItems = [...displaySubs]; while (gridItems.length < 9) gridItems.push(null);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* ===== PC ===== */}
      <div className="pc-only">
        <PCHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '15px', gap: '15px' }}>
          <div style={{ width: '220px', background: 'white', borderRadius: '8px', padding: '8px 0', flexShrink: 0, height: 'fit-content', border: '1px solid #e0e0e0' }}>
            {allCategories.map((cat, i) => (
              <div key={i} onClick={() => router.push(`/category/${cat.slug}`)} style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '12px', fontWeight: slug === cat.slug ? '700' : '400', background: slug === cat.slug ? '#FFF3E0' : 'transparent', color: slug === cat.slug ? theme.accent : '#555', borderLeft: slug === cat.slug ? `3px solid ${theme.accent}` : '3px solid transparent' }}>{cat.label}</div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {banners.length > 0 ? (
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px', height: '250px' }}>
                <img src={banners[currentBanner]?.image_url || theme.defaultBanner} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}><h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>{theme.title}</h2><p style={{ fontSize: '14px', opacity: 0.9, margin: '4px 0 0' }}>{theme.sub}</p></div>
                <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>{banners.map((_, i) => <div key={i} style={{ width: i === currentBanner ? '20px' : '8px', height: '8px', borderRadius: '4px', background: i === currentBanner ? theme.accent : 'rgba(255,255,255,0.5)', transition: 'all 0.3s' }} />)}</div>
              </div>
            ) : (
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', marginBottom: '16px', height: '250px' }}>
                <img src={theme.defaultBanner} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}><h2 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>{theme.title}</h2><p style={{ fontSize: '14px', opacity: 0.9, margin: '4px 0 0' }}>{theme.sub}</p></div>
              </div>
            )}
            
            {/* লাইভ স্ট্যাটস */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', fontSize: '12px', color: '#888' }}>
              <span>👁️ দর্শক: {liveStats.visitors}</span>
              <span>🛒 আজকের অর্ডার: {liveStats.orders}</span>
            </div>

            {/* সাব-ক্যাটাগরি ফিল্টার */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '8px 0 14px' }}>
              <button onClick={() => setActiveSub('all')} style={subBtnStyle(activeSub === 'all', theme.accent)}>সব</button>
              {subCategories.map((s: any) => (
                <button key={s.id} onClick={() => setActiveSub(s.slug)} style={subBtnStyle(activeSub === s.slug, theme.accent)}>{s.name}</button>
              ))}
            </div>

            {/* প্রোডাক্ট ৫ কলাম */}
            {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>⏳ লোড হচ্ছে...</div> :
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {products.map((p, i) => <ProductCard key={i} p={p} theme={theme} router={router} />)}
              </div>
            }

            {/* Load More */}
            {hasMore && (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <button onClick={handleLoadMore} disabled={loadingMore} style={{ padding: '10px 24px', background: loadingMore ? '#ccc' : theme.accent, color: 'white', border: 'none', borderRadius: '20px', cursor: loadingMore ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px' }}>{loadingMore ? 'লোড হচ্ছে...' : 'আরো ৫টি দেখুন'}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== Mobile ===== */}
      <div className="mobile-only">
        <MobileHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <button onClick={() => router.back()} style={{ position: 'fixed', top: 8, left: 8, zIndex: 100, background: 'white', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', fontSize: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>←</button>
        <div style={{ padding: '45px 10px 70px' }}>
          
          {/* ফ্ল্যাশ সেল ব্যানার */}
          <div style={{ marginTop: '-35px' }}>
            {banners.length > 0 ? (
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'visible', marginBottom: '14px', height: '180px' }}>
                <img src={banners[currentBanner]?.image_url || theme.defaultBanner} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} alt="" />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)', padding: '16px 12px', color: 'white', borderRadius: '0 0 10px 10px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{theme.title}</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>{theme.sub}</div>
                  <button style={{ marginTop: '8px', padding: '6px 16px', background: theme.accent, color: 'white', border: 'none', borderRadius: '16px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>এখনই কিনুন</button>
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative', borderRadius: '10px', overflow: 'visible', marginBottom: '14px', height: '180px' }}>
                <img src={theme.defaultBanner} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} alt="" />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)', padding: '16px 12px', color: 'white', borderRadius: '0 0 10px 10px' }}>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>{theme.title}</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>{theme.sub}</div>
                  <button style={{ marginTop: '8px', padding: '6px 16px', background: theme.accent, color: 'white', border: 'none', borderRadius: '16px', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>এখনই কিনুন</button>
                </div>
              </div>
            )}
            {/* ব্যানার ডট ইন্ডিকেটর - নিচে বাইরে */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '-10px', marginBottom: '14px' }}>
              {banners.length > 0 ? banners.map((_, i) => <div key={i} style={{ width: i === currentBanner ? '20px' : '8px', height: '8px', borderRadius: '4px', background: i === currentBanner ? theme.accent : '#ddd', transition: 'all 0.3s' }} />) : null}
            </div>
          </div>

          {/* সাব-ক্যাটাগরি ৩×৩ গ্রিড */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '16px' }}>
            {gridItems.map((sub, i) => sub ? (
              <div key={i} onClick={() => setActiveSub(sub.slug)} style={{ background: activeSub === sub.slug ? '#FFF0F0' : 'white', borderRadius: '8px', padding: '8px 4px', textAlign: 'center', cursor: 'pointer', border: activeSub === sub.slug ? `2px solid ${theme.accent}` : '1px solid #eee', transition: 'all 0.2s' }}>
                <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: '#F5F5F5', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: theme.accent }}>{(sub.name as string)?.slice(0, 2)}</div>
                <div style={{ fontSize: '9px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.name}</div>
              </div>
            ) : <div key={i} style={{ visibility: 'hidden' }} />)}
          </div>

          {/* প্রোডাক্ট ২ কলাম */}
          {loading ? <div style={{ textAlign: 'center', padding: '30px' }}>⏳ লোড হচ্ছে...</div> :
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {products.map((p, i) => <ProductCard key={i} p={p} theme={theme} router={router} />)}
            </div>
          }

          {/* Load More */}
          {hasMore && (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <button onClick={handleLoadMore} disabled={loadingMore} style={{ padding: '10px 24px', background: loadingMore ? '#ccc' : theme.accent, color: 'white', border: 'none', borderRadius: '20px', cursor: loadingMore ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '13px' }}>{loadingMore ? 'লোড হচ্ছে...' : 'আরো ৫টি দেখুন'}</button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .pc-only { display: none; } .mobile-only { display: block; }
        @media (min-width: 1024px) { .pc-only { display: block !important; } .mobile-only { display: none !important; } }
      `}</style>
    </div>
  );
}

// সাব-ক্যাটাগরি বাটন
const subBtnStyle = (isActive: boolean, accent: string): React.CSSProperties => ({
  flexShrink: 0, padding: '6px 14px', borderRadius: '20px', cursor: 'pointer',
  fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
  background: isActive ? accent : 'white', color: isActive ? 'white' : '#555',
  border: isActive ? 'none' : '1px solid #ddd',
});

// প্রোডাক্ট কার্ড
function ProductCard({ p, theme, router }: { p: any; theme: any; router: any }) {
  const features = theme.features || [];
  return (
    <div onClick={() => router.push(`/product/${p.id}`)} style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #eee' }}>
      <img src={p.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80'} style={{ width: '100%', height: '150px', objectFit: 'cover' }} alt="" loading="lazy" />
      <div style={{ padding: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>{p.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '700', color: theme.accent, fontSize: '14px' }}>৳ {(p.price || 0).toLocaleString()}</span>
          {p.original_price && <span style={{ fontSize: '10px', color: '#999', textDecoration: 'line-through' }}>৳ {p.original_price.toLocaleString()}</span>}
          {p.rating && <span style={{ fontSize: '10px', color: '#FFB347' }}>⭐ {p.rating}</span>}
        </div>
        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
          {features.includes('flash-badge') && <span style={{ fontSize: '8px', background: '#FF2D55', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>ফ্ল্যাশ</span>}
          {features.includes('warranty-tag') && <span style={{ fontSize: '8px', background: '#E8F5E9', color: '#2E7D32', padding: '2px 6px', borderRadius: '4px' }}>ওয়ারেন্টি</span>}
          {features.includes('negotiable-badge') && <span style={{ fontSize: '8px', background: '#FFF3E0', color: '#E65100', padding: '2px 6px', borderRadius: '4px' }}>আলোচনাযোগ্য</span>}
          {features.includes('24-7-badge') && <span style={{ fontSize: '8px', background: '#FFEBEE', color: '#B71C1C', padding: '2px 6px', borderRadius: '4px' }}>২৪/৭</span>}
        </div>
        {p.stock && p.stock <= 5 && <div style={{ fontSize: '9px', color: '#FF2D55', marginTop: '4px' }}>মাত্র {p.stock}টি বাকি</div>}
      </div>
    </div>
  );
}