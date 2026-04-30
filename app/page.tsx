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

// বাংলা ক্যাটাগরি 
const leftCategories = [
  { icon: '🎯', label: 'অফার জোন', slug: 'offer-zone' },
  { icon: '📱', label: 'মোবাইল', slug: 'mobile' },
  { icon: '💻', label: 'কম্পিউটার', slug: 'computer' },
  { icon: '⚡', label: 'ইলেকট্রনিক্স', slug: 'electronics' },
  { icon: '👗', label: 'ফ্যাশন', slug: 'fashion' },
  { icon: '🚗', label: 'গাড়ি', slug: 'car' },
  { icon: '💼', label: 'চাকরি', slug: 'job' },
  { icon: '🔧', label: 'সার্ভিস', slug: 'service' },
  { icon: '🏠', label: 'জমি / প্রপার্টি', slug: 'property' },
];

const rightCategories = [
  { icon: '📢', label: 'তথ্য', slug: 'info' },
  { icon: '💑', label: 'পাত্র-পাত্রী', slug: 'matrimony' },
  { icon: '🔑', label: 'ভাড়া / রেন্ট', slug: 'rent' },
  { icon: '🚑', label: 'জরুরি সেবা', slug: 'emergency' },
  { icon: '🐄', label: 'পশু', slug: 'animal' },
  { icon: '🍪', label: 'খাদ্য পণ্য', slug: 'food' },
  { icon: '🛒', label: 'নিত্যপ্রয়োজনীয়', slug: 'daily-needs' },
  { icon: '🎁', label: 'উপহার', slug: 'gifts' },
  { icon: '🔪', label: 'হস্তশিল্প', slug: 'handicraft' },
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
      
      <main className="main-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '15px' }}>
        <div className="hero-section" style={{ display: 'flex', gap: '15px' }}>
          <div className="pc-sidebar-left">
            <SidebarCategories categories={leftCategories} onCategoryClick={handleCategoryClick} />
          </div>
          
          <div className="mobile-banner-fix" style={{ flex: 1, position: 'relative' }}>
            <BannerSection banners={banners} />
          </div>
          
          <div className="pc-sidebar-right">
            <SidebarCategories categories={rightCategories} onCategoryClick={handleCategoryClick} />
          </div>
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
          
          .pc-sidebar-left, .pc-sidebar-right {
            width: 260px;
            flex-shrink: 0;
            display: block !important;
          }
          .mobile-banner-fix {
            max-width: 780px !important;
            margin: 0 auto !important;
          }
        }
        
        @media (max-width: 1023px) {
          main { padding-bottom: 90px; }
          .hero-section { flex-direction: column !important; }
          .pc-sidebar-left, .pc-sidebar-right { display: none !important; }
          
          .mobile-banner-fix { 
            margin-left: -15px !important; 
            margin-right: -15px !important; 
            width: calc(100% + 30px);
            display: block !important;
            overflow: hidden;
            z-index: 1;
          }
        }
      `}</style>
    </div>
  );
}