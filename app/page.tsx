"use client";

import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { supabase } from '@/lib/supabase';
import PCHeader from '@/components/PCHeader';
import MobileHeader from '@/components/MobileHeader';
import BannerSection from '@/components/BannerSection';
import SidebarCategories from '@/components/SidebarCategories';
import Categories from '@/components/Categories';
import MobileNav from '@/components/MobileNav';

// ✅ Font Optimization
import { Inter } from 'next/font/google';
const inter = Inter({ 
  subsets: ['latin'], 
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Arial', 'sans-serif']
});

// ✅ Lazy Load - ProductGrid
const ProductGrid = lazy(() => import('@/components/ProductGrid'));

// ✅ Loading Skeleton
const ProductGridSkeleton = () => (
  <div className="prod-grid" style={{ display: 'grid', gap: '10px', padding: '10px 0' }}>
    {[...Array(12)].map((_, i) => (
      <div key={i} style={{ 
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '8px',
        height: '200px'
      }} />
    ))}
    <style jsx>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

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

// ✅ Fetcher - সব ব্যানার আসবে
const fetcher = async (key: string) => {
  const { data, error } = await supabase
    .from(key)
    .select('*')
    .eq('is_active', true)
    .order('id');
  
  if (error) throw error;
  return data;
};

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typingText, setTypingText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [searchPlaceholders, setSearchPlaceholders] = useState<string[]>([
    "মোবাইল খুঁজুন...",
    "ফ্যাশন খুঁজুন...",
    "ইলেকট্রনিক্স খুঁজুন...",
    "গাড়ি খুঁজুন...",
    "চাকরি খুঁজুন...",
  ]);

  // ✅ Detect mobile/PC on client side only (hydration mismatch fix)
  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ SWR for Banners
  const { data: banners = [] } = useSWR('banners', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
    refreshInterval: 300000,
  });

  const handleCategoryClick = useCallback((slug: string) => {
    if (isMobile) {
      router.push(`/category/mobile?theme=${slug}`);
    } else {
      router.push(`/category/${slug}`);
    }
  }, [router, isMobile]);

  // Load Placeholders
  useEffect(() => {
    let isMounted = true;
    
    async function loadPlaceholders() {
      try {
        const [catRes, prodRes] = await Promise.all([
          supabase.from('categories').select('name').limit(10),
          supabase.from('products').select('title').limit(10),
        ]);
        
        if (!isMounted) return;
        
        const items: string[] = [];
        if (catRes.data) catRes.data.forEach((c: any) => items.push(`${c.name} খুঁজুন...`));
        if (prodRes.data) prodRes.data.forEach((p: any) => items.push(`${p.title?.slice(0, 25)}...`));
        
        if (items.length > 0) setSearchPlaceholders(items);
      } catch (error) {
        console.error('Error loading placeholders:', error);
      }
    }
    
    loadPlaceholders();
    return () => { isMounted = false; };
  }, []);

  // Typing Effect
  useEffect(() => {
    if (searchPlaceholders.length === 0) return;
    
    let i = 0, isDeleting = false;
    let textIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const typing = setInterval(() => {
      const fullText = searchPlaceholders[textIndex];
      
      if (!isDeleting) {
        if (i < fullText.length) { 
          setTypingText(fullText.slice(0, i + 1)); 
          i++; 
        } else { 
          timeoutId = setTimeout(() => { isDeleting = true; }, 1500);
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
    
    return () => {
      clearInterval(typing);
      clearTimeout(timeoutId);
    };
  }, [searchPlaceholders]);

  const allCategories = useMemo(() => [...leftCategories, ...rightCategories], []);

  return (
    <div className={inter.className} style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <PCHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <MobileHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="main-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0' }}>
        
        {/* ✅ PC Layout - Fixed dimensions prevent refresh collapse */}
        <div className="hero-section" style={{ 
          display: 'flex', 
          gap: '0', 
          alignItems: 'stretch', 
          margin: '0',
          minHeight: '350px',  // Fixed minimum height
          width: '100%'
        }}>
          
          {/* Left Sidebar - PC only */}
          <div className="pc-sidebar-left" style={{ 
            width: '235px', 
            flexShrink: 0, 
            display: 'block',
            background: 'white',
            minHeight: '350px'
          }}>
            <SidebarCategories categories={leftCategories} onCategoryClick={handleCategoryClick} />
          </div>
          
          {/* Banner Section */}
          <div className="mobile-banner-fix" style={{ 
            flex: 1, 
            position: 'relative', 
            margin: '0', 
            padding: '0', 
            minWidth: '0',
            minHeight: '350px',
            background: '#e0e0e0'  // Fallback background while loading
          }}>
            <BannerSection banners={banners} />
          </div>
          
          {/* Right Sidebar - PC only */}
          <div className="pc-sidebar-right" style={{ 
            width: '235px', 
            flexShrink: 0, 
            display: 'block',
            background: 'white',
            minHeight: '350px'
          }}>
            <SidebarCategories categories={rightCategories} onCategoryClick={handleCategoryClick} />
          </div>
        </div>
        
        <div style={{ padding: '0 15px' }}>
          <Categories categories={allCategories} onCategoryClick={handleCategoryClick} />
          
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid />
          </Suspense>
        </div>
      </main>
      
      <MobileNav />

      <style jsx global>{`
        html { 
          scroll-behavior: smooth; 
          overscroll-behavior: contain;
        }
        
        /* ✅ Base responsive styles */
        .pc-sidebar-left, .pc-sidebar-right {
          display: block !important;
        }
        
        .mobile-header, .mobile-nav, .mobile-categories {
          display: none !important;
        }
        
        .prod-grid {
          grid-template-columns: repeat(6, 1fr) !important;
        }
        
        .hero-banner {
          height: 350px !important;
        }
        
        /* ✅ Mobile styles */
        @media (max-width: 1023px) {
          .pc-sidebar-left, .pc-sidebar-right {
            display: none !important;
          }
          
          .mobile-header, .mobile-nav, .mobile-categories {
            display: block !important;
          }
          
          .pc-header {
            display: none !important;
          }
          
          .prod-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          
          .hero-banner {
            height: 180px !important;
          }
          
          .hero-section {
            flex-direction: column !important;
            min-height: auto !important;
          }
          
          .mobile-banner-fix {
            min-height: 180px !important;
          }
          
          main {
            padding-bottom: 90px;
          }
        }
        
        /* ✅ Animation */
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        /* ✅ Ensure smooth rendering */
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}