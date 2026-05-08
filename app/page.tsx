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
  { icon: '🎯', label: 'অফার জোন', slug: 'offer-zone' },
  { icon: '📱', label: 'ফোন', slug: 'mobile' },
  { icon: '💻', label: 'কম্পিউটার', slug: 'computer' },
  { icon: '⚡', label: 'ইলেকট্রনিক্স', slug: 'electronics' },
  { icon: '👗', label: 'ফ্যাশন', slug: 'fashion' },
  { icon: '🚗', label: 'গাড়ি', slug: 'car' },
  { icon: '💼', label: 'চাকরি', slug: 'job' },
  { icon: '🔧', label: 'সার্ভিস', slug: 'service' },
  { icon: '🏠', label: 'জমি প্রপার্টি', slug: 'property' },
  { icon: '📢', label: 'তথ্য', slug: 'info' },
];

const rightCategories = [
  { icon: '💑', label: 'পাত্রপাত্রী', slug: 'matrimony' },
  { icon: '🔑', label: 'ভাড়া রেন্ট', slug: 'rent' },
  { icon: '🚑', label: 'জরুরি + মেডিসিন', slug: 'emergency' },
  { icon: '🐄', label: 'পশু', slug: 'animal' },
  { icon: '🍪', label: 'খাদ্য পণ্য', slug: 'food' },
  { icon: '🌾', label: 'কৃষি', slug: 'agriculture' },
  { icon: '🎁', label: 'উপহার', slug: 'gifts' },
  { icon: '🔪', label: 'হস্তশিল্প', slug: 'handicraft' },
  { icon: '🏚️', label: 'পুরাতন', slug: 'second-hand' },
  { icon: '🏠', label: 'হোম সার্ভিস', slug: 'home-service' },
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typingText, setTypingText] = useState('');
  const [banners, setBanners] = useState<any[]>([]);
  const [searchPlaceholders, setSearchPlaceholders] = useState<string[]>([
    "মোবাইল খুঁজুন...",
    "ফ্যাশন খুঁজুন...",
    "ইলেকট্রনিক্স খুঁজুন...",
    "গাড়ি খুঁজুন...",
    "চাকরি খুঁজুন...",
  ]);

  useEffect(() => {
    async function loadPlaceholders() {
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categories').select('name').limit(10),
        supabase.from('products').select('title').limit(10),
      ]);
      
      const items: string[] = [];
      if (catRes.data) catRes.data.forEach((c: any) => items.push(`${c.name} খুঁজুন...`));
      if (prodRes.data) prodRes.data.forEach((p: any) => items.push(`${p.title?.slice(0, 25)}...`));
      
      if (items.length > 0) setSearchPlaceholders(items);
    }
    loadPlaceholders();
  }, []);

  useEffect(() => {
    async function loadBanners() {
      const { data } = await supabase.from('banners').select('*').eq('is_active', true).order('id');
      if (data) setBanners(data);
    }
    loadBanners();
  }, []);

  useEffect(() => {
    let i = 0, isDeleting = false;
    let textIndex = 0;

    const typing = setInterval(() => {
      if (searchPlaceholders.length === 0) {
        setTypingText("Search items...");
        return;
      }
      
      const fullText = searchPlaceholders[textIndex];
      
      if (!isDeleting) {
        if (i < fullText.length) { 
          setTypingText(fullText.slice(0, i + 1)); 
          i++; 
        } else { 
          setTimeout(() => { isDeleting = true; }, 1500);
        }
      } else {
        if (i > 0) { 
          setTypingText(fullText.slice(0, i - 1)); 
          i--; 
        } else { 
          isDeleting = false;
          textIndex = (textIndex + 1) % searchPlaceholders.length;
        }
      }
    }, 60);
    
    return () => clearInterval(typing);
  }, [searchPlaceholders]);

  const handleCategoryClick = (slug: string) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    if (isMobile) {
      router.push(`/category/mobile?theme=${slug}`);
    } else {
      router.push(`/category/${slug}`);
    }
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'Inter, system-ui' }}>
      <PCHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <MobileHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="main-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0' }}>
        <div className="hero-section" style={{ display: 'flex', gap: '0px', alignItems: 'stretch', margin: '0' }}>
          <div className="pc-sidebar-left" style={{ width: '235px', flexShrink: 0 }}>
            <SidebarCategories categories={leftCategories} onCategoryClick={handleCategoryClick} />
          </div>
          
          <div className="mobile-banner-fix" style={{ flex: 1, position: 'relative', margin: '0', padding: '0', minWidth: '0' }}>
            <BannerSection banners={banners} />
          </div>
          
          <div className="pc-sidebar-right" style={{ width: '235px', flexShrink: 0 }}>
            <SidebarCategories categories={rightCategories} onCategoryClick={handleCategoryClick} />
          </div>
        </div>
        
        <div style={{ padding: '0 15px' }}>
          <Categories categories={[...leftCategories, ...rightCategories]} onCategoryClick={handleCategoryClick} />
          <ProductGrid />
        </div>
      </main>
      <MobileNav />

      <style jsx global>{`
        html { scroll-behavior: smooth; overscroll-behavior: contain; }
        .pc-header, .pc-sidebar { display: none; }
        .mobile-header, .mobile-nav, .mobile-categories { display: block; }
        .prod-grid { grid-template-columns: repeat(3, 1fr); }
        .hero-banner { height: 180px !important; }
        
        /* ===== মোবাইল ফিক্স ===== */
        @media (max-width: 1023px) {
          main { padding-bottom: 90px; }
          
          .hero-section { 
            flex-direction: column !important; 
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .pc-sidebar-left, .pc-sidebar-right { 
            display: none !important; 
          }
          
          .mobile-banner-fix { 
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            display: block !important;
            overflow: hidden !important;
            z-index: 1 !important;
          }
          
          .mobile-banner-fix > div {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          
          .mobile-banner-fix .banner-slider {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .mobile-banner-fix .banner-slider .slide {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .mobile-banner-fix .banner-slider img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .hero-banner {
            height: 200px !important;
            width: 100% !important;
            border-radius: 0 !important;
          }
          
          .main-container {
            padding: 0 !important;
          }
        }
        
        /* ===== পিসি ফিক্স (লেফট গ্যাপ একদম 0) ===== */
        @media (min-width: 1024px) {
          .pc-header, .pc-sidebar { display: block !important; }
          .mobile-header, .mobile-nav, .mobile-categories { display: none !important; }
          .prod-grid { grid-template-columns: repeat(6, 1fr) !important; }
          .hero-banner { height: 350px !important; }
          
          /* সাইডবারের সাইজ ঠিক করা */
          .pc-sidebar-left, .pc-sidebar-right {
            width: 235px !important;
            flex-shrink: 0 !important;
            display: block !important;
          }
          
          /* ব্যানার পুরো স্পেস নেবে */
          .mobile-banner-fix {
            flex: 1 !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          
          .mobile-banner-fix > div {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          
          .mobile-banner-fix .banner-slider {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .mobile-banner-fix .banner-slider .slide {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .mobile-banner-fix .banner-slider img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* হিরো সেকশনের সব মার্জিন/প্যাডিং 0 */
          .hero-section {
            margin: 0 !important;
            padding: 0 !important;
            gap: 0 !important;
            display: flex !important;
            align-items: stretch !important;
          }
          
          .main-container {
            padding: 0 !important;
          }
          
          /* সাইডবারের ভেতরের মার্জিন/প্যাডিং 0 */
          .pc-sidebar-left > div, 
          .pc-sidebar-right > div {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .pc-sidebar-left .sidebar-categories,
          .pc-sidebar-right .sidebar-categories {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .pc-sidebar-left ul,
          .pc-sidebar-right ul {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          .pc-sidebar-left li,
          .pc-sidebar-right li {
            padding: 0 !important;
            margin: 0 !important;
          }
          
          /* ব্যানার ও সাইডবারের মধ্যে বর্ডার/গ্যাপ দূর */
          .mobile-banner-fix {
            border-left: none !important;
            border-right: none !important;
          }
          
          /* নিচের গ্যাপ দূর */
          .just-for-you-section {
            padding-top: 5px !important;
            margin-top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}