"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/imageCompress';

interface Product {
  id: number;
  title: string;
  price: number;
  old_price?: number | null;
  discount?: number | null;
  description?: string | null;
  category?: string | null;
  image_url?: string | null;
  webp_url?: string | null;
  rating?: number | null;
  sold?: number | null;
  stock?: number | null;
  is_active?: boolean | null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) {
        setProduct(data);
        setAddedCount(Math.floor(Math.random() * 100) + 20); // ২০-১২০ এর মধ্যে
        if (data.category) {
          const { data: relatedData } = await supabase.from('products').select('*').eq('category', data.category).neq('id', data.id).limit(6);
          if (relatedData) setRelated(relatedData);
        }
      }
      setLoading(false);
    }
    if (id) loadProduct();
  }, [id]);

  // সোশ্যাল প্রুফ কাউন্টার অ্যানিমেশন
  useEffect(() => {
    if (addedCount === 0) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(addedCount / (duration / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= addedCount) {
        setDisplayCount(addedCount);
        clearInterval(timer);
      } else {
        setDisplayCount(start);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [addedCount]);

  useEffect(() => {
    async function checkWishlist() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user || !product) return;
      const { data } = await supabase.from('wishlist').select('*').eq('user_id', userData.user.id).eq('product_id', product.id).single();
      setIsWishlisted(!!data);
    }
    if (product) checkWishlist();
  }, [product]);

  async function toggleWishlist() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { router.push('/auth/login'); return; }
    if (isWishlisted) {
      await supabase.from('wishlist').delete().eq('user_id', userData.user.id).eq('product_id', product!.id);
    } else {
      await supabase.from('wishlist').insert({ user_id: userData.user.id, product_id: product!.id });
    }
    setIsWishlisted(!isWishlisted);
  }

  const addToCart = async () => {
    if (!product) return;
    const { data: existing } = await supabase.from('cart').select('*').eq('product_id', product.id).eq('user_id', 'guest').single();
    if (existing) {
      await supabase.from('cart').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
    } else {
      await supabase.from('cart').insert({ product_id: product.id, quantity: 1, user_id: 'guest' });
    }
    alert('✅ কার্টে যোগ হয়েছে!');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#fff' }}><span style={{ fontSize: '32px' }}>⏳</span></div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '100px' }}>📭 প্রোডাক্ট পাওয়া যায়নি</div>;

  const discount = product.discount ?? 0;
  const rating = product.rating ?? 0;
  const oldPrice = product.old_price ?? 0;
  const allImages = [product.webp_url || product.image_url].filter(Boolean);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif', paddingBottom: '100px' }}>
      
      {/* ===== ইমেজ সেকশন ===== */}
      <div style={{ position: 'relative', background: '#fafafa' }}>
        {allImages.length > 0 ? (
          <img src={allImages[selectedImage] || allImages[0] || ''} alt={product.title}
            style={{ width: '100%', height: '380px', objectFit: 'contain' }} />
        ) : (
          <div style={{ width: '100%', height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', background: '#fafafa' }}>📦</div>
        )}

        {/* টপ লেফট: ব্যাক + ক্যাটাগরি */}
        <button onClick={() => router.back()} style={{
          position: 'absolute', top: '12px', left: '12px',
          background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>

        {/* টপ রাইট: শেয়ার + কার্ট + উইশলিস্ট */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
          <button onClick={() => navigator.share?.({ title: product.title, url: window.location.href })}
            style={iconBtn}>📤</button>
          <button onClick={addToCart} style={iconBtn}>🛒</button>
          <button onClick={toggleWishlist} style={{...iconBtn, color: isWishlisted ? '#e62e04' : '#333'}}>
            {isWishlisted ? '❤️' : '🤍'}
          </button>
        </div>

        {/* ডট ইন্ডিকেটর */}
        {allImages.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '8px' }}>
            {allImages.map((_, i) => (
              <div key={i} onClick={() => setSelectedImage(i)} style={{
                width: i === selectedImage ? '20px' : '6px', height: '6px', borderRadius: '3px',
                background: i === selectedImage ? '#e62e04' : '#ddd', cursor: 'pointer',
              }} />
            ))}
          </div>
        )}
      </div>

      {/* ===== প্রোডাক্ট ইনফো ===== */}
      <div style={{ padding: '16px' }}>
        
        {/* টাইটেল */}
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 10px 0', lineHeight: '1.4' }}>
          {product.title}
        </h1>

        {/* রেটিং + রেটিং কাউন্ট */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ background: '#00a651', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
            {rating > 0 ? `⭐ ${rating}` : '⭐ New'}
          </span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {rating > 0 ? `${rating} | 3 Ratings` : 'No Ratings'}
          </span>
        </div>

        {/* প্রাইস */}
        <div style={{ marginBottom: '12px' }}>
          <span style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e' }}>৳{product.price?.toLocaleString()}</span>
          {oldPrice > 0 && (
            <>
              <span style={{ fontSize: '14px', color: '#999', textDecoration: 'line-through', marginLeft: '10px' }}>৳{oldPrice.toLocaleString()}</span>
              <span style={{ fontSize: '13px', color: '#e62e04', fontWeight: '700', marginLeft: '8px' }}>-{discount}% OFF</span>
            </>
          )}
          <p style={{ fontSize: '11px', color: '#00a651', margin: '4px 0 0' }}>(Inclusive of all taxes)</p>
        </div>

        {/* সোশ্যাল প্রুফ - অ্যানিমেটেড কাউন্টার */}
        <div style={{
          background: '#FFF8E1', borderRadius: '8px', padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px',
          fontSize: '13px', color: '#E65100',
        }}>
          <span style={{ fontSize: '16px' }}>👥</span>
          <span style={{ fontWeight: '700', fontSize: '16px', color: '#e62e04' }}>{displayCount}+</span>
          people have added this to cart
        </div>

        {/* Product Highlights */}
        {product.description && (
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px 0' }}>📋 Product Highlights</h3>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', margin: 0 }}>{product.description}</p>
          </div>
        )}

        {/* Product Details */}
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px 0' }}>📄 Product Details</h3>
          <div style={{ display: 'grid', gap: '6px' }}>
            {product.category && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#888' }}>Category</span>
                <span style={{ fontWeight: '600', color: '#333' }}>{product.category}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#888' }}>Stock</span>
              <span style={{ fontWeight: '600', color: product.stock && product.stock > 0 ? '#00a651' : '#e62e04' }}>
                {product.stock && product.stock > 0 ? `✅ In Stock (${product.stock})` : '❌ Out of Stock'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#888' }}>Sold</span>
              <span style={{ fontWeight: '600', color: '#333' }}>🔥 {product.sold || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* বাটন */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'white', padding: '12px 16px', borderTop: '1px solid #eee',
        display: 'flex', gap: '10px',
      }}>
        <button onClick={addToCart} style={{
          flex: 1, padding: '14px', background: 'white', color: '#e62e04',
          border: '2px solid #e62e04', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
        }}>ADD TO CART</button>
        <button onClick={() => router.push('/checkout')} style={{
          flex: 1, padding: '14px', background: '#e62e04', color: 'white',
          border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
        }}>BUY NOW</button>
      </div>

      {/* রিলেটেড */}
      {related.length > 0 && (
        <div style={{ padding: '0 16px 16px', marginTop: '10px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a2e', marginBottom: '10px' }}>🔗 Related Products</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {related.slice(0, 4).map((r, i) => (
              <div key={i} onClick={() => router.push(`/product/${r.id}`)} style={{
                background: '#f9f9f9', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
              }}>
                <img src={r.webp_url || r.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'} style={{ width: '100%', height: '120px', objectFit: 'cover' }} alt="" />
                <div style={{ padding: '8px' }}>
                  <p style={{ fontSize: '11px', fontWeight: '600', color: '#333', margin: '0 0 4px 0' }}>{r.title}</p>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#e62e04' }}>৳{(r.price ?? 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
  width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};