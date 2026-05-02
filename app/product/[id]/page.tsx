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
  const [cartLoading, setCartLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
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

  // কার্ট কাউন্ট লোড
  useEffect(() => { loadCartCount(); }, []);
  async function loadCartCount() {
    const { count } = await supabase.from('cart').select('*', { count: 'exact' }).eq('user_id', 'guest');
    setCartCount(count || 0);
  }

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
    setMousePos({
      x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
    });
  };

  async function toggleWishlist() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { router.push('/auth/login'); return; }
    if (isWishlisted) await supabase.from('wishlist').delete().eq('user_id', userData.user.id).eq('product_id', product!.id);
    else await supabase.from('wishlist').insert({ user_id: userData.user.id, product_id: product!.id });
    setIsWishlisted(!isWishlisted);
  }

  // ✅ Supabase-এ রিয়েল কার্টে যোগ
  const addToCart = async () => {
    if (!product) return;
    setCartLoading(true);
    
    const { data: existing } = await supabase
      .from('cart')
      .select('*')
      .eq('product_id', product.id)
      .eq('user_id', 'guest')
      .single();
      
    if (existing) {
      await supabase.from('cart').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
    } else {
      await supabase.from('cart').insert({ product_id: product.id, quantity: 1, user_id: 'guest' });
    }
    
    await loadCartCount();
    setCartLoading(false);
    alert('✅ কার্টে যোগ হয়েছে! (' + (cartCount + 1) + 'টি)');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>⏳</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '100px' }}>📭</div>;

  const discount = product.discount ?? 0;
  const rating = product.rating ?? 0;
  const oldPrice = product.old_price ?? 0;
  const allImages = [product.webp_url || product.image_url].filter(Boolean);
  const mainImage = allImages[selectedImage] || allImages[0] || '';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif', paddingBottom: '70px' }}>
      
      <div className="pc-hdr"><PCHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} /></div>
      <button className="mob-back" onClick={() => router.back()}>←</button>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="main-card">
          <div className="flex-container">
            
            {/* ইমেজ */}
            <div className="image-col">
              <div className="zoom-box" ref={imgRef}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onMouseMove={handleMouseMove}
                onClick={() => setZoomImage(mainImage)}>
                <img src={mainImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'} alt={product.title} />
                
                {/* আমাজন স্টাইল জুম: লেন্স + রেজাল্ট */}
                <div className="zoom-lens" />
                <div className="zoom-result" style={{
                  backgroundImage: `url(${mainImage})`,
                  backgroundSize: '250%',
                  backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                }} />
                {discount > 0 && <span className="discount-tag">-{discount}%</span>}
              </div>
              {allImages.length > 1 && (
                <div className="thumb-row">
                  {allImages.map((img, i) => (
                    <div key={i} onClick={() => setSelectedImage(i)} className={`thumb ${selectedImage === i ? 'active' : ''}`}>
                      <img src={zoomImage || ''} alt="" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ইনফো */}
            <div className="info-col">
              <div className="mob-actions">
                <button onClick={() => { try { navigator.share({ title: product.title || '', url: window.location.href }); } catch(e) {} }}>📤</button>
                <button onClick={addToCart} disabled={cartLoading}>{cartLoading ? '⏳' : '🛒'}</button>
                <button onClick={toggleWishlist} style={{ color: isWishlisted ? '#e62e04' : '#333' }}>{isWishlisted ? '❤️' : '🤍'}</button>
              </div>
              <div className="pc-actions">
                <button onClick={() => { try { navigator.share({ title: product.title || '', url: window.location.href }); } catch(e) {} }}>📤 Share</button>
                <button onClick={toggleWishlist} style={{ background: isWishlisted ? '#ffe0e0' : '#f5f5f5' }}>{isWishlisted ? '❤️ Saved' : '🤍 Wishlist'}</button>
              </div>

              <h1 className="product-title">{product.title}</h1>
              <div className="rating-row">
                <span className="rating-badge">{rating > 0 ? `⭐ ${rating}` : '⭐ New'}</span>
                <span style={{ fontSize: '13px', color: '#666' }}>{rating > 0 ? `${rating} | 3 Ratings` : ''}</span>
                {product.sold && product.sold > 0 && <span style={{ fontSize: '12px', color: '#999' }}>| 🔥 {product.sold} Sold</span>}
                {product.stock && product.stock > 0 && <span style={{ fontSize: '12px', color: '#00a651' }}>| ✅ In Stock</span>}
              </div>
              <div className="price-row">
                <span className="current-price">৳{product.price?.toLocaleString()}</span>
                {oldPrice > 0 && <span className="old-price">৳{oldPrice.toLocaleString()}</span>}
                {discount > 0 && <span className="discount-badge">-{discount}% OFF</span>}
                <p style={{ fontSize: '11px', color: '#00a651', margin: '4px 0 0', width: '100%' }}>(Inclusive of all taxes)</p>
              </div>
              <div className="social-proof"><span>👥</span><strong>{displayCount}+</strong> people have added this to cart</div>
              {product.description && (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 8px 0' }}>📋 Product Highlights</h3>
                  <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.8' }}>
                    {product.description.split('. ').filter(Boolean).map((line, i) => <div key={i}>• {line}</div>)}
                  </div>
                </div>
              )}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 8px 0' }}>📄 Product Details</h3>
                <div style={{ display: 'grid', gap: '6px' }}>
                  {product.category && <div className="detail-row"><span>Category</span><span>{product.category}</span></div>}
                  <div className="detail-row"><span>Stock</span><span style={{ color: (product.stock && product.stock > 0) ? '#00a651' : '#e62e04' }}>{(product.stock && product.stock > 0) ? `✅ In Stock (${product.stock})` : '❌ Out of Stock'}</span></div>
                  <div className="detail-row"><span>Sold</span><span>🔥 {product.sold || 0}</span></div>
                </div>
              </div>
              {/* PC বাটন */}
              <div className="pc-btns">
                <button onClick={addToCart} className="btn-outline" disabled={cartLoading}>{cartLoading ? '⏳' : 'ADD TO CART'}</button>
                <button onClick={() => router.push('/checkout')} className="btn-solid">BUY NOW</button>
              </div>
            </div>
          </div>
        </div>

        <ReviewSection productId={product.id} />

        {related.length > 0 && (
          <div style={{ marginTop: '20px', padding: '0 15px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>🔗 Related Products</h3>
            <div className="related-grid">
              {related.slice(0, 8).map((r, i) => (
                <div key={i} onClick={() => router.push(`/product/${r.id}`)} className="related-card">
                  <img src={r.webp_url || r.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'} alt="" />
                  <div style={{ padding: '10px' }}><p>{r.title}</p><span>৳{(r.price ?? 0).toLocaleString()}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🔥 মোবাইল ফিক্সড বটম বাটন */}
      <div className="mobile-fixed-btns">
        <button onClick={addToCart} className="btn-outline" disabled={cartLoading}>{cartLoading ? '⏳ ADDING...' : 'ADD TO CART'}</button>
        <button onClick={() => router.push('/checkout')} className="btn-solid">BUY NOW</button>
      </div>

      {/* জুম মোডাল */}
      {zoomImage && (
        <div className="zoom-modal" onClick={() => setZoomImage(null)}>
          <span onClick={() => setZoomImage(null)}>✕</span>
          <img src={zoomImage || ''} alt="" />
        </div>
      )}

      <style jsx global>{`
        .pc-hdr { display: none; }
        .mob-back { display: flex; position: fixed; top: 12px; left: 12px; z-index: 100; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 18px; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        .mob-actions { display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 12px; }
        .mob-actions button { background: #f5f5f5; border: 1px solid #ddd; border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
        .pc-actions { display: none; justify-content: flex-end; gap: 8px; margin-bottom: 12px; }
        .pc-actions button { background: #f5f5f5; border: 1px solid #ddd; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; }
        .main-card { background: white; border-radius: 2px; overflow: hidden; }
        .flex-container { display: flex; flex-direction: column; }
        .image-col { width: 100%; position: relative; }
        .image-col img { width: 100%; height: 380px; object-fit: contain; display: block; background: #fafafa; }
        .info-col { width: 100%; padding: 16px; }
        .zoom-box { position: relative; overflow: hidden; cursor: crosshair; background: #fafafa; }
        .zoom-lens { display: none; position: absolute; width: 100px; height: 100px; border: 2px solid rgba(230,46,4,0.8); border-radius: 4px; transform: translate(-50%, -50%); pointer-events: none; background: rgba(255,255,255,0.2); box-shadow: 0 0 0 9999px rgba(0,0,0,0.4); }
        .zoom-result { display: none; position: absolute; top: 0; right: -340px; width: 320px; height: 320px; border: 2px solid #e0e0e0; border-radius: 8px; z-index: 50; box-shadow: 0 8px 30px rgba(0,0,0,0.2); background-repeat: no-repeat; }
        .discount-tag { position: absolute; top: 12px; left: 12px; background: #e62e04; color: white; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 700; }
        .thumb-row { display: flex; gap: 8px; padding: 10px; justify-content: center; }
        .thumb { width: 52px; height: 52px; border-radius: 6px; overflow: hidden; cursor: pointer; border: 2px solid #e0e0e0; }
        .thumb.active { border-color: #e62e04; }
        .thumb img { width: 100%; height: 100%; object-fit: cover; }
        .product-title { font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0 0 12px 0; line-height: 1.4; }
        .rating-row { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
        .rating-badge { background: #00a651; color: white; padding: 4px 10px; border-radius: 4px; font-size: 13px; font-weight: 700; }
        .current-price { font-size: 26px; font-weight: 800; color: #1a1a2e; }
        .old-price { font-size: 15px; color: #999; text-decoration: line-through; margin-left: 10px; }
        .discount-badge { font-size: 13px; color: #e62e04; font-weight: 700; margin-left: 8px; }
        .social-proof { background: #FFF8E1; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 13px; color: #E65100; }
        .social-proof strong { font-size: 16px; color: #e62e04; }
        .detail-row { display: flex; justify-content: space-between; font-size: 12px; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
        .detail-row span:first-child { color: #888; }
        .detail-row span:last-child { font-weight: 600; }
        .btn-outline { flex: 1; padding: 14px; background: white; color: #e62e04; border: 2px solid #e62e04; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; }
        .btn-solid { flex: 1; padding: 14px; background: #e62e04; color: white; border: none; border-radius: 8px; font-weight: 700; font-size: 14px; cursor: pointer; }
        .pc-btns { display: none; gap: 10px; margin-top: 20px; }
        .related-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .related-card { background: white; border-radius: 8px; overflow: hidden; cursor: pointer; border: 1px solid #eee; }
        .related-card img { width: 100%; height: 140px; object-fit: cover; }
        .related-card p { font-size: 12px; font-weight: 600; margin: 0 0 4px 0; }
        .related-card span { font-size: 14px; font-weight: 700; color: #e62e04; }
        .zoom-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.95); z-index: 9999; display: flex; align-items: center; justifyContent: center; cursor: zoom-out; padding: 20px; }
        .zoom-modal span { position: absolute; top: 20px; right: 30px; color: white; fontSize: 36px; }
        .zoom-modal img { max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px; }

        /* 🔥 মোবাইল ফিক্সড বটম */
        .mobile-fixed-btns { display: flex; gap: 10px; padding: 12px 16px; background: white; border-top: 1px solid #eee; position: fixed; bottom: 0; left: 0; right: 0; z-index: 100; }
        .mobile-fixed-btns button:disabled { opacity: 0.5; }

        @media (min-width: 1024px) {
          .pc-hdr { display: block !important; }
          .mob-back { display: none !important; }
          .mob-actions { display: none !important; }
          .pc-actions { display: flex !important; }
          .flex-container { flex-direction: row !important; gap: 0 !important; }
          .image-col { width: 50% !important; }
          .info-col { width: 50% !important; padding: 30px !important; }
          .image-col img { height: 450px !important; }
          .related-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .pc-btns { display: flex !important; }
          .mobile-fixed-btns { display: none !important; }
          /* ✅ আমাজন স্টাইল জুম: PC-তে হোভার করলে */
          .zoom-box { overflow: visible !important; }
          .zoom-box:hover .zoom-lens { display: block !important; position: absolute !important; top: 0 !important; left: 0 !important; width: 100px !important; height: 100px !important; border: 2px solid rgba(230,46,4,0.8) !important; border-radius: 4px !important; transform: translate(-50%, -50%) !important; pointer-events: none !important; background: rgba(255,255,255,0.2) !important; box-shadow: 0 0 0 9999px rgba(0,0,0,0.4) !important; }
          .zoom-box:hover .zoom-result { display: block !important; position: absolute !important; top: 0 !important; right: -340px !important; width: 320px !important; height: 320px !important; border: 2px solid #e0e0e0 !important; border-radius: 8px !important; z-index: 50 !important; box-shadow: 0 8px 30px rgba(0,0,0,0.2) !important; background-repeat: no-repeat !important; }
          .product-title { font-size: 22px !important; }
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
          <input value={reviewForm.user_name} onChange={e => setReviewForm({...reviewForm, user_name: e.target.value})} placeholder="আপনার নাম" style={rInp} readOnly={!!loggedInUser} />
          <div style={{ display: 'flex', gap: '4px', margin: '8px 0' }}>{[1,2,3,4,5].map(s => <span key={s} onClick={() => setReviewForm({...reviewForm, rating: s})} style={{ fontSize: '22px', cursor: 'pointer', opacity: s <= reviewForm.rating ? 1 : 0.3 }}>⭐</span>)}</div>
          <textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="মন্তব্য..." style={{...rInp, height: '60px'}} />
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
      {zoomImage && <div onClick={() => setZoomImage(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '20px' }}><span onClick={() => setZoomImage(null)} style={{ position: 'absolute', top: '20px', right: '30px', color: 'white', fontSize: '36px' }}>✕</span><img src={zoomImage || ''} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px' }} /></div>}
    </div>
  );
}

const rInp: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', marginBottom: '4px', boxSizing: 'border-box' };