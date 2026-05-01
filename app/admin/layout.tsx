"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const menuItems = [
  { 
    name: 'ড্যাশবোর্ড', icon: '📊', href: '/admin',
    children: [
      { name: 'ওভারভিউ', href: '/admin' },
      { name: 'অ্যানালিটিক্স', href: '/admin/analytics' },
    ]
  },
  { 
    name: 'ব্যানার', icon: '🎠', href: '/admin',
    children: [
      { name: 'সব ব্যানার', href: '/admin' },
      { name: 'নতুন ব্যানার', href: '/admin#add' },
    ]
  },
  { 
    name: 'ক্যাটাগরি', icon: '🗂️', href: '/admin/categories',
    children: [
      { name: 'সব ক্যাটাগরি', href: '/admin/categories' },
    ]
  },
  { name: 'প্রোডাক্ট', icon: '📦', href: '/admin/products' },
  { name: 'অর্ডার', icon: '📋', href: '/admin/orders' },
  { name: 'ইউজার', icon: '👥', href: '/admin/users' },
  { name: 'সেটিংস', icon: '⚙️', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [stats, setStats] = useState({ banners: 0, categories: 0, products: 0, orders: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const { supabase } = await import('@/lib/supabase');
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
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      
      {/* সাইডবার (PC) */}
      <aside className="admin-sidebar" style={{
        width: '260px',
        background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%)',
        color: 'white',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50, overflowY: 'auto', display: 'none',
      }}>
        {/* লোগো */}
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

        {/* স্ট্যাট কার্ড (৪টা) */}
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

        {/* মেনু */}
        <nav style={{ padding: '12px 0' }}>
          {menuItems.map((item, i) => (
            <div key={i}>
              <div onClick={() => setExpandedMenu(expandedMenu === item.name ? null : item.name)}
                style={{
                  padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px',
                  cursor: 'pointer',
                  color: pathname === item.href ? '#FFB347' : 'rgba(255,255,255,0.7)',
                  background: pathname === item.href ? 'rgba(255,179,71,0.1)' : 'transparent',
                  borderLeft: pathname === item.href ? '3px solid #FFB347' : '3px solid transparent',
                  fontSize: '13px',
                  fontWeight: pathname === item.href ? '600' : '400',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '16px', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.name}</span>
                {item.children && (
                  <span style={{ fontSize: '10px', opacity: 0.5 }}>
                    {expandedMenu === item.name ? '▾' : '▸'}
                  </span>
                )}
              </div>
              
              {item.children && expandedMenu === item.name && (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '4px 0' }}>
                  {item.children.map((child, j) => (
                    <Link key={j} href={child.href} style={{ textDecoration: 'none' }}>
                      <div style={{
                        padding: '7px 20px 7px 54px', fontSize: '12px',
                        color: pathname === child.href ? '#FFB347' : 'rgba(255,255,255,0.5)',
                      }}>
                        {child.name}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div style={{ position: 'absolute', bottom: '20px', left: '16px', right: '16px' }}>
          <Link href="/" target="_blank" style={{
            display: 'block', textAlign: 'center', padding: '10px',
            background: 'linear-gradient(135deg, #e62e04, #FFB347)',
            borderRadius: '8px', color: 'white', textDecoration: 'none',
            fontSize: '12px', fontWeight: '600',
          }}>🏠 সাইট দেখুন</Link>
        </div>
      </aside>

      {/* মোবাইল হেডার */}
      <header className="admin-mobile-header" style={{
        background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)', color: 'white',
        padding: '12px 16px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', position: 'sticky', top: 0, zIndex: 40,
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{
          background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer',
        }}>☰</button>
        <span style={{ fontWeight: '800', fontSize: '15px' }}>🛠️ AjkeDorkar</span>
        <Link href="/" style={{ color: 'white', fontSize: '16px', textDecoration: 'none' }}>🏠</Link>
      </header>

      {/* মোবাইল সাইডবার */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)',
        }} onClick={() => setSidebarOpen(false)}>
          <div style={{
            background: 'linear-gradient(180deg, #0f0f1a, #1a1a2e)',
            width: '260px', height: '100%', padding: '20px 0', color: 'white',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>🛠️ AjkeDorkar</h2>
            </div>
            {menuItems.map((item, i) => (
              <Link key={i} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
                <div style={{
                  padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px',
                  color: pathname === item.href ? '#FFB347' : 'white',
                  fontSize: '13px',
                }}>
                  <span>{item.icon}</span> {item.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* মেইন কন্টেন্ট */}
      <div className="admin-main" style={{ flex: 1, marginLeft: '0', minWidth: 0 }}>
        <div style={{
          background: 'white', padding: '14px 24px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', borderBottom: '1px solid #eee', flexWrap: 'wrap', gap: '10px',
        }}>
          <div>
            <span style={{ fontSize: '12px', color: '#999' }}>Pages /</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', marginLeft: '4px' }}>
              {menuItems.find(m => m.href === pathname)?.name || 'ড্যাশবোর্ড'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '20px', cursor: 'pointer' }}>🔔</span>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #e62e04, #FFB347)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '700', fontSize: '14px',
            }}>A</div>
          </div>
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