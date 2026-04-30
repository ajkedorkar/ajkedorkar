"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PCHeader from '@/components/PCHeader';
import MobileHeader from '@/components/MobileHeader';
import BannerSection from '@/components/BannerSection';
import SidebarCategories from '@/components/SidebarCategories';
import Categories from '@/components/Categories';
import ProductGrid from '@/components/ProductGrid';
import MobileNav from '@/components/MobileNav';

const leftCategories = [
  { icon: '👜', label: 'Bags', slug: 'bags' }, { icon: '👟', label: 'Shoes', slug: 'shoes' }, 
  { icon: '💍', label: 'Jewelry', slug: 'jewelry' }, { icon: '💄', label: 'Beauty', slug: 'beauty' }, 
  { icon: '👕', label: 'Mens', slug: 'mens' }, { icon: '👗', label: 'Womens', slug: 'womens' },
  { icon: '👶', label: 'Baby', slug: 'baby' }, { icon: '🕶️', label: 'Sunglass', slug: 'sunglass' }, 
  { icon: '📱', label: 'Gadget', slug: 'gadget' },
];

const rightCategories = [
  { icon: '🎧', label: 'Audio', slug: 'audio' }, { icon: '⌚', label: 'Watches', slug: 'watches' },
  { icon: '📷', label: 'Camera', slug: 'camera' }, { icon: '💻', label: 'Laptops', slug: 'laptops' },
  { icon: '🎮', label: 'Gaming', slug: 'gaming' }, { icon: '🏠', label: 'Home', slug: 'home' },
  { icon: '🚲', label: 'Sports', slug: 'sports' }, { icon: '💊', label: 'Health', slug: 'health' },
  { icon: '🧸', label: 'Toys', slug: 'toys' },
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typingText, setTypingText] = useState('');
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    async function loadBanners() {
      const { data } = await supabase.from('banners').select('*').eq('is_active', true).order('id');
      if (data) setBanners(data);
    }
    loadBanners();
  }, []);

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

  const handleCategoryClick = (slug: string) => {
    router.push(`/category/${slug}`);
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Inter, system-ui' }}>
      <PCHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <MobileHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '15px' }}>
        <div className="hero-section" style={{ display: 'flex', gap: '15px' }}>
          <SidebarCategories categories={leftCategories} onCategoryClick={handleCategoryClick} />
          <BannerSection banners={banners} />
          <SidebarCategories categories={rightCategories} onCategoryClick={handleCategoryClick} />
        </div>
        <Categories categories={[...leftCategories, ...rightCategories]} onCategoryClick={handleCategoryClick} />
        <ProductGrid />
      </main>
      <MobileNav />

      <style jsx global>{`
        html { scroll-behavior: smooth; overscroll-behavior: contain; }
        .pc-header, .pc-sidebar { display: none; }
        .mobile-header, .mobile-nav, .mobile-categories { display: block; }
        .prod-grid { grid-template-columns: repeat(3, 1fr); }
        .hero-banner { height: 200px !important; }
        @media (min-width: 1024px) {
          .pc-header, .pc-sidebar { display: block !important; }
          .mobile-header, .mobile-nav, .mobile-categories { display: none !important; }
          .prod-grid { grid-template-columns: repeat(6, 1fr) !important; }
          .hero-banner { height: 350px !important; }
        }
        @media (max-width: 1023px) {
          main { padding-bottom: 70px; }
          .hero-section { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}