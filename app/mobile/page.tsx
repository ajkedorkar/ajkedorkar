"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/imageCompress';
import PCHeader from '@/components/PCHeader';
import MobileHeader from '@/components/MobileHeader';

const categories = [
  'offer-zone', 'mobile', 'computer', 'electronics', 'fashion',
  'car', 'job', 'service', 'property', 'info', 'matrimony',
  'rent', 'emergency', 'animal', 'food', 'daily-needs', 'gifts', 'handicraft',
];

export default function UploadPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingText, setTypingText] = useState('');

  const [form, setForm] = useState({
    title: '', price: '', category: 'mobile', description: '',
    phone: '', upload_type: 'free',
    images: [] as string[], webp_images: [] as string[],
  });

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { router.push('/auth/login'); return; }
      setUser(sessionData.session.user);

      const { data: sellerData } = await supabase.from('sellers').select('*').eq('id', sessionData.session.user.id).single();
      if (!sellerData) {
        await supabase.from('sellers').insert({ id: sessionData.session.user.id });
        setSeller({ total_uploads: 0, max_free_uploads: 4, is_premium: false });
      } else {
        setSeller(sellerData);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleImageUpload(file: File, index: number) {
    setUploadProgress(0);
    const compressed = await compressImage(file, 30);
    const fileName = `upload_${Date.now()}_${index}.webp`;
    
    const { data, error } = await supabase.storage.from('banners').upload(fileName, compressed, {
      contentType: 'image/webp', upsert: true,
    });

    if (!error && data) {
      const url = `https://zypshsruibnbefixknxm.supabase.co/storage/v1/object/public/banners/${fileName}`;
      const newImages = [...form.images]; newImages[index] = url;
      const newWebp = [...form.webp_images]; newWebp[index] = url;
      setForm({ ...form, images: newImages, webp_images: newWebp });
    }
    setUploadProgress(100);
  }

  async function handleSubmit() {
    if (!form.title || !form.price || !form.phone) return alert('নাম, প্রাইস ও ফোন আবশ্যক!');
    if (form.images.length === 0) return alert('কমপক্ষে ১টি ইমেজ দিন!');

    if (!seller.is_premium && seller.total_uploads >= 4) {
      return alert('আপনার ফ্রি লিমিট শেষ! প্রিমিয়াম আপগ্রেড করুন।');
    }

    setSubmitting(true);

    const { error } = await supabase.from('products').insert({
      title: form.title,
      price: parseFloat(form.price),
      category: form.category,
      description: form.description,
      image_url: form.images[0],
      webp_url: form.webp_images[0],
      uploaded_by: user.id,
      status: 'pending',
      upload_type: form.upload_type,
      seller_phone: form.phone,
      is_premium: seller.is_premium,
    });

    if (!error) {
      await supabase.from('sellers').update({
        total_uploads: (seller.total_uploads || 0) + 1,
      }).eq('id', user.id);

      alert('✅ প্রোডাক্ট জমা হয়েছে! অ্যাপ্রুভালের পর দেখা যাবে।');
      router.push('/');
    } else {
      alert('❌ এরর: ' + error.message);
    }
    setSubmitting(false);
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳</div>;

  const remainingFree = seller ? Math.max(0, 4 - (seller.total_uploads || 0)) : 4;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial', paddingBottom: '80px' }}>
      
      <div className="pc-hdr"><PCHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} /></div>
      <div className="mob-hdr"><MobileHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} /></div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 15px' }}>
        
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 6px 0' }}>📤 প্রোডাক্ট আপলোড</h1>
          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 20px 0' }}>
            {seller?.is_premium ? '👑 প্রিমিয়াম সেলার - আনলিমিটেড' : `🆓 ফ্রি: ${remainingFree}টি আপলোড বাকি (সর্বোচ্চ ৪টি)`}
          </p>

          <div style={{ display: 'grid', gap: '14px' }}>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="📝 প্রোডাক্টের নাম *" style={inp} />
            <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} type="number" placeholder="💰 প্রাইস *" style={inp} />
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inp}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="📄 বিবরণ" style={{...inp, height: '80px', resize: 'vertical'}} />
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="📱 ফোন নম্বর *" type="tel" style={inp} />

            {/* ইমেজ আপলোড */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '6px', display: 'block' }}>🖼️ ইমেজ (সর্বোচ্চ ৪টা)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{
                    border: '2px dashed #ddd', borderRadius: '10px', height: '100px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', background: '#fafafa', overflow: 'hidden',
                  }}>
                    {form.images[i] ? (
                      <img src={form.webp_images[i] || form.images[i]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    ) : (
                      <label style={{ cursor: 'pointer', textAlign: 'center', padding: '10px' }}>
                        <div style={{ fontSize: '24px' }}>📸</div>
                        <div style={{ fontSize: '10px', color: '#999' }}>ছবি {i + 1}</div>
                        <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, i); }} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitting} style={{
              padding: '14px', background: submitting ? '#ccc' : 'linear-gradient(135deg, #e62e04, #FF6B35)',
              color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px',
              cursor: 'pointer', marginTop: '8px',
            }}>
              {submitting ? '⏳ জমা হচ্ছে...' : '🚀 সাবমিট করুন'}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .pc-hdr { display: none; }
        .mob-hdr { display: block; }
        @media (min-width: 1024px) {
          .pc-hdr { display: block !important; }
          .mob-hdr { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const inp: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };