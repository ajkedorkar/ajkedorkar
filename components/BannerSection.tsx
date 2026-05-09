"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import HeroBanner from './HeroBanner';

const categorySlugMap: Record<string, string> = {
  'অফার জোন': 'offer-zone',
  'ফোন': 'mobile',
  'কম্পিউটার': 'computer',
  'ইলেকট্রনিক্স': 'electronics',
  'ফ্যাশন': 'fashion',
  'গাড়ি': 'car',
  'চাকরি': 'job',
  'সার্ভিস': 'service',
  'জমি প্রপার্টি': 'property',
  'তথ্য': 'info',
  'পাত্রপাত্রী': 'matrimony',
  'ভাড়া রেন্ট': 'rent',
  'জরুরি + মেডিসিন': 'emergency',
  'পশু': 'animal',
  'খাদ্য পণ্য': 'food',
  'কৃষি': 'agriculture',
  'উপহার': 'gifts',
  'হস্তশিল্প': 'handicraft',
  'পুরাতন': 'second-hand',
  'হোম সার্ভিস': 'home-service',
};

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  image_url?: string;
  banner_height?: number;
  show_button?: boolean;
  button_text?: string;
}

interface BannerSectionProps {
  banners: Banner[];
}

export default function BannerSection({ banners }: BannerSectionProps) {
  const router = useRouter();
  const [currentBanner, setCurrentBanner] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 4000);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [banners.length]);

  const handleBannerClick = () => {
    const banner = banners[currentBanner];
    if (!banner) return;
    const slug = categorySlugMap[banner.title] || banner.title.toLowerCase().replace(/\s+/g, '-');
    router.push(`/category/${slug}`);
  };

  // ✅ ব্যানার না থাকলে কিছুই দেখাবে না
  if (banners.length === 0) {
    return null;
  }

  return (
    <div style={{ flex: 1 }}>
      <div style={{ position: 'relative', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer' }} onClick={handleBannerClick}>
        <HeroBanner banners={banners} currentBanner={currentBanner} />
      </div>

      {banners.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '10px 0' }}>
          {banners.map((_, i) => (
            <div 
              key={i} 
              onClick={(e) => {
                e.stopPropagation();
                setCurrentBanner(i);
              }} 
              style={{
                width: i === currentBanner ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === currentBanner ? '#e62e04' : '#ccc',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}