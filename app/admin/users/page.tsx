"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, today: 0, withOrders: 0, premium: 0 });
  const [userOrders, setUserOrders] = useState<any[]>([]);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    let query = supabase.from('admin_users_view').select('*').order('created_at', { ascending: false }).limit(100);
    if (searchTerm) query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);

    const { data } = await query;
    if (data) setUsers(data);

    // Stats
    const [totalRes, todayRes, premiumRes] = await Promise.all([
      supabase.from('admin_users_view').select('*', { count: 'exact', head: true }),
      supabase.from('admin_users_view').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0]),
      supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('is_premium', true),
    ]);

    setStats({
      total: totalRes.count || 0,
      today: todayRes.count || 0,
      withOrders: 0,
      premium: premiumRes.count || 0,
    });
    setLoading(false);
  }

  async function loadUserOrders(userId: string) {
    const { data } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
    if (data) setUserOrders(data);
  }

  async function viewUser(user: any) {
    setSelectedUser(user);
    loadUserOrders(user.id);
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: '#999' }}>⏳</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* হেডার */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)', padding: '20px 24px',
        borderRadius: '16px', color: 'white', marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', margin: 0, fontWeight: '800' }}>👥 ইউজার ম্যানেজমেন্ট</h1>
            <p style={{ fontSize: '12px', margin: '4px 0 0', opacity: 0.8 }}>সব নিবন্ধিত ইউজার ও তাদের অ্যাক্টিভিটি</p>
          </div>
          <button onClick={loadUsers} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>🔄 রিফ্রেশ</button>
        </div>
      </div>

      {/* স্ট্যাট */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'মোট ইউজার', value: stats.total, icon: '👥', color: '#1a73e8' },
          { label: 'আজ যোগদান', value: stats.today, icon: '🆕', color: '#00a651' },
          { label: 'প্রিমিয়াম', value: stats.premium, icon: '👑', color: '#1a1a2e' },
          { label: 'অর্ডারকারী', value: stats.withOrders, icon: '📦', color: '#FFB347' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '10px', padding: '14px', textAlign: 'center', border: '1px solid #e8eaed' }}>
            <div style={{ fontSize: '20px' }}>{s.icon}</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#888' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* সার্চ + ফিল্টার */}
      <div style={{ background: 'white', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #e8eaed', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadUsers()} placeholder="🔍 নাম বা ইমেইল দিয়ে সার্চ..." style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', minWidth: '150px' }} />
        <button onClick={loadUsers} style={{ background: '#1a73e8', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>🔍</button>
      </div>

      {/* ইউজার লিস্ট */}
      {users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#999' }}>📭 কোনো ইউজার নেই</div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {users.map(user => (
            <div key={user.id} style={{
              background: 'white', borderRadius: '10px', padding: '14px 16px',
              border: '1px solid #e8eaed', display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s',
            }}
              onClick={() => viewUser(user)}
              onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'}
              onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e62e04, #FFB347)',
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '18px',
                }}>
                  {(user.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                    {user.full_name || 'নাম নাই'}
                    {user.is_premium && <span style={{ fontSize: '10px', background: '#1a1a2e', color: '#FFB347', padding: '2px 6px', borderRadius: '8px', marginLeft: '6px' }}>👑 প্রিমিয়াম</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{user.email}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#999' }}>
                  {new Date(user.created_at).toLocaleDateString('bn-BD')}
                </div>
                <span style={{ fontSize: '10px', color: '#1a73e8', fontWeight: '600' }}>বিস্তারিত ›</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ইউজার ডিটেইল মোডাল */}
      {selectedUser && (
        <div onClick={() => { setSelectedUser(null); setUserOrders([]); }} style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: '14px', padding: '24px', maxWidth: '500px', width: '100%', maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>👤 ইউজার ডিটেইল</h2>
              <button onClick={() => { setSelectedUser(null); setUserOrders([]); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #e62e04, #FFB347)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '24px', margin: '0 auto 8px' }}>
                {(selectedUser.full_name || selectedUser.email || 'U')[0].toUpperCase()}
              </div>
              <div style={{ fontWeight: '700', fontSize: '16px' }}>{selectedUser.full_name || 'নাম নাই'}</div>
              <div style={{ color: '#999', fontSize: '13px' }}>{selectedUser.email}</div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                যোগদান: {new Date(selectedUser.created_at).toLocaleString('bn-BD')}
              </div>
            </div>

            {/* ইউজারের অর্ডার */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>📦 অর্ডার ({userOrders.length})</h3>
              {userOrders.length === 0 ? <p style={{ color: '#999', fontSize: '12px' }}>কোনো অর্ডার নেই</p> : (
                userOrders.map(order => (
                  <div key={order.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '12px' }}>#{order.id}</span>
                      <span style={{ fontSize: '11px', color: '#999', marginLeft: '8px' }}>{new Date(order.created_at).toLocaleDateString('bn-BD')}</span>
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#e62e04' }}>৳{order.total?.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}