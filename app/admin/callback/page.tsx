"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'ajkedorkar@gmail.com'; // তোর ইমেইল

export default function AdminCallback() {
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // চেক: তোর ইমেইল কিনা
        if (data.session.user.email === ADMIN_EMAIL) {
          router.push('/admin');
        } else {
          await supabase.auth.signOut();
          alert('❌ আপনি অ্যাডমিন নন!');
          router.push('/admin/login');
        }
      } else {
        router.push('/admin/login');
      }
    }
    check();
  }, []);

  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>⏳ চেক করা হচ্ছে...</div>;
}