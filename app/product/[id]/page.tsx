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

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '48px' }}>⏳</div><p style={{ color: '#999' }}>লোড হচ্ছে...</p></div></div>;
  if (!product) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}><div style={{ textAlign: 'center' }}><div style={{ fontSize: '64px' }}>📭</div><p style={{ color: '#999', fontSize: '18px' }}>প্রোডাক্ট পাওয়া যায়নি</p><button onClick={() => router.back()} style={{ marginTop: '16px', padding: '10px 24px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>← ফিরে যান</button></div></div>;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappNumber = '8801XXXXXXXXX';

  // সেফটি চেক
  const discount = product.discount ?? 0;
  const rating = product.rating ?? 0;
  const sold = product.sold ?? 0;
  const stock = product.stock ?? 0;
  const oldPrice = product.old_price ?? 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      
      <header style={{ background: 'white', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', padding: 0, color: '#333' }}>←</button>
        <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '700', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</h1>
        <span style={{ fontSize: '20px', cursor: 'pointer' }}>🛒</span>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '15px' }}>
        
        <div style={{ background: 'white', borderRadius: '14px', overflow: 'hidden', marginBottom: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          
          <div style={{ position: 'relative' }}>
            {product.image_url ? (
              <img src={product.webp_url || product.image_url} alt={product.title} style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '350px', background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px' }}>📦</div>
            )}
            {discount > 0 && (
              <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'linear-gradient(135deg, #e62e04, #FF416C)', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '14px', fontWeight: '800' }}>
                -{discount}% OFF
              </span>
            )}
          </div>

          <div style={{ padding: '20px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700', color: '#1a1a2e', lineHeight: '1.4' }}>{product.title}</h2>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              {rating > 0 && <span style={{ background: '#FFF8E1', color: '#FFB347', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>⭐ {rating}</span>}
              {sold > 0 && <span style={{ fontSize: '12px', color: '#888' }}>🔥 {sold} বিক্রি</span>}
              {stock > 0 ? <span style={{ color: '#00a651', fontSize: '12px', fontWeight: '600' }}>✅ স্টকে আছে ({stock}টি)</span> : <span style={{ color: '#e62e04', fontSize: '12px', fontWeight: '600' }}>❌ স্টক শেষ</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: '#e62e04' }}>৳{product.price?.toLocaleString()}</span>
              {oldPrice > 0 && <span style={{ fontSize: '16px', color: '#999', textDecoration: 'line-through' }}>৳{oldPrice.toLocaleString()}</span>}
            </div>

            {product.category && (
              <div style={{ marginBottom: '14px' }}>
                <span style={{ background: '#f0f0f0', color: '#666', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>📂 {product.category}</span>
              </div>
            )}

            {product.description && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#333', marginBottom: '6px' }}>📄 বিবরণ</h3>
                <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>{product.description}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button style={{ flex: 1, padding: '14px', background: 'linear-gradient(135deg, #e62e04, #FF6B35)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(230,46,4,0.3)' }}>
                🛒 কার্টে যোগ করুন
              </button>
              <button style={{ width: '50px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', fontSize: '20px' }}>❤️</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <a href={`https://wa.me/${whatsappNumber}?text=আমি%20${encodeURIComponent(product.title)}%20প্রোডাক্টটি%20কিনতে%20চাই%0Aদাম:%20৳${product.price}%0A${shareUrl}`} target="_blank" style={{ flex: 1, padding: '12px', background: '#25D366', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>💬</span> WhatsApp-এ চ্যাট
              </a>
              <button onClick={() => { navigator.share?.({ title: product.title, text: `${product.title} - ৳${product.price}`, url: shareUrl }); }} style={{ width: '50px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '10px', cursor: 'pointer', fontSize: '20px' }}>📤</button>
            </div>
          </div>
        </div>

        <ReviewSection productId={product.id} />

        {related.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', marginBottom: '12px' }}>🔗 সম্পর্কিত প্রোডাক্ট</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {related.slice(0, 4).map((r, i) => (
                <div key={i} onClick={() => router.push(`/product/${r.id}`)} style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #eee', transition: 'all 0.2s' }}>
                  <img src={r.webp_url || r.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'} style={{ width: '100%', height: '130px', objectFit: 'cover' }} alt={r.title || ''} />
                  <div style={{ padding: '10px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#333', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#e62e04' }}>৳{(r.price ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ রিভিউ কম্পোনেন্ট ============
function ReviewSection({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ user_name: '', rating: 5, comment: '', image_url: '', webp_url: '' });
  const [uploading, setUploading] = useState(false);

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
    <div style={{ marginTop: '20px', background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a2e', margin: 0 }}>💬 রিভিউ ({reviews.length})</h3>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#1a73e8', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>✍️ রিভিউ লিখুন</button>
      </div>

      {showForm && (
        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
          <input value={reviewForm.user_name} onChange={e => setReviewForm({...reviewForm, user_name: e.target.value})} placeholder="আপনার নাম" style={revInp} />
          <div style={{ display: 'flex', gap: '4px', margin: '10px 0' }}>
            {[1,2,3,4,5].map(s => (
              <span key={s} onClick={() => setReviewForm({...reviewForm, rating: s})} style={{ fontSize: '24px', cursor: 'pointer', opacity: s <= reviewForm.rating ? 1 : 0.3 }}>⭐</span>
            ))}
          </div>
          <textarea value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="আপনার মন্তব্য লিখুন..." style={{...revInp, height: '80px', resize: 'vertical'}} />
          <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleReviewImage(f); }} style={{ marginTop: '8px', fontSize: '12px', display: 'block' }} />
          {uploading && <span style={{ fontSize: '11px', color: '#1a73e8' }}>⏳ আপলোড হচ্ছে...</span>}
          {reviewForm.image_url && <img src={reviewForm.webp_url || reviewForm.image_url} style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '6px', marginTop: '8px' }} />}
          <button onClick={submitReview} style={{ marginTop: '10px', background: '#00a651', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>💾 জমা দিন</button>
        </div>
      )}

      {reviews.map(r => (
        <div key={r.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontWeight: '600', fontSize: '13px' }}>{r.user_name}</span>
            <span style={{ fontSize: '12px', color: '#FFB347' }}>{'⭐'.repeat(r.rating ?? 0)}</span>
          </div>
          <p style={{ fontSize: '13px', color: '#555', margin: '4px 0' }}>{r.comment}</p>
          {r.image_url && <img src={r.webp_url || r.image_url} style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '6px' }} />}
        </div>
      ))}
    </div>
  );
}

const revInp: React.CSSProperties = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', marginBottom: '8px', boxSizing: 'border-box' };