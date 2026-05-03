"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'ajkedorkar@gmail.com'; // তোর ইমেইল

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Google Login
  async function handleGoogleLogin() {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/admin/callback` },
      });
      if (error) setError('লগইন সমস্যা: ' + error.message);
    } catch (e) {
      setError('নেটওয়ার্ক সমস্যা!');
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
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

        {/* Google Login */}
        <button onClick={handleGoogleLogin} disabled={loading} style={{
          width: '100%', padding: '16px', border: '2px solid #e0e0e0',
          borderRadius: '12px', background: 'white', cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '12px', fontWeight: '600', fontSize: '16px', opacity: loading ? 0.6 : 1,
        }}>
          <span style={{ fontSize: '24px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </span>
          {loading ? '⏳ সংযোগ হচ্ছে...' : 'Google দিয়ে লগইন করুন'}
        </button>

        {/* নোট */}
        <p style={{
          marginTop: '20px', fontSize: '11px', color: '#999',
          background: '#FFF3E0', padding: '10px', borderRadius: '8px',
        }}>
          ⚠️ এই পেজ শুধুমাত্র অ্যাডমিনের জন্য! <br/>
          অননুমোদিত প্রবেশ নিষেধ!
        </p>
      </div>
    </div>
  );
}