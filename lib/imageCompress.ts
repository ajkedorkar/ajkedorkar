// lib/imageCompress.ts
export async function compressImage(file: File, maxSizeKB: number = 35): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    img.onload = () => {
      // WebP সাপোর্ট চেক
      const useWebP = (canvas as any).toBlob !== undefined;
      
      let width = img.width;
      let height = img.height;
      const maxDimension = 800; // ম্যাক্স ৮০০px
      
      // রিসাইজ
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // কোয়ালিটি খুঁজে বের করা
      const tryCompress = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Compress failed')); return; }
            
            if (blob.size / 1024 > maxSizeKB && quality > 0.1) {
              tryCompress(quality - 0.1);
            } else {
              resolve(blob);
            }
          },
          'image/webp',
          quality
        );
      };
      
      tryCompress(0.8);
    };
    
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });
}

// ইমেজ URL থেকে WebP URL বানানো
export function getWebPUrl(url: string, width: number = 400): string {
  if (!url || !url.includes('supabase.co')) return url;
  const base = url.split('?')[0];
  return `${base}?width=${width}&format=webp&quality=75`;
}