"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { compressImage } from '@/lib/imageCompress';
import PCHeader from '@/components/PCHeader';

const categories = [
  { value: 'offer-zone', label: '🎯 অফার জোন' },
  { value: 'mobile', label: '📱 মোবাইল' },
  { value: 'computer', label: '💻 কম্পিউটার' },
  { value: 'electronics', label: '⚡ ইলেকট্রনিক্স' },
  { value: 'fashion', label: '👗 ফ্যাশন' },
  { value: 'car', label: '🚗 গাড়ি' },
  { value: 'job', label: '💼 চাকরি' },
  { value: 'service', label: '🔧 সার্ভিস' },
  { value: 'property', label: '🏠 জমি প্রপার্টি' },
  { value: 'info', label: '📢 তথ্য' },
  { value: 'matrimony', label: '💑 পাত্রপাত্রী' },
  { value: 'rent', label: '🔑 ভাড়া রেন্ট' },
  { value: 'emergency', label: '🚑 জরুরি সেবা' },
  { value: 'animal', label: '🐄 পশু' },
  { value: 'food', label: '🍪 খাদ্য পণ্য' },
  { value: 'agriculture', label: '🌾 কৃষি' },
  { value: 'gifts', label: '🎁 উপহার' },
  { value: 'handicraft', label: '🔪 হস্তশিল্প' },
  { value: 'second-hand', label: '🏚️ পুরাতন' },
  { value: 'home-service', label: '🏠 হোম সার্ভিস' },
];

const guideTexts = [
  "🔥 আজই আপনার প্রোডাক্ট বিক্রি শুরু করুন!",
  "📸 সুন্দর ছবি দিন, বেশি বিক্রি হবে!",
  "⚠️ ৪টার বেশি আপলোড করা যাবে না",
  "💰 প্রতি প্রোডাক্টে মাত্র ৳৫ চার্জ",
  "✅ অ্যাপ্রুভালের পর লাইভ হবে",
];

const warnings = [
  "⚠️ সর্বোচ্চ ৪টি প্রোডাক্ট আপলোড করতে পারবেন (ফ্রি)",
  "💰 প্রতি প্রোডাক্টে ৳৫ সার্ভিস চার্জ প্রযোজ্য",
  "📸 পরিষ্কার ছবি দিন—বেশি বিক্রির জন্য",
  "✅ অ্যাপ্রুভালের ২৪-৪৮ ঘন্টার মধ্যে লাইভ হবে",
  "📱 সঠিক ফোন নম্বর দিন—যোগাযোগের জন্য",
];

