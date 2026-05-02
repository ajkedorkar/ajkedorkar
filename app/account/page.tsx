"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // ✅ getSession() ইউজ কর
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/auth/login');
        return;
      }
      const currentUser = sessionData.session.user;
      setUser(currentUser);
      
      // প্রোফাইল লোড বা তৈরি
      let { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
      if (!profileData) {
        await supabase.from('profiles').insert({
          id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || '',
          avatar_url: currentUser.user_metadata?.avatar_url || '',
        });
        profileData = { full_name: currentUser.user_metadata?.full_name || '', avatar_url: currentUser.user_metadata?.avatar_url || '' };
      }
      setProfile(profileData);
      
      const { count } = await supabase.from('orders').select('*', { count: 'exact' }).eq('user_id', currentUser.id);
      setOrdersCount(count || 0);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳</div>;
  if (!user) return null;

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const displayName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'ইউজার';

  const menuItems = [
    { icon: '📦', label: 'আমার অর্ডার', desc: `${ordersCount}টি অর্ডার`, href: '/account/orders', color: '#1a73e8' },
    { icon: '❤️', label: 'উইশলিস্ট', desc: 'পছন্দের আইটেম', href: '/account/wishlist', color: '#e62e04' },
    { icon: '👤', label: 'প্রোফাইল এডিট', desc: 'তথ্য আপডেট', href: '/account/edit', color: '#00a651' },
    { icon: '⚙️', label: 'সেটিংস', desc: 'অ্যাপ সেটিংস', href: '/account/settings', color: '#8B5CF6' },
    { icon: '🔔', label: 'নোটিফিকেশন', desc: 'আপডেট দেখুন', href: '/account/notifications', color: '#FF6B8A' },
    { icon: '📞', label: 'সাহায্য', desc: 'যোগাযোগ করুন', href: '/contact', color: '#06B6D4' },
    { icon: '🚪', label: 'লগআউট', desc: 'সাইন আউট', href: '#logout', color: '#999' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial', paddingBottom: '80px' }}>
      
      <div style={{
        background: 'linear-gradient(135deg, #e62e04, #FF6B35)',
        padding: '30px 20px', color: 'white', textAlign: 'center',
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'white', margin: '0 auto 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '36px', fontWeight: '800', color: '#e62e04',
          overflow: 'hidden', border: '3px solid rgba(255,255,255,0.5)',
        }}>
          {avatarUrl ? (
            <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
          ) : (
            displayName[0]?.toUpperCase() || 'A'
          )}
        </div>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>{displayName}</h1>
        <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>{user.email}</p>
      </div>

      <div style={{ padding: '15px', display: 'grid', gap: '8px' }}>
        {menuItems.map((item, i) => (
          <div key={i}
            onClick={() => item.href === '#logout' ? supabase.auth.signOut().then(() => router.push('/')) : router.push(item.href)}
            style={{
              background: 'white', borderRadius: '12px', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer',
              border: '1px solid #eee',
            }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: item.color + '15', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '20px',
            }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: '#999' }}>{item.desc}</div>
            </div>
            <span style={{ color: '#ccc' }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}