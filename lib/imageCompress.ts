// lib/imageCompress.ts

/**
 * সুপার সনিক ইমেজ কম্প্রেশন ইউটিলিটি
 */

// ক্যাশেড WebP URL
const webpCache = new Map<string, string>();

// প্যারালাল কম্প্রেশন
export async function compressMultipleImages(
  files: File[], 
  maxSizeKB: number = 35
): Promise<Blob[]> {
  return await Promise.all(files.map(file => compressImage(file, maxSizeKB)));
}

// ইমেজ কম্প্রেশন
export async function compressImage(file: File, maxSizeKB: number = 35): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (file.size / 1024 < maxSizeKB && file.type === 'image/webp') {
      resolve(file.slice());
      return;
    }
    
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      
      let width = img.width;
      let height = img.height;
      
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const maxDimension = isMobile ? 400 : 800;
      
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      const findBestQuality = (minQ: number, maxQ: number, targetKB: number): number => {
        let bestQ = minQ;
        for (let i = 0; i < 5; i++) {
          const midQ = (minQ + maxQ) / 2;
          const estimatedSize = (canvas.width * canvas.height * midQ) / 1000;
          if (estimatedSize > targetKB) {
            maxQ = midQ;
          } else {
            minQ = midQ;
            bestQ = midQ;
          }
        }
        return bestQ;
      };
      
      const targetQuality = findBestQuality(0.3, 0.9, maxSizeKB);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) { 
            reject(new Error('Compress failed')); 
            return;
          }
          
          if (blob.size / 1024 > maxSizeKB && targetQuality > 0.2) {
            canvas.toBlob(
              (finalBlob) => finalBlob ? resolve(finalBlob) : reject(new Error('Retry failed')),
              'image/webp',
              targetQuality - 0.2
            );
          } else {
            resolve(blob);
          }
        },
        'image/webp',
        targetQuality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load failed'));
    };
    
    img.src = objectUrl;
  });
}

// ✅ হেল্পার ফাংশন - স্ট্রিং ভ্যালিডেট করার জন্য
function validateUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return null;
  }
  return url;
}

// ✅ WebP URL জেনারেটর
export function getWebPUrl(
  url: string | undefined | null, 
  width: number = 400, 
  height?: number,
  quality: number = 75
): string {
  const validUrl = validateUrl(url);
  if (!validUrl) {
    return '';
  }
  
  const cacheKey = `${validUrl}|${width}|${height}|${quality}`;
  if (webpCache.has(cacheKey)) {
    return webpCache.get(cacheKey)!;
  }
  
  let processedUrl = validUrl;
  
  if (validUrl.includes('supabase.co')) {
    const base = validUrl.split('?')[0];
    const params = new URLSearchParams();
    params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    params.set('format', 'webp');
    params.set('quality', quality.toString());
    processedUrl = `${base}?${params.toString()}`;
  } else if (validUrl.includes('cloudinary.com')) {
    processedUrl = validUrl.replace('/upload/', `/upload/w_${width},q_${quality},f_webp/`);
  } else if (validUrl.includes('imgix.net')) {
    processedUrl = `${validUrl}?w=${width}&q=${quality}&fm=webp`;
  }
  
  webpCache.set(cacheKey, processedUrl);
  
  // ✅ ফিক্সড এরর: undefined চেক যোগ করা হয়েছে
  if (webpCache.size > 100) {
    const firstKey = webpCache.keys().next().value;
    if (firstKey !== undefined) {
      webpCache.delete(firstKey);
    }
  }
  
  return processedUrl;
}

// ✅ রেসপনসিভ srcSet
export function getResponsiveSrcSet(
  url: string | undefined | null, 
  baseWidth: number = 400
): string {
  const validUrl = validateUrl(url);
  if (!validUrl) {
    return '';
  }
  
  const widths = [baseWidth, baseWidth * 2, baseWidth * 3];
  return widths
    .map(w => {
      const webpUrl = getWebPUrl(validUrl, w);
      return `${webpUrl} ${w}w`;
    })
    .join(', ');
}

// ✅ ব্লার ইমেজ URL
const DEFAULT_BLUR = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=';

export function getBlurImageUrl(url: string | undefined | null): string {
  const validUrl = validateUrl(url);
  if (!validUrl) {
    return DEFAULT_BLUR;
  }
  const result = getWebPUrl(validUrl, 20, 20, 20);
  return result || DEFAULT_BLUR;
}

// ফাইল সাইজ ফরমেটিং
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ইমেজ স্ট্যাটস
export async function getImageStats(file: File): Promise<{
  originalSize: string;
  compressedSize?: string;
  compressionRatio?: number;
}> {
  const originalSizeFormatted = formatFileSize(file.size);
  const originalKB = file.size / 1024;
  
  if (file.type.startsWith('image/')) {
    try {
      const compressed = await compressImage(file);
      const compressedKB = compressed.size / 1024;
      return {
        originalSize: originalSizeFormatted,
        compressedSize: formatFileSize(compressed.size),
        compressionRatio: parseFloat((originalKB / compressedKB).toFixed(1))
      };
    } catch (e) {
      return { originalSize: originalSizeFormatted };
    }
  }
  
  return { originalSize: originalSizeFormatted };
}

// ডিফল্ট এক্সপোর্ট
const imageCompressor = {
  compressImage,
  compressMultipleImages,
  getWebPUrl,
  getResponsiveSrcSet,
  getBlurImageUrl,
  formatFileSize,
  getImageStats
};

export default imageCompressor;