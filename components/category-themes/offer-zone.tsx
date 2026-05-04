"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PCHeader from '@/components/PCHeader';

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
  { icon: '🚑', label: 'জরুরি + মেডিসিন', slug: 'emergency' },
  { icon: '🐄', label: 'পশু', slug: 'animal' },
  { icon: '🍪', label: 'খাদ্য পণ্য', slug: 'food' },
  { icon: '🌾', label: 'কৃষি', slug: 'agriculture' },
  { icon: '🎁', label: 'উপহার', slug: 'gifts' },
  { icon: '🔪', label: 'হস্তশিল্প', slug: 'handicraft' },
  { icon: '🏚️', label: 'পুরাতন', slug: 'second-hand' },
  { icon: '🏠', label: 'হোম সার্ভিস', slug: 'home-service' },
];

export default function OfferZoneTheme() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [flashDeals, setFlashDeals] = useState<any[]>([]);
  const [bestDeals, setBestDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 32, seconds: 15 });
  const [searchQuery, setSearchQuery] = useState('');
  const [typingText, setTypingText] = useState('');

  // কাউন্টডাউন টাইমার
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // প্রোডাক্ট লোড
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('category', 'offer-zone').order('created_at', { ascending: false }).limit(20);
      
      if (data && data.length > 0) {
        setFlashDeals(data.filter((_, i) => i < 5));
        setBestDeals(data.filter((_, i) => i >= 5));
      } else {
        const dummy = Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          title: `অফার প্রোডাক্ট ${i + 1}`,
          price: Math.floor(Math.random() * 3000) + 200,
          old_price: Math.floor(Math.random() * 5000) + 500,
          discount: Math.floor(Math.random() * 50) + 10,
          image_url: `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&sig=${i}`,
          rating: (Math.random() * 2 + 3).toFixed(1),
          stock: Math.floor(Math.random() * 20) + 1,
          sold: Math.floor(Math.random() * 100),
        }));
        setFlashDeals(dummy.filter((_, i) => i < 5));
        setBestDeals(dummy.filter((_, i) => i >= 5));
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial' }}>
      
      {/* PC Header */}
      <div className="pc-hdr"><PCHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} /></div>
      
      {/* মোবাইল ব্যাক */}
      <button className="mob-back" onClick={() => router.back()}>←</button>

      <div className="main-container" style={{ maxWidth: '1300px', margin: '0 auto', padding: '15px' }}>
        
        <div className="flex-layout" style={{ display: 'flex', gap: '20px' }}>
          
          {/* PC সাইডবার */}
          <div className="pc-sidebar" style={{
            width: '240px', background: 'white', borderRadius: '10px', padding: '10px 0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexShrink: 0, display: 'none',
          }}>
            {allCategories.map((cat, i) => (
              <div key={i} onClick={() => router.push(`/category/${cat.slug}`)} style={{
                padding: '8px 16px', cursor: 'pointer', fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '8px',
                background: cat.slug === 'offer-zone' ? '#FFF3E0' : 'transparent',
                color: cat.slug === 'offer-zone' ? '#e62e04' : '#555',
                fontWeight: cat.slug === 'offer-zone' ? '700' : '400',
              }}>
                <span style={{ fontSize: '16px' }}>{cat.icon}</span> {cat.label}
              </div>
            ))}
          </div>

          {/* কন্টেন্ট */}
          <div style={{ flex: 1 }}>
            
            {/* হিরো হেডার */}
            <div style={{
              background: 'linear-gradient(135deg, #FF416C, #FF6B35)',
              borderRadius: '12px', padding: '20px 24px', color: 'white',
              marginBottom: '16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '28px', fontWeight: '800' }}>⚡ OFFER ZONE</div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>Flash Sale চলছে!</div>
              <div style={{
                display: 'inline-flex', gap: '8px', marginTop: '10px',
                background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: '10px',
                fontSize: '22px', fontWeight: '800', fontFamily: 'monospace',
              }}>
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
            </div>

            {/* Deal of the Day */}
            {flashDeals.length > 0 && (
              <div style={{
                background: 'white', borderRadius: '12px', padding: '16px',
                marginBottom: '16px', border: '2px solid #FFB347',
              }}>
                <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>🔥 DEAL OF THE DAY</div>
                <div style={{ display: 'flex', gap: '16px', flexDirection: 'row', flexWrap: 'wrap' }}>
                  <img src={flashDeals[0].image_url} style={{ width: '180px', height: '180px', objectFit: 'cover', borderRadius: '10px' }} alt="" />
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <h3 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>{flashDeals[0].title}</h3>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: '#e62e04' }}>৳{(flashDeals[0].price || 0).toLocaleString()}</div>
                    <span style={{ color: '#999', textDecoration: 'line-through', fontSize: '14px' }}>৳{(flashDeals[0].old_price || 0).toLocaleString()}</span>
                    <span style={{ color: '#e62e04', fontWeight: '700', marginLeft: '8px' }}>-{flashDeals[0].discount}% OFF</span>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#e62e04' }}>⚡ Only {flashDeals[0].stock} left!</div>
                    <div style={{ height: '6px', background: '#FFE1D0', borderRadius: '3px', marginTop: '6px' }}>
                      <div style={{ width: `${100 - (flashDeals[0].stock || 0) * 5}%`, height: '100%', background: '#FF416C', borderRadius: '3px' }} />
                    </div>
                    <button onClick={() => router.push(`/product/${flashDeals[0].id}`)} style={{
                      marginTop: '12px', padding: '10px 24px', background: '#FF416C', color: 'white',
                      border: 'none', borderRadius: '20px', fontWeight: '700', cursor: 'pointer',
                    }}>Shop Now</button>
                  </div>
                </div>
              </div>
            )}

            {/* Flash Deals */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>⚡ FLASH DEALS</h3>
              <div className="flash-scroll" style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                {flashDeals.map((p, i) => (
                  <div key={i} onClick={() => p.id && router.push(`/product/${p.id}`)} style={{
                    minWidth: '160px', background: 'white', borderRadius: '10px', padding: '10px',
                    cursor: 'pointer', border: '1px solid #eee', textAlign: 'center',
                  }}>
                    <div style={{ position: 'relative' }}>
                      <img src={p.image_url} style={{ width: '140px', height: '140px', objectFit: 'cover', borderRadius: '8px' }} alt="" />
                      <span style={{ position: 'absolute', top: '4px', left: '4px', background: '#e62e04', color: 'white', padding: '2px 6px', borderRadius: '8px', fontSize: '10px', fontWeight: '700' }}>-{p.discount}%</span>
                    </div>
                    <div style={{ fontWeight: '700', color: '#e62e04', marginTop: '4px' }}>৳{(p.price || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '10px', color: '#e62e04' }}>Only {p.stock} left!</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best Deals */}
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>💰 BEST DEALS</h3>
              <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {bestDeals.map((p, i) => (
                  <div key={i} onClick={() => p.id && router.push(`/product/${p.id}`)} style={{
                    background: 'white', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #eee',
                  }}>
                    <img src={p.image_url} style={{ width: '100%', height: '140px', objectFit: 'cover' }} alt="" />
                    <div style={{ padding: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>{p.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', color: '#e62e04', fontSize: '14px' }}>৳{(p.price || 0).toLocaleString()}</span>
                        <span style={{ color: '#999', textDecoration: 'line-through', fontSize: '10px' }}>৳{(p.old_price || 0).toLocaleString()}</span>
                      </div>
                      {p.rating && <span style={{ fontSize: '10px', color: '#FFB347' }}>⭐ {p.rating}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .pc-hdr { display: none; }
        .mob-back { display: flex; position: fixed; top: 12px; left: 12px; z-index: 100; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 18px; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        .pc-sidebar { display: none; }
        .product-grid { grid-template-columns: repeat(2, 1fr); }
        
        @media (min-width: 1024px) {
          .pc-hdr { display: block !important; }
          .mob-back { display: none !important; }
          .pc-sidebar { display: block !important; }
          .product-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}