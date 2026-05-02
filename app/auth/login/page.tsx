"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// Google অরিজিনাল SVG আইকন
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Facebook অরিজিনাল SVG আইকন
const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function LoginPage() {
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  async function handleGoogleLogin() {
    setLoading('google');
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError('Google লগইন সমস্যা: ' + error.message);
    } catch (e: any) {
      setError('নেটওয়ার্ক সমস্যা! আবার চেষ্টা করুন।');
    }
    setLoading('');
  }

  async function handleFacebookLogin() {
    setLoading('facebook');
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError('Facebook লগইন সমস্যা: ' + error.message);
    } catch (e: any) {
      setError('নেটওয়ার্ক সমস্যা! আবার চেষ্টা করুন।');
    }
    setLoading('');
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 50%, #e62e04 150%)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: 'Arial, sans-serif', padding: '20px',
    }}>
      <div style={{
        background: 'white', borderRadius: '24px', padding: '40px 30px',
        maxWidth: '420px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* লোগো */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #e62e04, #FFB347)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '32px', fontWeight: '800', color: 'white',
          }}>A</div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#1a1a2e' }}>AjkeDorkar</h1>
          <p style={{ color: '#888', fontSize: '14px', marginTop: '6px' }}>লগইন করে শপিং শুরু করুন</p>
        </div>

        {error && (
          <div style={{
            background: '#FFF0F0', color: '#e62e04', padding: '12px',
            borderRadius: '10px', fontSize: '13px', marginBottom: '16px', textAlign: 'center',
          }}>{error}</div>
        )}

        {/* Google Button */}
        <button onClick={handleGoogleLogin} disabled={loading !== ''}
          style={{
            width: '100%', padding: '14px', border: '2px solid #e0e0e0',
            borderRadius: '12px', background: 'white', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '12px', fontWeight: '600', fontSize: '15px', marginBottom: '12px',
            opacity: loading && loading !== 'google' ? 0.5 : 1,
          }}>
          {loading === 'google' ? (
            '⏳ সংযোগ হচ্ছে...'
          ) : (
            <><GoogleIcon /> Google দিয়ে চালিয়ে যান</>
          )}
        </button>

        {/* Facebook Button */}
        <button onClick={handleFacebookLogin} disabled={loading !== ''}
          style={{
            width: '100%', padding: '14px', border: 'none',
            borderRadius: '12px', background: '#1877F2', color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '12px', fontWeight: '600', fontSize: '15px',
            opacity: loading && loading !== 'facebook' ? 0.5 : 1,
          }}>
          {loading === 'facebook' ? (
            '⏳ সংযোগ হচ্ছে...'
          ) : (
            <><FacebookIcon /> Facebook দিয়ে চালিয়ে যান</>
          )}
        </button>

        <p style={{
          textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#999',
        }}>
          লগইন করলে আমাদের শর্তাবলী ও প্রাইভেসি পলিসি মেনে নেওয়া হবে
        </p>
      </div>
    </div>
  );
}