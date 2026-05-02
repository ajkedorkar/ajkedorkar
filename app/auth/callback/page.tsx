"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data?.session) {
        // প্রোফাইল চেক বা তৈরি
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (!profile) {
          await supabase.from('profiles').insert({
            id: data.session.user.id,
            full_name: data.session.user.user_metadata?.full_name || data.session.user.user_metadata?.name || '',
            avatar_url: data.session.user.user_metadata?.avatar_url || '',
          });
        }
        
        router.push('/');
      } else {
        router.push('/auth/login');
      }
    };
    
    handleCallback();
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