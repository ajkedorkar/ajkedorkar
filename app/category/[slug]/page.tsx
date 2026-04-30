"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// বাংলা ক্যাটাগরি ম্যাপ
const categoryMap: Record<string, { label: string; icon: string }> = {
  'offer-zone': { label: 'অফার জোন', icon: '🎯' },
  'mobile': { label: 'মোবাইল', icon: '📱' },
  'computer': { label: 'কম্পিউটার', icon: '💻' },
  'electronics': { label: 'ইলেকট্রনিক্স', icon: '⚡' },
  'fashion': { label: 'ফ্যাশন', icon: '👗' },
  'car': { label: 'গাড়ি', icon: '🚗' },
  'job': { label: 'চাকরি', icon: '💼' },
  'service': { label: 'সার্ভিস', icon: '🔧' },
  'property': { label: 'জমি / প্রপার্টি', icon: '🏠' },
  'info': { label: 'তথ্য', icon: '📢' },
  'matrimony': { label: 'পাত্র-পাত্রী', icon: '💑' },
  'rent': { label: 'ভাড়া / রেন্ট', icon: '🔑' },
  'emergency': { label: 'জরুরি সেবা', icon: '🚑' },
  'animal': { label: 'পশু', icon: '🐄' },
  'food': { label: 'খাদ্য পণ্য', icon: '🍪' },
  'daily-needs': { label: 'নিত্যপ্রয়োজনীয়', icon: '🛒' },
  'gifts': { label: 'উপহার', icon: '🎁' },
  'handicraft': { label: 'হস্তশিল্প', icon: '🔪' },
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const category = categoryMap[slug] || { label: slug, icon: '🛍️' };

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category', slug)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts([
          { id: 1, title: `${category.label} নমুনা ১`, price: 999, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
          { id: 2, title: `${category.label} নমুনা ২`, price: 1499, image_url: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400' },
          { id: 3, title: `${category.label} নমুনা ৩`, price: 799, image_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400' },
          { id: 4, title: `${category.label} নমুনা ৪`, price: 2499, image_url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400' },
        ]);
      }
      setLoading(false);
    }
    loadProducts();
  }, [slug]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      <header style={{
        background: '#e62e04', padding: '14px 16px', display: 'flex',
        alignItems: 'center', gap: '12px', color: 'white', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: 0,
        }}>←</button>
        <span style={{ fontSize: '28px' }}>{category.icon}</span>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{category.label}</h1>
          <p style={{ margin: 0, fontSize: '11px', opacity: 0.8 }}>{products.length}টি প্রোডাক্ট</p>
        </div>
      </header>

      <div style={{ padding: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>⏳ লোড হচ্ছে...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {products.map((product, i) => (
              <Link key={i} href={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'white', borderRadius: '10px', overflow: 'hidden',
                  cursor: 'pointer', border: '1px solid #eee',
                }}>
                  <img src={product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  <div style={{ padding: '10px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#333', margin: '0 0 4px 0' }}>
                      {product.title || product.name}
                    </p>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#e62e04', margin: 0 }}>
                      ৳{product.price?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}