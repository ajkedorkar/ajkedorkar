"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getWebPUrl } from '@/lib/imageCompress';

const generateDummy = (page: number, limit: number) => {
  const items: any[] = [];
  const d = [
    { name: 'Casual Sneakers', price: '1,250', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', rating: 4.5, sold: 1234, discount: 20, old_price: 1800, stock: 50 },
    { name: 'Leather Handbag', price: '2,800', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', rating: 4.8, sold: 856, discount: 30, old_price: 4000, stock: 20 },
  ];
  for (let i = 0; i < limit; i++) items.push({ id: (page-1)*limit + i + 1, ...d[i % d.length] });
  return items;
};

export default function ProductGrid() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const ref = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const LIMIT = 20;

  const load = useCallback(async (reset = false) => {
    if (loadingRef.current || (!reset && !hasMore)) return;
    loadingRef.current = true; setLoading(true);
    try {
      const cp = reset ? 1 : page + 1;
      
      const [countResult, dataResult] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .range((cp-1)*LIMIT, cp*LIMIT-1)
      ]);
      
      if (dataResult.data && dataResult.data.length > 0) {
        const np = dataResult.data.map((p: any) => ({ 
          id: p.id, 
          name: p.title || p.name, 
          price: p.price || 0, 
          old_price: p.old_price,
          discount: p.discount || 0,
          img: p.webp_url || p.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
          rating: p.rating || 0,
          sold: p.sold || 0,
          stock: p.stock || 0,
        }));
        
        if (reset) { 
          setProducts(np); 
          setPage(1); 
          setHasMore(np.length === LIMIT); 
        } else { 
          setProducts(prev => [...prev, ...np]); 
          setPage(cp); 
          setHasMore(np.length === LIMIT && (countResult.count || 0) > cp * LIMIT);
        }
      } else {
        const d = generateDummy(cp, LIMIT);
        const webpD = d.map((item: any) => ({
          ...item,
          img: getWebPUrl(item.img, 300) || item.img
        }));
        if (reset) { setProducts(webpD); setPage(1); setHasMore(true); }
        else { setProducts(prev => [...prev, ...webpD]); setPage(cp); }
      }
    } catch {
      const d = generateDummy(reset ? 1 : page + 1, LIMIT);
      const webpD = d.map((item: any) => ({
        ...item,
        img: getWebPUrl(item.img, 300) || item.img
      }));
      if (reset) { setProducts(webpD); setPage(1); setHasMore(true); }
      else { setProducts(prev => [...prev, ...webpD]); setPage(page + 1); }
    } finally { setLoading(false); loadingRef.current = false; }
  }, [page, hasMore]);

  useEffect(() => { load(true); }, []);
  
  useEffect(() => {
    if (!ref.current) return;
    const o = new IntersectionObserver((e) => { 
      if (e[0].isIntersecting && !loading && hasMore) load(false); 
    }, { threshold: 0.1, rootMargin: "300px" });
    o.observe(ref.current);
    return () => o.disconnect();
  }, [loading, hasMore, load]);

  // স্কেলেটন লোডার
  if (products.length === 0 && loading) {
    return (
      <div style={{ marginTop: '30px' }}>
        <div style={{ borderBottom: '2px solid #e62e04', display: 'inline-block', paddingBottom: '5px', fontWeight: 'bold', fontSize: '18px' }}>JUST FOR YOU</div>
        <div className="prod-grid" style={{ display: 'grid', gap: '12px', marginTop: '15px' }}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className="skeleton-card" style={{
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #eee'
            }}>
              <div className="skeleton-image" style={{
                width: '100%',
                height: '180px',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite'
              }} />
              <div style={{ padding: '10px 12px' }}>
                <div className="skeleton-title" style={{
                  height: '36px',
                  background: '#f0f0f0',
                  borderRadius: '4px',
                  marginBottom: '6px'
                }} />
                <div className="skeleton-price" style={{
                  width: '80px',
                  height: '20px',
                  background: '#f0f0f0',
                  borderRadius: '4px'
                }} />
              </div>
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '30px' }}>
      <div style={{ borderBottom: '2px solid #e62e04', display: 'inline-block', paddingBottom: '5px', fontWeight: 'bold', fontSize: '18px' }}>JUST FOR YOU</div>
      <div className="prod-grid" style={{ display: 'grid', gap: '12px', marginTop: '15px' }}>
        {products.map((p, i) => (
          <div key={i} className="prod-card" 
            onClick={() => p.id && router.push(`/product/${p.id}`)}
            style={{ 
              background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee',
              transition: 'all 0.2s', cursor: 'pointer',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
          >
            <div style={{ position: 'relative' }}>
              <img 
                src={getWebPUrl(p.img, 300)} 
                style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
                alt={p.name}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300';
                }}
              />
              {p.discount > 0 && (
                <span style={{
                  position: 'absolute', top: '8px', left: '8px',
                  background: '#e62e04', color: 'white', padding: '3px 8px',
                  borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                }}>-{p.discount}%</span>
              )}
            </div>

            <div style={{ padding: '10px 12px' }}>
              <p style={{ fontSize: '13px', color: '#333', margin: '0 0 6px 0', height: '36px', overflow: 'hidden', lineHeight: '1.3' }}>
                {p.name}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                {p.rating > 0 && <span style={{ fontSize: '11px', color: '#FFB347', fontWeight: '600' }}>⭐ {p.rating}</span>}
                {p.stock > 0 && <span style={{ fontSize: '10px', color: '#888' }}>📦 {p.stock}</span>}
                {p.sold > 0 && <span style={{ fontSize: '10px', color: '#888' }}>🔥 {p.sold} sold</span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#e62e04' }}>
                  ৳{Number(p.price).toLocaleString()}
                </span>
                {p.old_price > 0 && (
                  <span style={{ fontSize: '11px', color: '#999', textDecoration: 'line-through' }}>
                    ৳{Number(p.old_price).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div ref={ref} style={{ textAlign: 'center', padding: '20px' }}>
        {loading && <p style={{ color: '#999', fontSize: '13px' }}>⏳ আরো {LIMIT}টা লোড হচ্ছে...</p>}
        {!hasMore && products.length > 0 && (
          <p style={{ color: '#00a651', fontSize: '13px' }}>✅ সব দেখা হয়েছে ({products.length}টি প্রোডাক্ট)</p>
        )}
      </div>

      <style jsx global>{`
        .prod-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 8px;
        }
        
        @media (min-width: 640px) {
          .prod-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 12px;
          }
        }
        
        @media (min-width: 1024px) {
          .prod-grid {
            grid-template-columns: repeat(6, 1fr) !important;
            gap: 14px;
          }
        }
        
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}