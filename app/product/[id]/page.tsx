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
        setAddedCount(Math.floor(Math.random() * 100) + 20);
        if (data.category) {
          const { data: relatedData } = await supabase.from('products').select('*').eq('category', data.category).neq('id', data.id).limit(6);
          if (relatedData) setRelated(relatedData);
        }
      }
      setLoading(false);
    }
    if (id) loadProduct();
  }, [id]);

  useEffect(() => {
    if (addedCount === 0) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(addedCount / (duration / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= addedCount) { setDisplayCount(addedCount); clearInterval(timer); }
      else { setDisplayCount(start); }
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
  const allImages: string[] = [];
  if (product.webp_url) allImages.push(product.webp_url);
  else if (product.image_url) allImages.push(product.image_url);

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'Arial, sans-serif', paddingBottom: '100px' }}>
      
      {/* ===== ইমেজ সেকশন ===== */}
      <div style={{ position: 'relative', background: '#fafafa' }}>
        <img 
          src={allImages[selectedImage] || allImages[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'} 
          alt={product.title}
          onClick={() => setZoomImage(allImages[selectedImage] || allImages[0] || null)}
          style={{ width: '100%', height: '380px', objectFit: 'contain', cursor: 'zoom-in' }} 
        />

        <button onClick={() => router.back()} style={{
          position: 'absolute', top: '12px', left: '12px',
          background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>←</button>

        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
          <button onClick={() => navigator.share?.({ title: product.title, url: window.location.href })} style={iconBtn}>📤</button>
          <button onClick={addToCart} style={iconBtn}>🛒</button>
          <button onClick={toggleWishlist} style={{...iconBtn, color: isWishlisted ? '#e62e04' : '#333'}}>
            {isWishlisted ? '❤️' : '🤍'}
          </button>
        </div>

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

      {/* ===== ইনফো ===== */}
      <div style={{ padding: '16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 10px 0', lineHeight: '1.4' }}>{product.title}</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ background: '#00a651', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
            {rating > 0 ? `⭐ ${rating}` : '⭐ New'}
          </span>
          <span style={{ fontSize: '12px', color: '#666' }}>{rating > 0 ? `${rating} | 3 Ratings` : 'No Ratings'}</span>
        </div>

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

        <div style={{
          background: '#FFF8E1', borderRadius: '8px', padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px',
          fontSize: '13px', color: '#E65100',
        }}>
          <span style={{ fontSize: '16px' }}>👥</span>
          <span style={{ fontWeight: '700', fontSize: '16px', color: '#e62e04' }}>{displayCount}+</span>
          people have added this to cart
        </div>

        {product.description && (
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px 0' }}>📋 Product Highlights</h3>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6', margin: 0 }}>{product.description}</p>
          </div>
        )}

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
              <span style={{ fontWeight: '600', color: (product.stock && product.stock > 0) ? '#00a651' : '#e62e04' }}>
                {(product.stock && product.stock > 0) ? `✅ In Stock (${product.stock})` : '❌ Out of Stock'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ color: '#888' }}>Sold</span>
              <span style={{ fontWeight: '600', color: '#333' }}>🔥 {product.sold || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== রিভিউ সেকশন ===== */}
      <ReviewSection productId={product.id} />

      {/* ===== রিলেটেড ===== */}
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

      {/* ===== বটম বাটন ===== */}
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

      {/* ===== জুম মোডাল ===== */}
      {zoomImage && (
        <div onClick={() => setZoomImage(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '20px',
        }}>
          <span onClick={() => setZoomImage(null)} style={{ position: 'absolute', top: '20px', right: '30px', color: 'white', fontSize: '36px' }}>✕</span>
          <img src={zoomImage} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px' }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

// ===== রিভিউ কম্পোনেন্ট (অটো নাম সহ) =====
function ReviewSection({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ user_name: '', rating: 5, comment: '', image_url: '', webp_url: '' });
  const [uploading, setUploading] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  // লগইন ইউজার চেক + প্রোফাইল নাম অটো বসানো
  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setLoggedInUser(data.user);
        // প্রোফাইল থেকে নাম
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', data.user.id).single();
        if (profile?.full_name) {
          setReviewForm(prev => ({ ...prev, user_name: profile.full_name }));
        } else if (data.user.user_metadata?.full_name) {
          setReviewForm(prev => ({ ...prev, user_name: data.user.user_metadata.full_name }));
        } else if (data.user.user_metadata?.name) {
          setReviewForm(prev => ({ ...prev, user_name: data.user.user_metadata.name }));
        }
      }
    }
    loadUser();
  }, []);

  useEffect(() => { loadReviews(); }, [productId]);

  async function loadReviews() {
    const { data } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false });
    if (data) setReviews(data);
  }

  async function handleReviewImage(file: File) {
    setUploading(true);
    const compressed = await compressImage(file, 30);
    const fileName = `review_${Date.now()}.webp`;
    const { data } = await supabase.storage.from('banners').upload(fileName, compressed, { contentType: 'image/webp', upsert: true });
    if (data) {
      const url = `https://zypshsruibnbefixknxm.supabase.co/storage/v1/object/public/banners/${fileName}`;
      setReviewForm(prev => ({ ...prev, image_url: url, webp_url: url }));
    }
    setUploading(false);
  }

  async function submitReview() {
    if (!reviewForm.comment) return alert('কমেন্ট লিখুন!');
    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      user_name: reviewForm.user_name || loggedInUser?.user_metadata?.full_name || loggedInUser?.user_metadata?.name || 'Anonymous',
      rating: reviewForm.rating,
      comment: reviewForm.comment,
      image_url: reviewForm.image_url,
      webp_url: reviewForm.webp_url,
    });
    if (!error) {
      setReviewForm(prev => ({ 
        ...prev, 
        rating: 5, 
        comment: '', 
        image_url: '', 
        webp_url: '' 
      }));
      setShowForm(false); 
      loadReviews(); 
      alert('✅ রিভিউ জমা হয়েছে!');
    }
  }

  return (
    <div style={{ background: 'white', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px', margin: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#222', margin: 0 }}>💬 রিভিউ ({reviews.length})</h3>
        <button onClick={() => {
          if (!loggedInUser) {
            alert('রিভিউ দিতে আগে লগইন করুন!');
            return;
          }
          setShowForm(!showForm);
        }} style={{ background: 'white', color: '#e62e04', border: '1px solid #e62e04', padding: '5px 12px', borderRadius: '3px', cursor: 'pointer', fontWeight: '500', fontSize: '11px' }}>
          ✍️ লিখুন
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '6px', marginBottom: '10px' }}>
          <input 
            value={reviewForm.user_name} 
            onChange={e => setReviewForm({...reviewForm, user_name: e.target.value})} 
            placeholder={loggedInUser ? (reviewForm.user_name || 'আপনার নাম') : 'আপনার নাম'}
            style={revInp}
            readOnly={!!loggedInUser}
          />
          <div style={{ display: 'flex', gap: '2px', margin: '6px 0' }}>
            {[1,2,3,4,5].map(s => (
              <span key={s} onClick={() => setReviewForm({...reviewForm, rating: s})} style={{ fontSize: '20px', cursor: 'pointer', opacity: s <= reviewForm.rating ? 1 : 0.3 }}>⭐</span>
            ))}
          </div>
          <textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="আপনার মন্তব্য..." style={{...revInp, height: '60px', resize: 'vertical'}} />
          <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleReviewImage(f); }} style={{ marginTop: '4px', fontSize: '11px', display: 'block' }} />
          {reviewForm.image_url && <img src={reviewForm.webp_url || reviewForm.image_url} onClick={() => setZoomImage(reviewForm.webp_url || reviewForm.image_url)} style={{ maxWidth: '60px', maxHeight: '60px', borderRadius: '3px', marginTop: '4px', cursor: 'zoom-in' }} />}
          <button onClick={submitReview} style={{ marginTop: '6px', background: '#e62e04', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '3px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' }}>💾 জমা</button>
        </div>
      )}

      {reviews.map(r => (
        <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontWeight: '600', fontSize: '12px', color: '#333' }}>{r.user_name}</span>
            <span style={{ fontSize: '10px', color: '#F59E0B' }}>{'⭐'.repeat(r.rating ?? 0)}</span>
          </div>
          <p style={{ fontSize: '11px', color: '#666', margin: '2px 0' }}>{r.comment}</p>
          {r.image_url && <img src={r.webp_url || r.image_url} onClick={() => setZoomImage(r.webp_url || r.image_url)} style={{ maxWidth: '50px', maxHeight: '50px', borderRadius: '3px', cursor: 'zoom-in', border: '1px solid #eee' }} />}
        </div>
      ))}

      {zoomImage && (
        <div onClick={() => setZoomImage(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '20px',
        }}>
          <span onClick={() => setZoomImage(null)} style={{ position: 'absolute', top: '20px', right: '30px', color: 'white', fontSize: '36px' }}>✕</span>
          <img src={zoomImage} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px' }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

const revInp: React.CSSProperties = { width: '100%', padding: '6px 8px', borderRadius: '3px', border: '1px solid #ddd', fontSize: '11px', marginBottom: '4px', boxSizing: 'border-box' };
const iconBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
  width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};