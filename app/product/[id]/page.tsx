"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/imageCompress';
import PCHeader from '@/components/PCHeader';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [typingText, setTypingText] = useState('');

  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) {
        setProduct(data);
        setAddedCount(Math.floor(Math.random() * 100) + 20);
        if (data.category) {
          const { data: relatedData } = await supabase.from('products').select('*').eq('category', data.category).neq('id', data.id).limit(8);
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
    const timer = setInterval(() => { start += 3; if (start >= addedCount) { setDisplayCount(addedCount); clearInterval(timer); } else setDisplayCount(start); }, 30);
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

  useEffect(() => {
    let i = 0, isDeleting = false;
    const typing = setInterval(() => {
      if (!isDeleting) { if (i < 13) { setTypingText("Search items...".slice(0, i + 1)); i++; } else isDeleting = true; }
      else { if (i > 0) { setTypingText("Search items...".slice(0, i - 1)); i--; } else isDeleting = false; }
    }, 100);
    return () => clearInterval(typing);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  };

  async function toggleWishlist() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { router.push('/auth/login'); return; }
    if (isWishlisted) await supabase.from('wishlist').delete().eq('user_id', userData.user.id).eq('product_id', product!.id);
    else await supabase.from('wishlist').insert({ user_id: userData.user.id, product_id: product!.id });
    setIsWishlisted(!isWishlisted);
  }

  const addToCart = async () => {
    if (!product) return;
    const { data: existing } = await supabase.from('cart').select('*').eq('product_id', product.id).eq('user_id', 'guest').single();
    if (existing) await supabase.from('cart').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
    else await supabase.from('cart').insert({ product_id: product.id, quantity: 1, user_id: 'guest' });
    alert('✅ কার্টে যোগ হয়েছে!');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>⏳</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '100px' }}>📭</div>;

  const discount = product.discount ?? 0;
  const rating = product.rating ?? 0;
  const oldPrice = product.old_price ?? 0;
  const allImages = [product.webp_url || product.image_url].filter(Boolean);
  const mainImage = allImages[selectedImage] || allImages[0] || '';

  const ProductInfo = () => (
    <>
      <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 12px 0', lineHeight: '1.4' }}>{product.title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <span style={{ background: '#00a651', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>{rating > 0 ? `⭐ ${rating}` : '⭐ New'}</span>
        <span style={{ fontSize: '12px', color: '#666' }}>{rating > 0 ? `${rating} | 3 Ratings` : ''}</span>
        {product.sold && product.sold > 0 && <span style={{ fontSize: '12px', color: '#999' }}>| 🔥 {product.sold} Sold</span>}
        {product.stock && product.stock > 0 && <span style={{ fontSize: '12px', color: '#00a651' }}>| ✅ In Stock</span>}
      </div>

      <div style={{ marginBottom: '14px' }}>
        <span style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a2e' }}>৳{product.price?.toLocaleString()}</span>
        {oldPrice > 0 && <><span style={{ fontSize: '15px', color: '#999', textDecoration: 'line-through', marginLeft: '10px' }}>৳{oldPrice.toLocaleString()}</span><span style={{ fontSize: '13px', color: '#e62e04', fontWeight: '700', marginLeft: '8px' }}>-{discount}% OFF</span></>}
        <p style={{ fontSize: '11px', color: '#00a651', margin: '4px 0 0' }}>(Inclusive of all taxes)</p>
      </div>

      <div style={{ background: '#FFF8E1', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '13px', color: '#E65100' }}>
        <span>👥</span><span style={{ fontWeight: '700', fontSize: '16px', color: '#e62e04' }}>{displayCount}+</span> people added to cart
      </div>

      {product.description && (
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 6px 0' }}>📋 Product Highlights</h3>
          <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.8' }}>
            {product.description.split('. ').filter(Boolean).map((line, i) => <div key={i}>• {line}</div>)}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 6px 0' }}>📄 Product Details</h3>
        <div style={{ display: 'grid', gap: '6px' }}>
          {product.category && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}><span style={{ color: '#888' }}>Category</span><span style={{ fontWeight: '600' }}>{product.category}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}><span style={{ color: '#888' }}>Stock</span><span style={{ fontWeight: '600', color: (product.stock && product.stock > 0) ? '#00a651' : '#e62e04' }}>{(product.stock && product.stock > 0) ? `✅ In Stock (${product.stock})` : '❌ Out of Stock'}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}><span style={{ color: '#888' }}>Sold</span><span style={{ fontWeight: '600' }}>🔥 {product.sold || 0}</span></div>
        </div>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif', paddingBottom: '80px' }}>
      
      {/* ===== PC HEADER ===== */}
      <div className="pc-header-wrap"><PCHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} /></div>

      {/* ===== মোবাইল ব্যাক বাটন ===== */}
      <button className="mobile-back-btn" onClick={() => router.back()} style={{
        position: 'fixed', top: '12px', left: '12px', zIndex: 100,
        background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
        width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }}>←</button>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div className="product-flex" style={{ background: 'white' }}>
          
          {/* ===== ইমেজ সেকশন ===== */}
          <div className="product-image-col" style={{ position: 'relative' }}>
            <div className="zoom-wrapper" ref={imgRef}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setZoomImage(mainImage)}
              style={{ position: 'relative', overflow: 'hidden', cursor: 'crosshair', background: '#fafafa' }}>
              
              <img src={mainImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'} alt={product.title}
                style={{ width: '100%', height: '380px', objectFit: 'contain', display: 'block' }} />

              {/* Zoom Lens + Result (PC) */}
              <div className="zoom-lens" style={{ display: 'none', position: 'absolute', top: `${mousePos.y}%`, left: `${mousePos.x}%`, width: '100px', height: '100px', border: '2px solid rgba(230,46,4,0.8)', borderRadius: '4px', transform: 'translate(-50%, -50%)', pointerEvents: 'none', background: 'rgba(255,255,255,0.2)', boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }} />
              <div className="zoom-result" style={{ display: 'none', position: 'absolute', top: 0, right: '-340px', width: '320px', height: '320px', border: '2px solid #e0e0e0', borderRadius: '8px', backgroundImage: `url(${mainImage})`, backgroundSize: '250%', backgroundPosition: `${mousePos.x}% ${mousePos.y}%`, backgroundRepeat: 'no-repeat', zIndex: 50, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }} />

              {discount > 0 && <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#e62e04', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '13px', fontWeight: '700' }}>-{discount}%</span>}
            </div>

            {/* থাম্বনেইল */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', padding: '10px', justifyContent: 'center' }}>
                {allImages.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImage(i)} style={{ width: '52px', height: '52px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', border: selectedImage === i ? '2px solid #e62e04' : '2px solid #e0e0e0' }}>
                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===== ইনফো সেকশন ===== */}
          <div className="product-info-col" style={{ padding: '20px' }}>
            {/* PC অ্যাকশন */}
            <div className="pc-actions" style={{ display: 'none', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px' }}>
              <button onClick={() => navigator.share?.({ title: product.title, url: window.location.href })} style={actBtn}>📤 Share</button>
              <button onClick={toggleWishlist} style={{...actBtn, background: isWishlisted ? '#ffe0e0' : '#f5f5f5'}}>{isWishlisted ? '❤️ Saved' : '🤍 Wishlist'}</button>
            </div>

            {/* মোবাইল অ্যাকশন */}
            <div className="mobile-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px' }}>
              <button onClick={() => navigator.share?.({ title: product.title, url: window.location.href })} style={iconBtn}>📤</button>
              <button onClick={addToCart} style={iconBtn}>🛒</button>
              <button onClick={toggleWishlist} style={{...iconBtn, color: isWishlisted ? '#e62e04' : '#333'}}>{isWishlisted ? '❤️' : '🤍'}</button>
            </div>

            <ProductInfo />

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={addToCart} style={{ flex: 1, padding: '14px', background: 'white', color: '#e62e04', border: '2px solid #e62e04', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>ADD TO CART</button>
              <button onClick={() => router.push('/checkout')} style={{ flex: 1, padding: '14px', background: '#e62e04', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>BUY NOW</button>
            </div>
          </div>
        </div>

        {/* রিভিউ + রিলেটেড */}
        <ReviewSection productId={product.id} />

        {related.length > 0 && (
          <div style={{ marginTop: '20px', padding: '0 15px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>🔗 Related</h3>
            <div className="related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {related.slice(0, 8).map((r, i) => (
                <div key={i} onClick={() => router.push(`/product/${r.id}`)} style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #eee' }}>
                  <img src={r.webp_url || r.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'} style={{ width: '100%', height: '140px', objectFit: 'cover' }} alt="" />
                  <div style={{ padding: '10px' }}><p style={{ fontSize: '12px', fontWeight: '600', margin: '0 0 4px 0' }}>{r.title}</p><span style={{ fontSize: '14px', fontWeight: '700', color: '#e62e04' }}>৳{(r.price ?? 0).toLocaleString()}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* জুম মোডাল */}
      {zoomImage && (
        <div onClick={() => setZoomImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '20px' }}>
          <span onClick={() => setZoomImage(null)} style={{ position: 'absolute', top: '20px', right: '30px', color: 'white', fontSize: '36px' }}>✕</span>
          <img src={zoomImage} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px' }} />
        </div>
      )}

      <style jsx global>{`
        .pc-header-wrap { display: none; }
        .mobile-back-btn { display: flex; }
        .pc-actions { display: none !important; }
        .mobile-actions { display: flex !important; }
        .zoom-lens, .zoom-result { display: none !important; }
        .product-flex { flex-direction: column; }
        .product-image-col { width: 100%; }
        .product-info-col { width: 100%; }
        .related-grid { grid-template-columns: repeat(2, 1fr); }

        @media (min-width: 1024px) {
          .pc-header-wrap { display: block !important; }
          .mobile-back-btn { display: none !important; }
          .pc-actions { display: flex !important; }
          .mobile-actions { display: none !important; }
          .product-flex { flex-direction: row !important; gap: 0 !important; }
          .product-image-col { width: 50% !important; }
          .product-info-col { width: 50% !important; padding: 30px !important; }
          .related-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .zoom-wrapper:hover .zoom-lens { display: block !important; }
          .zoom-wrapper:hover .zoom-result { display: block !important; }
          .product-image-col img { height: 450px !important; }
        }
      `}</style>
    </div>
  );
}

// ===== রিভিউ =====
function ReviewSection({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ user_name: '', rating: 5, comment: '', image_url: '', webp_url: '' });
  const [uploading, setUploading] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  useEffect(() => { async function load() { const { data } = await supabase.auth.getUser(); if (data.user) { setLoggedInUser(data.user); const { data: p } = await supabase.from('profiles').select('full_name').eq('id', data.user.id).single(); if (p?.full_name) setReviewForm(prev => ({ ...prev, user_name: p.full_name })); else if (data.user.user_metadata?.full_name) setReviewForm(prev => ({ ...prev, user_name: data.user.user_metadata.full_name })); } } load(); }, []);
  useEffect(() => { loadReviews(); }, [productId]);

  async function loadReviews() { const { data } = await supabase.from('reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false }); if (data) setReviews(data); }
  async function handleReviewImage(file: File) { setUploading(true); const c = await compressImage(file, 30); const n = `review_${Date.now()}.webp`; const { data } = await supabase.storage.from('banners').upload(n, c, { contentType: 'image/webp', upsert: true }); if (data) { const u = `https://zypshsruibnbefixknxm.supabase.co/storage/v1/object/public/banners/${n}`; setReviewForm(prev => ({ ...prev, image_url: u, webp_url: u })); } setUploading(false); }
  async function submitReview() { if (!reviewForm.comment) return alert('কমেন্ট লিখুন!'); const { error } = await supabase.from('reviews').insert({ product_id: productId, user_name: reviewForm.user_name || loggedInUser?.user_metadata?.full_name || 'Anonymous', rating: reviewForm.rating, comment: reviewForm.comment, image_url: reviewForm.image_url, webp_url: reviewForm.webp_url }); if (!error) { setReviewForm(prev => ({ ...prev, rating: 5, comment: '', image_url: '', webp_url: '' })); setShowForm(false); loadReviews(); } }

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', margin: '20px 15px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>💬 রিভিউ ({reviews.length})</h3>
        <button onClick={() => { if (!loggedInUser) { alert('রিভিউ দিতে আগে লগইন করুন!'); return; } setShowForm(!showForm); }} style={{ background: 'white', color: '#e62e04', border: '1px solid #e62e04', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>✍️ লিখুন</button>
      </div>
      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '14px', borderRadius: '8px', marginBottom: '12px' }}>
          <input value={reviewForm.user_name} onChange={e => setReviewForm({...reviewForm, user_name: e.target.value})} placeholder="আপনার নাম" style={revInp} readOnly={!!loggedInUser} />
          <div style={{ display: 'flex', gap: '4px', margin: '8px 0' }}>{[1,2,3,4,5].map(s => <span key={s} onClick={() => setReviewForm({...reviewForm, rating: s})} style={{ fontSize: '22px', cursor: 'pointer', opacity: s <= reviewForm.rating ? 1 : 0.3 }}>⭐</span>)}</div>
          <textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="মন্তব্য..." style={{...revInp, height: '60px'}} />
          <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleReviewImage(f); }} style={{ marginTop: '6px', fontSize: '11px' }} />
          {reviewForm.image_url && <img src={reviewForm.webp_url || reviewForm.image_url} onClick={() => setZoomImage(reviewForm.webp_url || reviewForm.image_url)} style={{ maxWidth: '60px', maxHeight: '60px', borderRadius: '4px', marginTop: '6px', cursor: 'zoom-in' }} />}
          <button onClick={submitReview} style={{ marginTop: '8px', background: '#e62e04', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>💾 জমা</button>
        </div>
      )}
      {reviews.map(r => (
        <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontWeight: '600', fontSize: '13px' }}>{r.user_name}</span><span style={{ fontSize: '11px', color: '#F59E0B' }}>{'⭐'.repeat(r.rating ?? 0)}</span></div>
          <p style={{ fontSize: '12px', color: '#666', margin: '3px 0' }}>{r.comment}</p>
          {r.image_url && <img src={r.webp_url || r.image_url} onClick={() => setZoomImage(r.webp_url || r.image_url)} style={{ maxWidth: '50px', maxHeight: '50px', borderRadius: '4px', cursor: 'zoom-in' }} />}
        </div>
      ))}
      {zoomImage && <div onClick={() => setZoomImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '20px' }}><span onClick={() => setZoomImage(null)} style={{ position: 'absolute', top: '20px', right: '30px', color: 'white', fontSize: '36px' }}>✕</span><img src={zoomImage} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px' }} /></div>}
    </div>
  );
}

const revInp: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', marginBottom: '4px', boxSizing: 'border-box' };
const iconBtn: React.CSSProperties = { background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const actBtn: React.CSSProperties = { background: '#f5f5f5', border: '1px solid #ddd', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' };