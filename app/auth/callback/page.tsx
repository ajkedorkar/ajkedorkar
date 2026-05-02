"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.push('/');
    });
  }, [router]);

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: '#f5f5f5',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>⏳</div>
        <p style={{ color: '#999', fontSize: '14px' }}>লগইন সম্পন্ন হচ্ছে...</p>
      </div>
    </div>
  );
}