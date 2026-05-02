"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { router.push('/auth/login'); return; }
      
      const { data } = await supabase
        .from('wishlist')
        .select('*, products(*)')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
      
      if (data) setWishlist(data);
      setLoading(false);
    }
    load();
  }, []);

  async function removeFromWishlist(productId: number) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    
    await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', userData.user.id)
      .eq('product_id', productId);
    
    setWishlist(prev => prev.filter(item => item.product_id !== productId));
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial' }}>
      
      <header style={{
        background: '#e62e04', padding: '14px 20px', color: 'white',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer',
        }}>←</button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>❤️ আমার উইশলিস্ট</h1>
        <span style={{ fontSize: '13px', opacity: 0.8 }}>{wishlist.length}টি</span>
      </header>

      <div style={{ padding: '15px' }}>
        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
            <span style={{ fontSize: '64px', display: 'block', marginBottom: '12px' }}>❤️</span>
            <h3 style={{ color: '#666', margin: '0 0 6px 0' }}>উইশলিস্ট খালি!</h3>
            <p style={{ fontSize: '13px' }}>পছন্দের প্রোডাক্টে ❤️ ক্লিক করুন</p>
            <button onClick={() => router.push('/')} style={{
              marginTop: '16px', padding: '12px 24px', background: '#e62e04', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
            }}>🛍️ শপিং করুন</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {wishlist.map((item: any) => (
              <div key={item.id} style={{
                background: 'white', borderRadius: '10px', padding: '12px',
                display: 'flex', gap: '12px', border: '1px solid #eee',
              }}>
                <img 
                  src={item.products?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                  onClick={() => router.push(`/product/${item.product_id}`)}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }} 
                  alt="" 
                />
                <div style={{ flex: 1 }}>
                  <h4 
                    onClick={() => router.push(`/product/${item.product_id}`)}
                    style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#333', cursor: 'pointer' }}
                  >
                    {item.products?.title || 'প্রোডাক্ট'}
                  </h4>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#e62e04' }}>
                    ৳{item.products?.price?.toLocaleString() || '0'}
                  </span>
                  {item.products?.rating > 0 && (
                    <span style={{ fontSize: '11px', color: '#FFB347', marginLeft: '8px' }}>
                      ⭐ {item.products.rating}
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => removeFromWishlist(item.product_id)}
                  style={{
                    background: 'none', border: 'none', color: '#e62e04', cursor: 'pointer',
                    fontSize: '20px', alignSelf: 'flex-start',
                  }}
                >❤️</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}