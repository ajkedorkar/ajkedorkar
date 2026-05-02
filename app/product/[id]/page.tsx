"use client";

import { useState, useEffect, useRef } from 'react';
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

  // Mouse Zoom state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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

  // Mouse move handler for zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><span style={{ fontSize: '32px' }}>⏳</span></div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '100px' }}>📭</div>;

  const discount = product.discount ?? 0;
  const rating = product.rating ?? 0;
  const oldPrice = product.old_price ?? 0;
  const allImages: string[] = [];
  if (product.webp_url) allImages.push(product.webp_url);
  else if (product.image_url) allImages.push(product.image_url);
  const mainImage = allImages[selectedImage] || allImages[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      
      {/* ===== PC হেডার ===== */}
      <header className="pc-header-bar" style={{
        background: 'white', padding: '12px 5%', display: 'none',
        alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div onClick={() => router.push('/')} style={{ fontSize: '22px', fontWeight: '800', color: '#e62e04', cursor: 'pointer' }}>AjkeDorkar</div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '20px' }}>
          <span onClick={() => router.push('/account/wishlist')} style={{ cursor: 'pointer' }}>❤️</span>
          <span onClick={() => router.push('/cart')} style={{ cursor: 'pointer' }}>🛒</span>
          <span onClick={() => router.push('/account')} style={{ cursor: 'pointer' }}>👤</span>
        </div>
      </header>

      {/* ===== মোবাইল হেডার ===== */}
      <header className="mobile-header-bar" style={{
        background: 'white', padding: '12px 16px', display: 'flex',
        alignItems: 'center', gap: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0 }}>←</button>
        <h1 style={{ margin: 0, fontSize: '14px', fontWeight: '600', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</h1>
        <span onClick={() => router.push('/cart')} style={{ fontSize: '18px', cursor: 'pointer' }}>🛒</span>
      </header>

      {/* ===== মেইন কন্টেন্ট ===== */}
      <div className="product-layout" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 15px' }}>
        
        {/* ইমেজ + ইনফো ফ্লেক্স */}
        <div className="product-flex" style={{
          display: 'flex', flexDirection: 'column', gap: '20px', background: 'white',
          borderRadius: '12px', padding: '20px', marginBottom: '20px',
        }}>
          
          {/* ===== ইমেজ সেকশন ===== */}
          <div className="product-image-section" style={{ flex: 1, position: 'relative' }}>
            
            {/* মেইন ইমেজ (Mouse Zoom on PC) */}
            <div 
              ref={imgRef}
              className="zoom-container"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              onMouseMove={handleMouseMove}
              style={{
                position: 'relative',
                overflow: 'hidden',
                cursor: 'zoom-in',
                borderRadius: '8px',
                background: '#fafafa',
              }}
            >
              <img 
                src={mainImage} 
                alt={product.title}
                style={{ width: '100%', height: '380px', objectFit: 'contain', display: 'block' }}
              />
              
              {/* PC Mouse Zoom Overlay */}
              <div className="pc-zoom-lens" style={{
                display: 'none',
                position: 'absolute',
                top: `${mousePos.y}%`,
                left: `${mousePos.x}%`,
                width: '120px',
                height: '120px',
                border: '2px solid #e62e04',
                borderRadius: '4px',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                background: 'rgba(255,255,255,0.3)',
              }} />

              {/* PC Mouse Zoom Result */}
              <div className="pc-zoom-result" style={{
                display: 'none',
                position: 'absolute',
                top: 0,
                right: '-320px',
                width: '300px',
                height: '300px',
                border: '2px solid #ddd',
                borderRadius: '8px',
                background: `url(${mainImage}) no-repeat`,
                backgroundSize: '300%',
                backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                zIndex: 50,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }} />
            </div>

            {/* ইমেজ অ্যাকশন বাটন (মোবাইল) */}
            <div className="mobile-img-actions" style={{
              position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px',
            }}>
              <button onClick={() => navigator.share?.({ title: product.title, url: window.location.href })} style={iconBtn}>📤</button>
              <button onClick={addToCart} style={iconBtn}>🛒</button>
              <button onClick={toggleWishlist} style={{...iconBtn, color: isWishlisted ? '#e62e04' : '#333'}}>
                {isWishlisted ? '❤️' : '🤍'}
              </button>
            </div>

            {/* থাম্বনেইল */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'center' }}>
                {allImages.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImage(i)} style={{
                    width: '56px', height: '56px', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer',
                    border: selectedImage === i ? '2px solid #e62e04' : '2px solid #e8e8e8',
                    opacity: selectedImage === i ? 1 : 0.6,
                  }}><img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /></div>
                ))}
              </div>
            )}
          </div>

          {/* ===== ইনফো সেকশন ===== */}
          <div className="product-info-section" style={{ flex: 1 }}>
            
            {/* PC অ্যাকশন বাটন */}
            <div className="pc-img-actions" style={{ display: 'none', justifyContent: 'flex-end', gap: '8px', marginBottom: '12px' }}>
              <button onClick={() => navigator.share?.({ title: product.title, url: window.location.href })} 
                style={{ background: '#f5f5f5', border: '1px solid #ddd', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>📤 Share</button>
              <button onClick={toggleWishlist} 
                style={{ background: isWishlisted ? '#ffe0e0' : '#f5f5f5', border: '1px solid #ddd', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
                {isWishlisted ? '❤️ Saved' : '🤍 Wishlist'}
              </button>
            </div>

            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 12px 0', lineHeight: '1.4' }}>
              {product.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ background: '#00a651', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: '700' }}>
                {rating > 0 ? `⭐ ${rating}` : '⭐ New'}
              </span>
              <span style={{ fontSize: '13px', color: '#666' }}>{rating > 0 ? `${rating} | 3 Ratings` : 'No Ratings'}</span>
              {product.sold && product.sold > 0 && (
                <span style={{ fontSize: '13px', color: '#999' }}>| 🔥 {product.sold} Sold</span>
              )}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a2e' }}>৳{product.price?.toLocaleString()}</span>
              {oldPrice > 0 && (
                <>
                  <span style={{ fontSize: '16px', color: '#999', textDecoration: 'line-through', marginLeft: '12px' }}>৳{oldPrice.toLocaleString()}</span>
                  <span style={{ fontSize: '14px', color: '#e62e04', fontWeight: '700', marginLeft: '8px' }}>-{discount}% OFF</span>
                </>
              )}
              <p style={{ fontSize: '12px', color: '#00a651', margin: '4px 0 0' }}>(Inclusive of all taxes)</p>
            </div>

            <div style={{
              background: '#FFF8E1', borderRadius: '8px', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px',
              fontSize: '14px', color: '#E65100',
            }}>
              <span style={{ fontSize: '18px' }}>👥</span>
              <span style={{ fontWeight: '700', fontSize: '18px', color: '#e62e04' }}>{displayCount}+</span>
              people have added this to cart
            </div>

            {product.description && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px 0' }}>📋 Product Highlights</h3>
                <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', margin: 0 }}>{product.description}</p>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 8px 0' }}>📄 Product Details</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {product.category && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <span style={{ color: '#888' }}>Category</span><span style={{ fontWeight: '600', color: '#333' }}>{product.category}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ color: '#888' }}>Stock</span>
                  <span style={{ fontWeight: '600', color: (product.stock && product.stock > 0) ? '#00a651' : '#e62e04' }}>
                    {(product.stock && product.stock > 0) ? `✅ In Stock (${product.stock})` : '❌ Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* বাটন */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button onClick={addToCart} style={{
                flex: 1, padding: '16px', background: 'white', color: '#e62e04',
                border: '2px solid #e62e04', borderRadius: '10px', fontWeight: '700', fontSize: '16px', cursor: 'pointer',
              }}>ADD TO CART</button>
              <button onClick={() => router.push('/checkout')} style={{
                flex: 1, padding: '16px', background: '#e62e04', color: 'white',
                border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '16px', cursor: 'pointer',
              }}>BUY NOW</button>
            </div>
          </div>
        </div>

        {/* ===== রিভিউ ===== */}
        <ReviewSection productId={product.id} />

        {/* ===== রিলেটেড ===== */}
        {related.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', marginBottom: '12px' }}>🔗 Related Products</h3>
            <div className="related-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px',
            }}>
              {related.slice(0, 8).map((r, i) => (
                <div key={i} onClick={() => router.push(`/product/${r.id}`)} style={{
                  background: 'white', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
                  border: '1px solid #eee',
                }}>
                  <img src={r.webp_url || r.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300'} 
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }} alt="" />
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: '0 0 6px 0' }}>{r.title}</p>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#e62e04' }}>৳{(r.price ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== জুম মোডাল (মোবাইল) ===== */}
      {zoomImage && (
        <div onClick={() => setZoomImage(null)} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '20px',
        }}>
          <span onClick={() => setZoomImage(null)} style={{ position: 'absolute', top: '20px', right: '30px', color: 'white', fontSize: '36px' }}>✕</span>
          <img src={zoomImage} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '8px' }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* ===== CSS ===== */}
      <style jsx global>{`
        .mobile-header-bar { display: flex; }
        .pc-header-bar { display: none; }
        .mobile-img-actions { display: flex; }
        .pc-img-actions { display: none; }
        .pc-zoom-lens { display: none !important; }
        .pc-zoom-result { display: none !important; }
        .related-grid { grid-template-columns: repeat(2, 1fr); }

        @media (min-width: 1024px) {
          .mobile-header-bar { display: none !important; }
          .pc-header-bar { display: flex !important; }
          .mobile-img-actions { display: none !important; }
          .pc-img-actions { display: flex !important; }
          .product-flex { flex-direction: row !important; gap: 30px !important; }
          .product-image-section { flex: 1 !important; position: sticky !important; top: 80px !important; align-self: flex-start !important; }
          .product-info-section { flex: 1 !important; }
          .related-grid { grid-template-columns: repeat(4, 1fr) !important; }

          /* Mouse Zoom */
          .zoom-container:hover .pc-zoom-lens { display: block !important; }
          .zoom-container:hover .pc-zoom-result { display: block !important; }
          .zoom-container img { height: 450px !important; }
        }
      `}</style>
    </div>
  );
}