export default function UploadPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingText, setTypingText] = useState('');
  const [guideIndex, setGuideIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setGuideIndex(prev => (prev + 1) % guideTexts.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  async function handleImageUpload(file: File, index: number) {
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
  }

  function removeImage(index: number) {
    const newImages = [...form.images]; newImages[index] = '';
    const newWebp = [...form.webp_images]; newWebp[index] = '';
    setForm({ ...form, images: newImages, webp_images: newWebp });
  }

  async function handleSubmit() {
    if (!form.title || !form.price || !form.phone) return alert('নাম, প্রাইস ও ফোন আবশ্যক!');
    if (form.images.filter(Boolean).length === 0) return alert('কমপক্ষে ১টি ইমেজ দিন!');
    if (!seller.is_premium && (seller.total_uploads || 0) >= 4) {
      return alert('❌ আপনার ফ্রি লিমিট শেষ! নিচে প্রিমিয়াম আপগ্রেড করুন।');
    }
    setSubmitting(true);
    const { error } = await supabase.from('products').insert({
      title: form.title, price: parseFloat(form.price), category: form.category,
      description: form.description, image_url: form.images.find(Boolean) || '',
      webp_url: form.webp_images.find(Boolean) || '', uploaded_by: user.id,
      status: 'pending', upload_type: form.upload_type, seller_phone: form.phone,
      is_premium: seller.is_premium,
    });
    if (!error) {
      await supabase.from('sellers').update({ total_uploads: (seller.total_uploads || 0) + 1 }).eq('id', user.id);
      alert('✅ প্রোডাক্ট জমা হয়েছে! অ্যাপ্রুভালের পর দেখা যাবে।');
      router.push('/');
    } else { alert('❌ এরর: ' + error.message); }
    setSubmitting(false);
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳</div>;

  const remainingFree = seller ? Math.max(0, 4 - (seller.total_uploads || 0)) : 4;
  const uploadedCount = form.images.filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial', paddingBottom: '80px' }}>
      <div className="pc-hdr"><PCHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} /></div>
      <button className="mob-back" onClick={() => router.back()}>←</button>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '15px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '4px' }}>📤</div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 4px 0' }}>প্রোডাক্ট আপলোড করুন</h1>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
              {seller?.is_premium ? '👑 প্রিমিয়াম সেলার - আনলিমিটেড' : `🆓 ফ্রি: ${remainingFree}টি বাকি`}
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)', borderRadius: '10px',
            padding: '10px 14px', marginBottom: '16px', textAlign: 'center',
            fontSize: '13px', fontWeight: '600', color: '#E65100', minHeight: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              transition: 'all 0.3s ease', opacity: isAnimating ? 0 : 1,
              transform: isAnimating ? 'translateY(-8px)' : 'translateY(0)',
            }}>{guideTexts[guideIndex]}</span>
          </div>

          <div style={{
            background: '#FFF8E1', borderRadius: '10px', padding: '12px 14px',
            marginBottom: '16px', fontSize: '11px', color: '#F57F17',
          }}>
            {warnings.map((w, i) => <div key={i} style={{ marginBottom: i < warnings.length - 1 ? '4px' : 0 }}>{w}</div>)}
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={lbl}>📝 প্রোডাক্টের নাম *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="যেমন: তিলের খাজা" style={inp} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={lbl}>💰 প্রাইস (৳) *</label>
                <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} type="number" placeholder="২০০" style={inp} />
              </div>
              <div>
                <label style={lbl}>📱 ফোন নম্বর *</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="০১XXXXXXXXX" type="tel" style={inp} />
              </div>
            </div>
            <div>
              <label style={lbl}>📂 ক্যাটাগরি *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={inp}>
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>📄 বিবরণ</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} 
                placeholder="প্রোডাক্টের বিস্তারিত লিখুন..." style={{...inp, height: '80px', resize: 'vertical'}} />
            </div>

            <div>
              <label style={lbl}>🖼️ ইমেজ ({uploadedCount}/৪) ✕ দিয়ে রিমুভ করতে পারবেন</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{
                    border: '2px dashed #ddd', borderRadius: '10px', height: '110px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#fafafa', overflow: 'hidden', position: 'relative',
                  }}>
                    {form.images[i] ? (
                      <>
                        <img src={form.webp_images[i] || form.images[i]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        <button onClick={() => removeImage(i)} style={{
                          position: 'absolute', top: '4px', right: '4px', background: '#e62e04', color: 'white',
                          border: 'none', borderRadius: '50%', width: '22px', height: '22px',
                          cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>✕</button>
                      </>
                    ) : (
                      <label style={{ cursor: 'pointer', textAlign: 'center', padding: '10px', width: '100%' }}>
                        <div style={{ fontSize: '28px' }}>📸</div>
                        <div style={{ fontSize: '10px', color: '#999' }}>ছবি {i + 1}</div>
                        <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, i); }} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 🔥 প্রিমিয়াম আপগ্রেড বাটন */}
            {!seller?.is_premium && remainingFree === 0 && (
              <button onClick={() => router.push('/mobile/upgrade')} style={{
                width: '100%', padding: '12px', background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)',
                color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer',
                fontSize: '14px',
              }}>
                👑 প্রিমিয়াম আপগ্রেড (৳৯৯/মাস) — আনলিমিটেড আপলোড
              </button>
            )}

            <button onClick={handleSubmit} disabled={submitting} style={{
              padding: '14px', marginTop: '8px',
              background: submitting ? '#ccc' : 'linear-gradient(135deg, #e62e04, #FF6B35)',
              color: 'white', border: 'none', borderRadius: '12px',
              fontWeight: '700', fontSize: '16px', cursor: 'pointer',
              boxShadow: submitting ? 'none' : '0 4px 15px rgba(230,46,4,0.3)',
            }}>
              {submitting ? '⏳ জমা হচ্ছে...' : `🚀 সাবমিট করুন${seller?.is_premium ? '' : ' (৳৫ চার্জ)'}`}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .pc-hdr { display: none; }
        .mob-back { display: flex; position: fixed; top: 12px; left: 12px; z-index: 100; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 18px; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        @media (min-width: 1024px) { .pc-hdr { display: block !important; } .mob-back { display: none !important; } }
      `}</style>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '4px' };
const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };