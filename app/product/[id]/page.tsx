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

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const { data } = await supabase.from('products').select('*').eq('id', id).single();
      if (data) {
        setProduct(data);
        if (data.category) {
          const { data: relatedData } = await supabase.from('products').select('*').eq('category', data.category).neq('id', data.id).limit(6);
          if (relatedData) setRelated(relatedData);
        }
      }
      setLoading(false);
    }
    if (id) loadProduct();
  }, [id]);

  const addToCart = async () => {
    if (!product) return;
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
    alert('✅ কার্টে যোগ হয়েছে!');
    router.push('/cart');
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px' }}>⏳</div><p style={{ color: '#999' }}>লোড হচ্ছে...</p></div></div>;
  if (!product) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '64px' }}>📭</div><p style={{ color: '#999', fontSize: '18px' }}>প্রোডাক্ট পাওয়া যায়নি</p><button onClick={() => router.back()} style={{ marginTop: '16px', padding: '10px 24px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>← ফিরে যান</button></div></div>;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappNumber = '8801XXXXXXXXX';
  const discount = product.discount ?? 0;
  const rating = product.rating ?? 0;
  const sold = product.sold ?? 0;
  const stock = product.stock ?? 0;
  const oldPrice = product.old_price ?? 0;

  const allImages: string[] = [];
  if (product.webp_url) allImages.push(product.webp_url);
  else if (product.image_url) allImages.push(product.image_url);

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      
      <header style={{ background: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0, color: '#333' }}>←</button>
        <h1 style={{ margin: 0, fontSize: '14px', fontWeight: '600', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#333' }}>{product.title}</h1>
        <span onClick={() => router.push('/cart')} style={{ fontSize: '18px', cursor: 'pointer' }}>🛒</span>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '10px' }}>
        
        <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
          
          <div style={{ position: 'relative', background: '#fafafa' }}>
            {allImages.length > 0 ? (
              <img src={allImages[selectedImage] || allImages[0]} alt={product.title} onClick={() => setZoomImage(allImages[selectedImage] || allImages[0])}
                style={{ width: '100%', height: '300px', objectFit: 'contain', cursor: 'zoom-in' }} />
            ) : (
              <div style={{ width: '100%', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px', background: '#fafafa' }}>📦</div>
            )}
            {discount > 0 && (
              <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#e62e04', color: 'white', padding: '2px 8px', borderRadius: '3px', fontSize: '12px', fontWeight: '700' }}>-{discount}%</span>
            )}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '5px', padding: '6px', justifyContent: 'center' }}>
                {allImages.map((img, idx) => (
                  <div key={idx} onClick={() => setSelectedImage(idx)} style={{
                    width: '40px', height: '40px', borderRadius: '3px', overflow: 'hidden', cursor: 'pointer',
                    border: selectedImage === idx ? '2px solid #e62e04' : '1px solid #e8e8e8',
                    opacity: selectedImage === idx ? 1 : 0.5,
                  }}><img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /></div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '12px 14px' }}>
            
            <h2 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '600', color: '#222', lineHeight: '1.3' }}>
              {product.title}
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', fontSize: '11px', flexWrap: 'wrap' }}>
              {rating > 0 && <span style={{ color: '#F59E0B', fontWeight: '600' }}>⭐ {rating}</span>}
              {sold > 0 && <span style={{ color: '#999' }}>| 🔥 {sold} বিক্রি</span>}
              {stock > 0 ? <span style={{ color: '#00a651' }}>| ✅ স্টকে আছে</span> : <span style={{ color: '#e62e04' }}>| ❌ স্টক শেষ</span>}
              {product.category && <span style={{ color: '#999' }}>| 📂 {product.category}</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
              <span style={{ fontSize: '22px', fontWeight: '700', color: '#e62e04' }}>৳{product.price?.toLocaleString()}</span>
              {oldPrice > 0 && (
                <>
                  <span style={{ fontSize: '13px', color: '#999', textDecoration: 'line-through' }}>৳{oldPrice.toLocaleString()}</span>
                  <span style={{ fontSize: '12px', color: '#e62e04', fontWeight: '600' }}>-{discount}%</span>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button 
                onClick={addToCart}
                style={{
                  flex: 1, padding: '10px', background: '#e62e04', color: 'white',
                  border: 'none', borderRadius: '3px', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
                }}>কার্টে যোগ করুন</button>
              
              <a href={`https://wa.me/${whatsappNumber}?text=আমি%20${encodeURIComponent(product.title)}%20কিনতে%20চাই%0Aদাম:%20৳${product.price}%0A${shareUrl}`} target="_blank"
                style={{ padding: '10px', background: '#25D366', borderRadius: '3px', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '18px' }}>💬</span>
              </a>
              
              <button onClick={() => { navigator.share?.({ title: product.title, text: `${product.title} - ৳${product.price}`, url: shareUrl }); }}
                style={{ padding: '10px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '3px', cursor: 'pointer', fontSize: '16px' }}>📤</button>
              
              <button style={{ padding: '10px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '3px', cursor: 'pointer', fontSize: '16px' }}>❤️</button>
            </div>
          </div>
        </div>

        {product.description && (
          <div style={{ background: 'white', borderRadius: '10px', padding: '14px', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#222', margin: '0 0 6px 0' }}>📄 বিবরণ</h3>
            <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.6', margin: 0 }}>{product.description}</p>
          </div>
        )}

        <ReviewSection productId={product.id} />

        {related.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#222', marginBottom: '8px' }}>🔗 সম্পর্কিত</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {related.slice(0, 4).map((r, i) => (
                <div key={i} onClick={() => router.push(`/product/${r.id}`)} style={{ background: 'white', borderRadius: '6px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #eee' }}>
                  <img src={r.webp_url || r.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'} style={{ width: '100%', height: '100px', objectFit: 'cover' }} alt={r.title || ''} />
                  <div style={{ padding: '6px 8px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '500', color: '#333', margin: '0 0 3px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#e62e04' }}>৳{(r.price ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

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

function ReviewSection({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ user_name: '', rating: 5, comment: '', image_url: '', webp_url: '' });
  const [uploading, setUploading] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

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
      product_id: productId, user_name: reviewForm.user_name || 'Anonymous',
      rating: reviewForm.rating, comment: reviewForm.comment,
      image_url: reviewForm.image_url, webp_url: reviewForm.webp_url,
    });
    if (!error) {
      setReviewForm({ user_name: '', rating: 5, comment: '', image_url: '', webp_url: '' });
      setShowForm(false); loadReviews(); alert('✅ রিভিউ জমা হয়েছে!');
    }
  }

  return (
    <div style={{ background: 'white', borderRadius: '10px', padding: '14px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#222', margin: 0 }}>💬 রিভিউ ({reviews.length})</h3>
        <button onClick={() => setShowForm(!showForm)} style={{ background: 'white', color: '#e62e04', border: '1px solid #e62e04', padding: '5px 12px', borderRadius: '3px', cursor: 'pointer', fontWeight: '500', fontSize: '11px' }}>✍️ লিখুন</button>
      </div>

      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '6px', marginBottom: '10px' }}>
          <input value={reviewForm.user_name} onChange={e => setReviewForm({...reviewForm, user_name: e.target.value})} placeholder="আপনার নাম" style={revInp} />
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