// ===== রিভিউ কম্পোনেন্ট =====
function ReviewSection({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ user_name: '', rating: 5, comment: '', image_url: '', webp_url: '' });
  const [uploading, setUploading] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setLoggedInUser(data.user);
        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', data.user.id).single();
        if (profile?.full_name) setReviewForm(prev => ({ ...prev, user_name: profile.full_name }));
        else if (data.user.user_metadata?.full_name) setReviewForm(prev => ({ ...prev, user_name: data.user.user_metadata.full_name }));
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
      user_name: reviewForm.user_name || loggedInUser?.user_metadata?.full_name || 'Anonymous',
      rating: reviewForm.rating, comment: reviewForm.comment,
      image_url: reviewForm.image_url, webp_url: reviewForm.webp_url,
    });
    if (!error) {
      setReviewForm(prev => ({ ...prev, rating: 5, comment: '', image_url: '', webp_url: '' }));
      setShowForm(false); loadReviews(); alert('✅ রিভিউ জমা হয়েছে!');
    }
  }

  return (
    <div style={{ background: 'white', borderRadius: '10px', padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#222', margin: 0 }}>💬 রিভিউ ({reviews.length})</h3>
        <button onClick={() => {
          if (!loggedInUser) { alert('রিভিউ দিতে আগে লগইন করুন!'); return; }
          setShowForm(!showForm);
        }} style={{ background: 'white', color: '#e62e04', border: '1px solid #e62e04', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>✍️ লিখুন</button>
      </div>

      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '14px', borderRadius: '8px', marginBottom: '12px' }}>
          <input value={reviewForm.user_name} onChange={e => setReviewForm({...reviewForm, user_name: e.target.value})} 
            placeholder={loggedInUser ? 'আপনার নাম' : 'আপনার নাম'} style={revInp} readOnly={!!loggedInUser} />
          <div style={{ display: 'flex', gap: '4px', margin: '8px 0' }}>
            {[1,2,3,4,5].map(s => (
              <span key={s} onClick={() => setReviewForm({...reviewForm, rating: s})} style={{ fontSize: '22px', cursor: 'pointer', opacity: s <= reviewForm.rating ? 1 : 0.3 }}>⭐</span>
            ))}
          </div>
          <textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="মন্তব্য..." style={{...revInp, height: '60px', resize: 'vertical'}} />
          <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleReviewImage(f); }} style={{ marginTop: '6px', fontSize: '11px' }} />
          {reviewForm.image_url && <img src={reviewForm.webp_url || reviewForm.image_url} onClick={() => setZoomImage(reviewForm.webp_url || reviewForm.image_url)} style={{ maxWidth: '60px', maxHeight: '60px', borderRadius: '4px', marginTop: '6px', cursor: 'zoom-in' }} />}
          <button onClick={submitReview} style={{ marginTop: '8px', background: '#e62e04', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>💾 জমা</button>
        </div>
      )}

      {reviews.map(r => (
        <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
            <span style={{ fontWeight: '600', fontSize: '13px', color: '#333' }}>{r.user_name}</span>
            <span style={{ fontSize: '11px', color: '#F59E0B' }}>{'⭐'.repeat(r.rating ?? 0)}</span>
          </div>
          <p style={{ fontSize: '12px', color: '#666', margin: '3px 0' }}>{r.comment}</p>
          {r.image_url && <img src={r.webp_url || r.image_url} onClick={() => setZoomImage(r.webp_url || r.image_url)} style={{ maxWidth: '50px', maxHeight: '50px', borderRadius: '4px', cursor: 'zoom-in' }} />}
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

const revInp: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', marginBottom: '4px', boxSizing: 'border-box' };
const iconBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
  width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};