"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0, orders: 0, users: 0, revenue: 0,
    pendingProducts: 0, premiumSellers: 0, activeUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [prodRes, orderRes, pendingRes, sellersRes, recentOrd, recentUsr] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('is_premium', true),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('admin_users_view').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      // ইউজার কাউন্ট
      const { count: userCount } = await supabase.from('admin_users_view').select('*', { count: 'exact', head: true });

      setStats({
        products: prodRes.count || 0,
        orders: orderRes.count || 0,
        users: userCount || 0,
        revenue: 0,
        pendingProducts: pendingRes.count || 0,
        premiumSellers: sellersRes.count || 0,
        activeUsers: userCount || 0,
      });
      if (recentOrd.data) setRecentOrders(recentOrd.data);
      if (recentUsr.data) setRecentUsers(recentUsr.data);
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { icon: '📦', label: 'মোট প্রোডাক্ট', value: stats.products, color: '#1a73e8', bg: '#e8f0fe' },
    { icon: '📋', label: 'মোট অর্ডার', value: stats.orders, color: '#00a651', bg: '#e6f4ea' },
    { icon: '👥', label: 'মোট ইউজার', value: stats.users, color: '#8B5CF6', bg: '#f0ebff' },
    { icon: '⏳', label: 'পেন্ডিং', value: stats.pendingProducts, color: '#FFB347', bg: '#FFF3E0' },
    { icon: '👑', label: 'প্রিমিয়াম', value: stats.premiumSellers, color: '#1a1a2e', bg: '#f0f0f0' },
    { icon: '🟢', label: 'অ্যাক্টিভ', value: stats.activeUsers, color: '#e62e04', bg: '#fce8e6' },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: '#999' }}>⏳ লোড হচ্ছে...</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 4px 0' }}>📊 ড্যাশবোর্ড</h1>
        <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>রিয়েল-টাইম বিজনেস ওভারভিউ</p>
      </div>

      {/* স্ট্যাট কার্ড */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {statCards.map((card, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '14px', padding: '20px',
            border: '1px solid #e8eaed', display: 'flex', alignItems: 'center', gap: '14px',
            transition: 'all 0.2s', cursor: 'pointer',
          }}
            onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
            onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{card.icon}</div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: card.color }}>{card.value}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        
        {/* রিসেন্ট অর্ডার */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #e8eaed' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 14px 0' }}>📋 রিসেন্ট অর্ডার</h3>
          {recentOrders.length === 0 ? <p style={{ color: '#999', fontSize: '13px' }}>কোনো অর্ডার নেই</p> : (
            recentOrders.map(order => (
              <div key={order.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{order.user_name || 'অতিথি'}</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>{order.payment_method} • {new Date(order.created_at).toLocaleDateString('bn-BD')}</div>
                </div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#e62e04' }}>৳{order.total?.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>

        {/* রিসেন্ট ইউজার */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #e8eaed' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 14px 0' }}>👥 রিসেন্ট ইউজার</h3>
          {recentUsers.length === 0 ? <p style={{ color: '#999', fontSize: '13px' }}>কোনো ইউজার নেই</p> : (
            recentUsers.map(user => (
              <div key={user.id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', background: '#e62e04',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '14px',
                }}>
                  {(user.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>{user.full_name || 'নাম নাই'}</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>{user.email}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}