"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const generateDummy = (page: number, limit: number) => {
  const items: any[] = [];
  const d = [
    { name: 'Casual Sneakers', price: '1,250', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
    { name: 'Leather Handbag', price: '2,800', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400' },
  ];
  for (let i = 0; i < limit; i++) items.push({ id: (page-1)*limit + i + 1, ...d[i % d.length] });
  return items;
};

export default function ProductGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const ref = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const LIMIT = 5;

  const load = useCallback(async (reset = false) => {
    if (loadingRef.current || (!reset && !hasMore)) return;
    loadingRef.current = true; setLoading(true);
    try {
      const cp = reset ? 1 : page + 1;
      const { data } = await supabase.from('products').select('*').range((cp-1)*LIMIT, cp*LIMIT-1).order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const np = data.map((p:any) => ({ id: p.id, name: p.title || p.name, price: p.price?.toLocaleString() || '0', img: p.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' }));
        if (reset) { setProducts(np); setPage(1); setHasMore(np.length === LIMIT); }
        else { setProducts(prev => [...prev, ...np]); setPage(cp); setHasMore(np.length === LIMIT); }
      } else {
        const d = generateDummy(cp, LIMIT);
        if (reset) { setProducts(d); setPage(1); setHasMore(true); }
        else { setProducts(prev => [...prev, ...d]); setPage(cp); }
      }
    } catch {
      const d = generateDummy(reset ? 1 : page + 1, LIMIT);
      if (reset) { setProducts(d); setPage(1); setHasMore(true); }
      else { setProducts(prev => [...prev, ...d]); setPage(page + 1); }
    } finally { setLoading(false); loadingRef.current = false; }
  }, [page, hasMore]);

  useEffect(() => { load(true); }, []);
  useEffect(() => {
    if (!ref.current) return;
    const o = new IntersectionObserver((e) => { if (e[0].isIntersecting && !loading && hasMore) load(false); }, { threshold: 0.1, rootMargin: "300px" });
    o.observe(ref.current);
    return () => o.disconnect();
  }, [loading, hasMore, load]);

  return (
    <div style={{ marginTop: '30px' }}>
      <div style={{ borderBottom: '2px solid #e62e04', display: 'inline-block', paddingBottom: '5px', fontWeight: 'bold', fontSize: '18px' }}>JUST FOR YOU</div>
      <div className="prod-grid" style={{ display: 'grid', gap: '12px', marginTop: '15px' }}>
        {products.map((p, i) => (
          <div key={i} className="prod-card" style={{ background: 'white', borderRadius: '4px', overflow: 'hidden', border: '1px solid #eee' }}>
            <img src={p.img} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            <div style={{ padding: '12px' }}>
              <div className="prod-name" style={{ fontSize: '13px', color: '#333', height: '36px', overflow: 'hidden' }}>{p.name}</div>
              <div className="prod-price" style={{ color: '#e62e04', fontWeight: 'bold', fontSize: '16px', marginTop: '8px' }}>৳{p.price}</div>
            </div>
          </div>
        ))}
      </div>
      <div ref={ref} style={{ textAlign: 'center', padding: '20px' }}>
        {loading && <p style={{ color: '#999', fontSize: '13px' }}>⏳ আরো ৫টা লোড হচ্ছে...</p>}
        {!hasMore && products.length > 0 && <p style={{ color: '#999', fontSize: '13px' }}>✅ সব দেখা হয়েছে ({products.length}টি)</p>}
      </div>
    </div>
  );
}