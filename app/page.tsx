"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import PCHeader from '@/components/PCHeader';
import MobileHeader from '@/components/MobileHeader';
import HeroBanner from '@/components/HeroBanner';
import SidebarCategories from '@/components/SidebarCategories';
import Categories from '@/components/Categories';
import ProductGrid from '@/components/ProductGrid';
import MobileNav from '@/components/MobileNav';

const leftCategories = [
  { icon: '👜', label: 'Bags' }, { icon: '👟', label: 'Shoes' }, 
  { icon: '💍', label: 'Jewelry' }, { icon: '💄', label: 'Beauty' }, 
  { icon: '👕', label: 'Mens' }, { icon: '👗', label: 'Womens' },
  { icon: '👶', label: 'Baby' }, { icon: '🕶️', label: 'Sunglass' }, 
  { icon: '📱', label: 'Gadget' },
];

const rightCategories = [
  { icon: '🎧', label: 'Audio' }, { icon: '⌚', label: 'Watches' },
  { icon: '📷', label: 'Camera' }, { icon: '💻', label: 'Laptops' },
  { icon: '🎮', label: 'Gaming' }, { icon: '🏠', label: 'Home' },
  { icon: '🚲', label: 'Sports' }, { icon: '💊', label: 'Health' },
  { icon: '🧸', label: 'Toys' },
];

const products = [
  { id: 1, name: 'Casual Comfort Sneakers', price: '1,250', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
  { id: 2, name: 'Premium Leather Handbag', price: '2,800', img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400' },
  { id: 3, name: 'Smart UV Protection Glass', price: '850', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400' },
  { id: 4, name: 'Minimalist Gold Ring', price: '4,500', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400' },
  { id: 5, name: 'Active Wear Sports T-Shirt', price: '650', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
  { id: 6, name: 'Wireless Noise Cancel Bud', price: '1,990', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [banners, setBanners] = useState<any[]>([]);

  // Supabase থেকে ব্যানার লোড
  useEffect(() => {
    async function loadBanners() {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('id');
      if (data && data.length > 0) {
        setBanners(data);
      }
    }
    loadBanners();
  }, []);

  // টাইপিং অ্যানিমেশন
  useEffect(() => {
    let i = 0, isDeleting = false;
    const typing = setInterval(() => {
      if (!isDeleting) {
        if (i < 13) { setTypingText("Search items...".slice(0, i + 1)); i++; }
        else { isDeleting = true; }
      } else {
        if (i > 0) { setTypingText("Search items...".slice(0, i - 1)); i--; }
        else { isDeleting = false; }
      }
    }, 100);
    return () => clearInterval(typing);
  }, []);

  // ব্যানার স্লাইডার
  useEffect(() => {
    if (banners.length === 0) return;
    const slider = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(slider);
  }, [banners]);

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Inter, system-ui' }}>
      <PCHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <MobileHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '15px' }}>
        <div className="hero-section" style={{ display: 'flex', gap: '15px' }}>
          <SidebarCategories categories={leftCategories} />
          
          {/* ব্যানারের জন্য মোবাইল র‍্যাপার */}
          <div className="mobile-banner-wrapper" style={{ flex: 1 }}>
            <HeroBanner banners={banners} currentBanner={currentBanner} />
          </div>
          
          <SidebarCategories categories={rightCategories} />
        </div>
        
        <Categories categories={[...leftCategories, ...rightCategories]} />
        <ProductGrid products={products} />
      </main>

      <MobileNav />

      <style jsx global>{`
        /* ডিফল্ট মোবাইল সেটিংস */
        .pc-header, .pc-sidebar { display: none; }
        .mobile-header, .mobile-nav, .mobile-categories { display: block; }
        .prod-grid { grid-template-columns: repeat(3, 1fr); }
        
        /* শুধুমাত্র মোবাইল (max-width: 1023px) এর জন্য পরিবর্তন */
        @media (max-width: 1023px) {
          main { padding-left: 15px; padding-right: 15px; padding-bottom: 70px; }
          .hero-section { flex-direction: column !important; gap: 0px !important; }
          
          /* ব্যানারকে স্ক্রিনের একদম দুই পাশে লাগানোর ম্যাজিক */
          .mobile-banner-wrapper { 
            margin-left: -15px !important; 
            margin-right: -15px !important; 
            width: calc(100% + 30px);
          }

          .prod-name { font-size: 11px !important; height: 28px !important; }
          .prod-price { font-size: 13px !important; }
          .prod-card img { height: 130px !important; }
          .prod-card:active { transform: scale(0.96); transition: transform 0.1s; }
        }
        
        /* পিসি ভার্সন (আগের মতোই থাকবে) */
        @media (min-width: 1024px) {
          .pc-header { display: block !important; }
          .pc-sidebar { display: block !important; }
          .mobile-header, .mobile-nav, .mobile-categories { display: none !important; }
          .prod-grid { grid-template-columns: repeat(6, 1fr) !important; }
          .cat-item:hover { background: #fdf2f0; color: #e62e04; padding-left: 25px !important; transition: all 0.3s; }
          .prod-card:hover { transform: translateY(-5px); box-shadow: 0 5px 15px rgba(0,0,0,0.1); transition: all 0.3s; }
        }

        .cat-item:hover .cat-icon { display: inline-block; animation: pulse 0.6s infinite alternate; }
        @keyframes pulse { from { transform: scale(1); } to { transform: scale(1.3); } }
      `}</style>
    </div>
  );
}