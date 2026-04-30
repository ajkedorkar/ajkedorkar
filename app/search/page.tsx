"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PCHeader from '@/components/PCHeader';
import MobileHeader from '@/components/MobileHeader';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [typingText, setTypingText] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  const LIMIT = 10;

  // টাইপিং অ্যানিমেশন
  useEffect(() => {
    let i = 0, isDeleting = false;
    const typing = setInterval(() => {
      const fullText = "Search items...";
      if (!isDeleting) {
        if (i < fullText.length) { setTypingText(fullText.slice(0, i + 1)); i++; }
        else { isDeleting = true; }
      } else {
        if (i > 0) { setTypingText(fullText.slice(0, i - 1)); i--; }
        else { isDeleting = false; }
      }
    }, 100);
    return () => clearInterval(typing);
  }, []);

  // সার্চ ফাংশন (debounced)
  const searchProducts = useCallback(async (query: string, pageNum: number = 1, append: boolean = false) => {
    if (!query.trim()) {
      setProducts([]);
      setTotalResults(0);
      setHasMore(false);
      return;
    }

    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError('');
    }

    try {
      const from = (pageNum - 1) * LIMIT;
      const to = from + LIMIT - 1;

      // Supabase থেকে সার্চ (title + description)
      const { data, error: supabaseError, count } = await supabase
        .from('products')
        .select('*', { count: 'exact' })
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (supabaseError) {
        setError('সার্চ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        setProducts([]);
        setTotalResults(0);
        return;
      }

      const results = data || [];
      const total = count || results.length;

      if (append) {
        setProducts(prev => [...prev, ...results]);
      } else {
        setProducts(results);
      }
      setTotalResults(total);
      setHasMore(results.length === LIMIT && from + results.length < total);
      setPage(pageNum);
    } catch (err) {
      setError('নেটওয়ার্ক সমস্যা! ইন্টারনেট চেক করুন।');
      setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, []);

  // URL থেকে সার্চ
  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      searchProducts(initialQuery, 1, false);
    }
  }, [initialQuery]);

  // লেজি লোডিং
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading || loadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          searchProducts(searchQuery, page + 1, true);
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, searchQuery, page]);

  // সার্চ হ্যান্ডলার (debounce সহ)
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    if (value.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        router.push(`/search?q=${encodeURIComponent(value.trim())}`, { scroll: false });
        searchProducts(value.trim(), 1, false);
      }, 500);
    } else if (value.trim().length === 0) {
      setProducts([]);
      setTotalResults(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      searchProducts(searchQuery.trim(), 1, false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      
      <div className="pc-header-wrapper">
        <PCHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={handleSearchInput} />
      </div>

      <div className="mobile-header-wrapper">
        <MobileHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={handleSearchInput} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '15px' }}>
        
        {/* সার্চ বার (মোবাইলের জন্য এক্সট্রা) */}
        <div className="mobile-search-bar" style={{
          background: 'white', padding: '12px', borderRadius: '10px', marginBottom: '12px',
          display: 'none',
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="প্রোডাক্ট খুঁজুন..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '20px', border: '2px solid #e62e04',
                fontSize: '13px', outline: 'none',
              }}
            />
            <button onClick={() => searchProducts(searchQuery, 1)} style={{
              background: '#e62e04', color: 'white', border: 'none',
              padding: '10px 18px', borderRadius: '20px', fontWeight: '600', cursor: 'pointer',
            }}>🔍</button>
          </div>
        </div>

        {/* সার্চ ইনফো */}
        {searchQuery && !loading && !error && (
          <div style={{
            background: 'white', padding: '14px 18px', borderRadius: '10px', marginBottom: '15px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
          }}>
            <h2 style={{ margin: 0, fontSize: '15px', color: '#333' }}>
              🔍 &quot;{searchQuery}&quot; — {totalResults}টি ফলাফল
            </h2>
            <span style={{ fontSize: '11px', color: '#999' }}>
              দেখানো হচ্ছে {products.length}টি
            </span>
          </div>
        )}

        {/* এরর */}
        {error && (
          <div style={{
            background: '#fff0f0', padding: '16px', borderRadius: '10px', marginBottom: '15px',
            textAlign: 'center', color: '#e62e04', fontSize: '13px',
          }}>
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '6px' }}>⚠️</span>
            {error}
            <br />
            <button onClick={() => searchProducts(searchQuery, 1)} style={{
              marginTop: '8px', background: '#e62e04', color: 'white', border: 'none',
              padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
            }}>🔄 আবার চেষ্টা</button>
          </div>
        )}

        {/* লোডিং */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
            <p>খোঁজা হচ্ছে...</p>
          </div>
        )}

        {/* রেজাল্ট */}
        {!loading && !error && products.length === 0 && searchQuery && (
          <div style={{
            textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px',
          }}>
            <span style={{ fontSize: '56px', display: 'block', marginBottom: '12px' }}>📭</span>
            <h3 style={{ color: '#333', margin: '0 0 6px 0', fontSize: '17px' }}>
              &quot;{searchQuery}&quot; এর জন্য কিছু পাওয়া যায়নি
            </h3>
            <p style={{ color: '#999', fontSize: '13px', margin: 0 }}>
              অন্য কীওয়ার্ড দিয়ে সার্চ করুন
            </p>
          </div>
        )}

        {/* প্রোডাক্ট গ্রিড */}
        {!loading && products.length > 0 && (
          <>
            <div className="search-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px',
            }}>
              {products.map((product, i) => (
                <div key={`${product.id}-${i}`}
                  onClick={() => router.push(`/product/${product.id}`)}
                  style={{
                    background: 'white', borderRadius: '8px', overflow: 'hidden',
                    cursor: 'pointer', border: '1px solid #eee',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'}
                >
                  <img src={product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'}
                    style={{ width: '100%', height: '160px', objectFit: 'cover', background: '#f0f0f0' }}
                    alt={product.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
                    }}
                  />
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{
                      fontSize: '12px', color: '#333', margin: '0 0 4px 0',
                      height: '32px', overflow: 'hidden', lineHeight: '1.3',
                    }}>
                      {product.title}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#e62e04' }}>
                        ৳{product.price?.toLocaleString()}
                      </span>
                      {product.rating > 0 && (
                        <span style={{ fontSize: '10px', color: '#FFB347' }}>⭐ {product.rating}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* লেজি লোড ট্রিগার */}
            <div ref={loadMoreRef} style={{ textAlign: 'center', padding: '20px' }}>
              {loadingMore && (
                <span style={{ color: '#999', fontSize: '12px' }}>⏳ আরো লোড হচ্ছে...</span>
              )}
              {!hasMore && products.length > 0 && (
                <span style={{ color: '#999', fontSize: '12px' }}>
                  ✅ সব {totalResults}টি ফলাফল দেখা হয়েছে
                </span>
              )}
            </div>
          </>
        )}

        {/* নো সার্চ ইয়েট */}
        {!searchQuery && !loading && (
          <div style={{
            textAlign: 'center', padding: '80px 20px', background: 'white', borderRadius: '12px',
          }}>
            <span style={{ fontSize: '64px', display: 'block', marginBottom: '12px' }}>🔍</span>
            <h3 style={{ color: '#333', margin: '0 0 6px 0' }}>কী খুঁজতে চান?</h3>
            <p style={{ color: '#999', fontSize: '13px' }}>উপরে সার্চ বারে লিখুন</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .search-grid { grid-template-columns: repeat(2, 1fr); }
        .mobile-header-wrapper { display: block; }
        .pc-header-wrapper { display: none; }
        .mobile-search-bar { display: block; }
        
        @media (min-width: 768px) {
          .search-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .mobile-header-wrapper { display: none; }
          .pc-header-wrapper { display: block; }
          .mobile-search-bar { display: none; }
        }
        @media (min-width: 1024px) {
          .search-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (min-width: 1200px) {
          .search-grid { grid-template-columns: repeat(5, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <span style={{ fontSize: '32px' }}>⏳</span>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}