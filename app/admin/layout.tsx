"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const menuItems = [
  { name: 'ব্যানার', icon: '🎠', href: '/admin' },
  { name: 'ক্যাটাগরি', icon: '🗂️', href: '/admin/categories' },
  { name: 'প্রোডাক্ট', icon: '📦', href: '/admin/products' },
  { name: 'অর্ডার', icon: '📋', href: '/admin/orders' },
  { name: 'সেটিংস', icon: '⚙️', href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      
      {/* ===== সাইডবার (PC) ===== */}
      <aside style={{
        width: '250px',
        background: '#1a1a2e',
        color: 'white',
        padding: '20px 0',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        display: 'none',
      }} className="admin-sidebar">
        {/* লোগো */}
        <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px' }}>
          <Link href="/admin" style={{ textDecoration: 'none', color: 'white' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>
              🛠️ AjkeDorkar
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '11px', opacity: 0.7 }}>অ্যাডমিন প্যানেল</p>
          </Link>
        </div>

        {/* মেনু */}
        <nav>
          {menuItems.map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                background: pathname === item.href ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderLeft: pathname === item.href ? '3px solid #FFB347' : '3px solid transparent',
                color: pathname === item.href ? '#FFB347' : 'rgba(255,255,255,0.8)',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: pathname === item.href ? '600' : '400',
              }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {item.name}
              </div>
            </Link>
          ))}
        </nav>

        {/* ফুটার */}
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
          <Link href="/" style={{
            display: 'block', textAlign: 'center', padding: '10px',
            background: 'rgba(255,255,255,0.1)', borderRadius: '8px',
            color: 'white', textDecoration: 'none', fontSize: '13px',
          }}>
            🏠 সাইট দেখুন
          </Link>
        </div>
      </aside>

      {/* ===== মোবাইল হেডার ===== */}
      <header className="admin-mobile-header" style={{
        background: '#1a1a2e', color: 'white', padding: '12px 16px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer',
        }}>☰</button>
        <span style={{ fontWeight: '800', fontSize: '16px' }}>🛠️ AjkeDorkar</span>
        <Link href="/" style={{ color: 'white', fontSize: '18px', textDecoration: 'none' }}>🏠</Link>
      </header>

      {/* ===== মোবাইল সাইডবার (ড্রয়ার) ===== */}
      {sidebarOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)',
        }} onClick={() => setSidebarOpen(false)}>
          <div style={{
            background: '#1a1a2e', width: '250px', height: '100%', padding: '20px 0',
            color: 'white',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '0 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>🛠️ AjkeDorkar</h2>
            </div>
            {menuItems.map(item => (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
                <div style={{
                  padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px',
                  color: pathname === item.href ? '#FFB347' : 'white',
                  background: pathname === item.href ? 'rgba(255,255,255,0.1)' : 'transparent',
                }}>
                  <span>{item.icon}</span> {item.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ===== মেইন কন্টেন্ট ===== */}
      <div style={{ flex: 1, marginLeft: '0', padding: '0', minWidth: 0 }} className="admin-main">
        {children}
      </div>

      <style jsx global>{`
        .admin-mobile-header { display: flex; }
        .admin-sidebar { display: none; }
        
        @media (min-width: 1024px) {
          .admin-mobile-header { display: none !important; }
          .admin-sidebar { display: block !important; }
          .admin-main { margin-left: 250px !important; }
        }
      `}</style>
    </div>
  );
}