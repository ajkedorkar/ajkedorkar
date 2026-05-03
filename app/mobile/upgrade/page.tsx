"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import PCHeader from '@/components/PCHeader';

const BIKASH_NUMBER = '01XXXXXXXXX'; // তোর বিকাশ নম্বর

export default function UpgradePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingText, setTypingText] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { router.push('/auth/login'); return; }
      setUser(sessionData.session.user);
      const { data: sellerData } = await supabase.from('sellers').select('*').eq('id', sessionData.session.user.id).single();
      if (sellerData) setSeller(sellerData);
      setLoading(false);
    }
    load();
  }, []);

  async function handleUpgrade() {
    if (!transactionId.trim()) return alert('ট্রানজেকশন আইডি দিন!');
    setSubmitting(true);

    await supabase.from('payments').insert({
      user_id: user.id,
      amount: 99,
      payment_method: 'bkash',
      transaction_id: transactionId.trim(),
      status: 'pending',
      payment_type: 'premium_upgrade',
    });

    alert('✅ পেমেন্ট তথ্য জমা হয়েছে! ভেরিফাই করে প্রিমিয়াম অ্যাক্টিভেট করা হবে।');
    router.push('/mobile/upload');
    setSubmitting(false);
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial' }}>
      
      <div className="pc-hdr"><PCHeader typingText={typingText} searchQuery={searchQuery} onSearchChange={setSearchQuery} /></div>
      <button className="mob-back" onClick={() => router.back()}>←</button>

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px 15px' }}>
        
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '48px' }}>👑</div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e', margin: '8px 0 4px' }}>
              প্রিমিয়াম আপগ্রেড
            </h1>
            <p style={{ fontSize: '13px', color: '#888' }}>আনলিমিটেড প্রোডাক্ট আপলোড করুন</p>
          </div>

          {/* প্রাইস কার্ড */}
          <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)',
            borderRadius: '12px', padding: '20px', color: 'white', textAlign: 'center',
            marginBottom: '20px',
          }}>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>মাসিক প্যাকেজ</div>
            <div style={{ fontSize: '36px', fontWeight: '800', margin: '8px 0' }}>৳৯৯</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>প্রতি মাস</div>
          </div>

          {/* ফিচার লিস্ট */}
          <div style={{ marginBottom: '20px' }}>
            {['✅ আনলিমিটেড প্রোডাক্ট আপলোড', '✅ দ্রুত অ্যাপ্রুভাল', '⭐ প্রিমিয়াম সেলার ব্যাজ', '📊 বিশেষ হাইলাইট'].map((f, i) => (
              <div key={i} style={{ fontSize: '13px', color: '#444', padding: '6px 0' }}>{f}</div>
            ))}
          </div>

          {/* বিকাশ পেমেন্ট */}
          <div style={{
            background: '#f8f9fa', borderRadius: '12px', padding: '16px', marginBottom: '16px',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 12px 0', color: '#333' }}>📱 বিকাশে পেমেন্ট করুন</h3>
            
            <div style={{
              background: '#E2136E', color: 'white', borderRadius: '10px', padding: '14px',
              textAlign: 'center', marginBottom: '12px',
            }}>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>বিকাশ নম্বর</div>
              <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '1px' }}>{BIKASH_NUMBER}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Personal • Send Money</div>
            </div>

            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6', marginBottom: '12px' }}>
              ১. উপরের নম্বরে <strong>৳৯৯</strong> সেন্ড মানি করুন<br/>
              ২. নিচে ট্রানজেকশন আইডি দিন<br/>
              ৩. সাবমিট করুন—২৪ ঘন্টার মধ্যে ভেরিফাই হবে
            </div>

            <input
              value={transactionId}
              onChange={e => setTransactionId(e.target.value)}
              placeholder="ট্রানজেকশন আইডি (যেমন: TXN123456)"
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                border: '2px solid #E2136E', fontSize: '13px', outline: 'none',
                boxSizing: 'border-box', textAlign: 'center',
              }}
            />
          </div>

          <button onClick={handleUpgrade} disabled={submitting} style={{
            width: '100%', padding: '14px',
            background: submitting ? '#ccc' : 'linear-gradient(135deg, #E2136E, #FF6B8A)',
            color: 'white', border: 'none', borderRadius: '12px',
            fontWeight: '700', fontSize: '16px', cursor: 'pointer',
          }}>
            {submitting ? '⏳ জমা হচ্ছে...' : '🚀 প্রিমিয়াম আপগ্রেড করুন'}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .pc-hdr { display: none; }
        .mob-back { display: flex; position: fixed; top: 12px; left: 12px; z-index: 100; background: rgba(255,255,255,0.9); border: none; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 18px; align-items: center; justify-content: center; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        @media (min-width: 1024px) {
          .pc-hdr { display: block !important; }
          .mob-back { display: none !important; }
        }
      `}</style>
    </div>
  );
}