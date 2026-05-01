"use client";

import { useRouter } from 'next/navigation';

export default function OrderSuccessPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f5f5',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: 'Arial',
    }}>
      <div style={{
        textAlign: 'center', background: 'white', padding: '40px 30px',
        borderRadius: '16px', maxWidth: '400px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ color: '#00a651', margin: '0 0 8px 0', fontSize: '22px' }}>অর্ডার সফল!</h1>
        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 20px 0' }}>
          আপনার অর্ডারটি গ্রহণ করা হয়েছে। শীঘ্রই ডেলিভারি দেওয়া হবে।
        </p>
        <button onClick={() => router.push('/')} style={{
          background: '#e62e04', color: 'white', border: 'none',
          padding: '14px 40px', borderRadius: '30px', fontWeight: '700', fontSize: '16px', cursor: 'pointer',
        }}>🛍️ শপিং চালিয়ে যান</button>
      </div>
    </div>
  );
}