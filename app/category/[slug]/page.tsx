"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// ক্যাটাগরি লিস্ট ( slug → label + icon )
const categoryMap: Record<string, { label: string; icon: string }> = {
  bags: { label: 'Bags', icon: '👜' },
  shoes: { label: 'Shoes', icon: '👟' },
  jewelry: { label: 'Jewelry', icon: '💍' },
  beauty: { label: 'Beauty', icon: '💄' },
  mens: { label: 'Mens Clothing', icon: '👕' },
  womens: { label: 'Womens Clothing', icon: '👗' },
  baby: { label: 'Baby Items', icon: '👶' },
  sunglass: { label: 'Sunglass', icon: '🕶️' },
  gadget: { label: 'Gadget', icon: '📱' },
  audio: { label: 'Audio', icon: '🎧' },
  watches: { label: 'Watches', icon: '⌚' },
  camera: { label: 'Camera', icon: '📷' },
  laptops: { label: 'Laptops', icon: '💻' },
  gaming: { label: 'Gaming', icon: '🎮' },
  home: { label: 'Home', icon: '🏠' },
  sports: { label: 'Sports', icon: '🚲' },
  health: { label: 'Health', icon: '💊' },
  toys: { label: 'Toys', icon: '🧸' },
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
      
      // Supabase থেকে এই ক্যাটাগরির প্রোডাক্ট
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category', slug)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        setProducts(data);
      } else {
        // ডামি ডাটা
        setProducts([
          { id: 1, title: `${category.label} Sample 1`, price: 999, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
          { id: 2, title: `${category.label} Sample 2`, price: 1499, image_url: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400' },
          { id: 3, title: `${category.label} Sample 3`, price: 799, image_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400' },
          { id: 4, title: `${category.label} Sample 4`, price: 2499, image_url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400' },
        ]);
      }
      setLoading(false);
    }
    loadProducts();
  }, [slug]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', fontFamily: 'Arial, sans-serif' }}>
      
      {/* হেডার */}
      <header style={{
        background: '#e62e04',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: 0,
        }}>
          ←
        </button>
        <span style={{ fontSize: '28px' }}>{category.icon}</span>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{category.label}</h1>
          <p style={{ margin: 0, fontSize: '11px', opacity: 0.8 }}>
            {products.length}টি প্রোডাক্ট পাওয়া গেছে
          </p>
        </div>
      </header>

      {/* প্রোডাক্ট গ্রিড */}
      <div style={{ padding: '12px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>⏳ লোড হচ্ছে...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>📦</span>
            <p>কোনো প্রোডাক্ট পাওয়া যায়নি</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
          }}>
            {products.map((product, i) => (
              <Link 
                key={i} 
                href={`/product/${product.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: 'white',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid #eee',
                  transition: 'transform 0.2s',
                }}>
                  <img 
                    src={product.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'} 
                    alt={product.title || product.name}
                    style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                  />
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

      {/* ফুটার */}
      <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '12px' }}>
        — {category.label} ক্যাটাগরির সব প্রোডাক্ট —
      </div>
    </div>
  );
}