"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'ajkedorkar@gmail.com';

const menuItems = [
  { name: 'ড্যাশবোর্ড', icon: '📊', href: '/admin' },
  { name: 'ব্যানার', icon: '🎠', href: '/admin' },
  { name: 'ক্যাটাগরি', icon: '🗂️', href: '/admin/categories' },
  { name: 'প্রোডাক্ট', icon: '📦', href: '/admin/products' },
  { name: 'অর্ডার', icon: '📋', href: '/admin/orders' },
  { name: 'সেটিংস', icon: '⚙️', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState({ banners: 0, categories: 0, products: 0, orders: 0 });

  // লগইন/কলব্যাক পেজ কিনা চেক
  const isAuthPage = pathname === '/admin/login' || pathname === '/admin/callback';

  useEffect(() => {
    // লগইন পেজ হলে auth চেক বাদ
    if (isAuthPage) {
      setAuthorized(true);
      setChecking(false);
      return;
    }

    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/admin/login');
        return;
      }
      if (data.session.user.email !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        router.push('/admin/login');
        return;
      }
      setAuthorized(true);
      setChecking(false);
    }
    checkAuth();
  }, [pathname]);

  useEffect(() => {
    if (!authorized || isAuthPage) return;
    async function loadStats() {
      try {
        const [bannerRes, catRes, productRes, orderRes] = await Promise.all([
          supabase.from('banners').select('*', { count: 'exact', head: true }),
          supabase.from('categories').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
        ]);
        setStats({
          banners: bannerRes.count || 0,
          categories: catRes.count || 0,
          products: productRes.count || 0,
          orders: orderRes.count || 0,
        });
      } catch (e) {}
    }
    loadStats();
  }, [authorized]);

  if (checking) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>⏳ চেক করা হচ্ছে...</div>;
  }

  // 🔥 লগইন/কলব্যাক পেজ — শুধু children, কোনো সাইডবার/টপবার নাই
  if (isAuthPage) {
    return <>{children}</>;
  }

  // 🔥 অথরাইজড না হলে কিছু দেখাবে না
  if (!authorized) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      
      {/* ===== PC সাইডবার ===== */}
      <aside className="admin-sidebar" style={{
        width: '260px', background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
        color: 'white', position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 50, overflowY: 'auto', display: 'none',
      }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/admin" style={{ textDecoration: 'none', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #e62e04, #FFB347)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: '800',
              }}>A</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>AjkeDorkar</h2>
                <p style={{ margin: '2px 0 0', fontSize: '10px', opacity: 0.6 }}>অ্যাডমিন প্যানেল</p>
              </div>
            </div>
          </Link>
        </div>

        <div style={{ padding: '16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#FFB347' }}>{stats.banners}</div>
            <div style={{ fontSize: '9px', opacity: 0.7 }}>ব্যানার</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#4A90D9' }}>{stats.categories}</div>
            <div style={{ fontSize: '9px', opacity: 0.7 }}>ক্যাটাগরি</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#00a651' }}>{stats.products}</div>
            <div style={{ fontSize: '9px', opacity: 0.7 }}>প্রোডাক্ট</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#e62e04' }}>{stats.orders}</div>
            <div style={{ fontSize: '9px', opacity: 0.7 }}>অর্ডার</div>
          </div>
        </div>

        <nav style={{ padding: '12px 0' }}>
          {menuItems.map((item, i) => (
            <Link key={i} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px',
                cursor: 'pointer', color: pathname === item.href ? '#FFB347' : 'rgba(255,255,255,0.7)',
                background: pathname === item.href ? 'rgba(255,179,71,0.1)' : 'transparent',
                borderLeft: pathname === item.href ? '3px solid #FFB347' : '3px solid transparent',
                fontSize: '13px', fontWeight: pathname === item.href ? '600' : '400',
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '16px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div style={{ position: 'absolute', bottom: '20px', left: '16px', right: '16px' }}>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} style={{
            display: 'block', width: '100%', textAlign: 'center', padding: '10px',
            background: '#e62e04', borderRadius: '8px', color: 'white', border: 'none',
            fontSize: '12px', fontWeight: '600', cursor: 'pointer',
          }}>🚪 লগআউট</button>
        </div>
      </aside>

      {/* ===== মোবাইল হেডার ===== */}
      <header className="admin-mobile-header" style={{
        background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)', color: 'white',
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', position: 'sticky', top: 0, zIndex: 40,
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' }}>☰</button>
        <span style={{ fontWeight: '800', fontSize: '15px' }}>🛠️ AjkeDorkar</span>
        <Link href="/" style={{ color: 'white', fontSize: '16px', textDecoration: 'none' }}>🏠</Link>
      </header>

      {/* মোবাইল সাইডবার */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)' }} onClick={() => setSidebarOpen(false)}>
          <div style={{ background: 'linear-gradient(180deg, #0f0f1a, #1a1a2e)', width: '260px', height: '100%', padding: '20px 0', color: 'white' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>🛠️ AjkeDorkar</h2>
            </div>
            {menuItems.map((item, i) => (
              <Link key={i} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
                <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '13px' }}>
                  <span>{item.icon}</span> {item.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ===== মেইন কন্টেন্ট ===== */}
      <div className="admin-main" style={{ flex: 1, marginLeft: '0', minWidth: 0 }}>
        <div style={{ background: 'white', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '12px', color: '#999' }}>Pages /</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginLeft: '4px' }}>
              {menuItems.find(m => m.href === pathname)?.name || 'ড্যাশবোর্ড'}
            </span>
          </div>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} style={{
            background: '#e62e04', color: 'white', border: 'none', padding: '6px 14px',
            borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '11px',
          }}>🚪 লগআউট</button>
        </div>
        <div style={{ padding: '20px 24px' }}>
          {children}
        </div>
      </div>

      <style jsx global>{`
        .admin-mobile-header { display: flex; }
        .admin-sidebar { display: none; }
        @media (min-width: 1024px) {
          .admin-mobile-header { display: none !important; }
          .admin-sidebar { display: block !important; }
          .admin-main { margin-left: 260px !important; }
        }
      `}</style>
    </div>
  );
}