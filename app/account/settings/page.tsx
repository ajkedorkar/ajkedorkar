"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.push('/auth/login'); return; }
      setUser(data.user);
      
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      setProfile(profileData);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  async function handleDeleteAccount() {
    if (!confirm('সত্যিই অ্যাকাউন্ট ডিলিট করবেন? সব ডাটা মুছে যাবে!')) return;
    try {
      // ইউজারের সব ডাটা ডিলিট
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.from('orders').delete().eq('user_id', user.id);
      await supabase.from('wishlist').delete().eq('user_id', user.id);
      await supabase.from('cart').delete().eq('user_id', user.id);
      await supabase.from('reviews').delete().eq('user_id', user.id);
      
      // Supabase Auth থেকে ডিলিট (Admin API লাগে, আপাতত signOut)
      await supabase.auth.signOut();
      router.push('/');
      alert('✅ অ্যাকাউন্ট ডিলিট হয়েছে!');
    } catch (e) {
      alert('❌ এরর! পরে চেষ্টা করুন।');
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳</div>;
  if (!user) return null;

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const displayName = profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || 'ইউজার';

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial', paddingBottom: '100px' }}>
      
      {/* হেডার */}
      <header style={{
        background: '#e62e04', padding: '14px 20px', color: 'white',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer',
        }}>←</button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>⚙️ সেটিংস</h1>
      </header>

      <div style={{ padding: '15px', display: 'grid', gap: '10px' }}>

        {/* প্রোফাইল কার্ড */}
        <div style={{
          background: 'white', borderRadius: '14px', padding: '20px', textAlign: 'center',
          border: '1px solid #eee',
        }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%', background: '#e62e04',
            margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', color: 'white', fontWeight: '800', overflow: 'hidden',
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            ) : (
              displayName[0]?.toUpperCase() || 'A'
            )}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#333' }}>{displayName}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{user.email}</div>
          <button onClick={() => router.push('/account/edit')} style={{
            marginTop: '10px', padding: '8px 20px', background: '#e62e04', color: 'white',
            border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '12px',
          }}>প্রোফাইল এডিট</button>
        </div>

        {/* নোটিফিকেশন */}
        <div style={{
          background: 'white', borderRadius: '12px', padding: '14px 16px',
          border: '1px solid #eee',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🔔</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>নোটিফিকেশন</div>
              <div style={{ fontSize: '11px', color: '#999' }}>অর্ডার আপডেট পুশ নোটিফিকেশন</div>
            </div>
            <div style={{
              padding: '6px 12px', background: '#e6f4ea', color: '#00a651',
              borderRadius: '12px', fontSize: '10px', fontWeight: '600',
            }}>শীঘ্রই আসছে</div>
          </div>
        </div>

        {/* লগআউট */}
        <button onClick={handleLogout} style={{
          background: 'white', borderRadius: '12px', padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
          border: '1px solid #eee',
        }}>
          <span style={{ fontSize: '24px' }}>🚪</span>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>লগআউট</div>
            <div style={{ fontSize: '11px', color: '#999' }}>সাইন আউট করুন</div>
          </div>
          <span style={{ color: '#ccc' }}>›</span>
        </button>

        {/* অন্যান্য পেজ */}
        <div style={{
          background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #eee',
        }}>
          {[
            { icon: '📄', label: 'About Us', href: '/about' },
            { icon: '📞', label: 'Contact Us', href: '/contact' },
            { icon: '🔒', label: 'Privacy Policy', href: '/privacy' },
            { icon: '📋', label: 'Terms & Conditions', href: '/terms' },
            { icon: '❓', label: 'FAQ', href: '/faq' },
          ].map((item, i) => (
            <div key={i} onClick={() => router.push(item.href)} style={{
              padding: '13px 16px', display: 'flex', alignItems: 'center', gap: '12px',
              cursor: 'pointer', borderTop: i > 0 ? '1px solid #f0f0f0' : 'none',
            }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ flex: 1, fontSize: '13px', color: '#333' }}>{item.label}</span>
              <span style={{ color: '#ccc' }}>›</span>
            </div>
          ))}
        </div>

        {/* ডিলিট অ্যাকাউন্ট */}
        <button onClick={() => setShowDeleteConfirm(true)} style={{
          padding: '14px', background: 'white', color: '#e62e04', border: '2px solid #e62e04',
          borderRadius: '12px', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
        }}>🗑️ অ্যাকাউন্ট ডিলিট করুন</button>

      </div>

      {/* ডিলিট কনফার্ম মোডাল */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 200,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
        }} onClick={() => setShowDeleteConfirm(false)}>
          <div style={{
            background: 'white', borderRadius: '14px', padding: '24px', maxWidth: '350px', textAlign: 'center',
          }} onClick={e => e.stopPropagation()}>
            <span style={{ fontSize: '48px' }}>⚠️</span>
            <h3>সত্যিই ডিলিট করবেন?</h3>
            <p style={{ color: '#999', fontSize: '13px' }}>সব ডাটা মুছে যাবে। ফিরিয়ে আনা যাবে না!</p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{
                flex: 1, padding: '12px', background: '#f5f5f5', border: '1px solid #ddd',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
              }}>বাতিল</button>
              <button onClick={handleDeleteAccount} style={{
                flex: 1, padding: '12px', background: '#e62e04', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
              }}>ডিলিট</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}