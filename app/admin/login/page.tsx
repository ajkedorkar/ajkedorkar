"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email || !password) return setError('ইমেইল ও পাসওয়ার্ড দিন!');
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('❌ ভুল ইমেইল বা পাসওয়ার্ড!');
    } else {
      router.push('/admin');
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: 'Arial, sans-serif', padding: '20px',
    }}>
      <div style={{
        background: 'white', borderRadius: '24px', padding: '40px 30px',
        maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        textAlign: 'center',
      }}>
        {/* লোগো */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #e62e04, #FFB347)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '32px', fontWeight: '800', color: 'white',
          }}>🛠️</div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#1a1a2e' }}>
            অ্যাডমিন লগইন
          </h1>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '6px' }}>
            শুধুমাত্র অনুমোদিত ব্যক্তির জন্য
          </p>
        </div>

        {/* এরর */}
        {error && (
          <div style={{
            background: '#FFF0F0', color: '#e62e04', padding: '12px',
            borderRadius: '10px', fontSize: '13px', marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* ফর্ম */}
        <div style={{ display: 'grid', gap: '12px' }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="অ্যাডমিন ইমেইল"
            style={inp}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="পাসওয়ার্ড"
            style={inp}
          />

          <button onClick={handleLogin} disabled={loading} style={{
            padding: '14px', background: loading ? '#ccc' : 'linear-gradient(135deg, #e62e04, #FFB347)',
            color: 'white', border: 'none', borderRadius: '10px',
            fontWeight: '700', fontSize: '16px', cursor: 'pointer',
          }}>
            {loading ? '⏳ লগইন হচ্ছে...' : '🔐 লগইন করুন'}
          </button>
        </div>

        {/* সতর্কতা */}
        <div style={{
          marginTop: '20px', padding: '12px', background: '#FFF3E0',
          borderRadius: '8px', fontSize: '10px', color: '#E65100',
        }}>
          ⚠️ অননুমোদিত প্রবেশ নিষেধ!<br/>
          সব লগইন প্রচেষ্টা সংরক্ষণ করা হয়!
        </div>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  width: '100%', padding: '14px', borderRadius: '10px',
  border: '2px solid #e0e0e0', fontSize: '15px', outline: 'none',
  boxSizing: 'border-box', textAlign: 'center',
};