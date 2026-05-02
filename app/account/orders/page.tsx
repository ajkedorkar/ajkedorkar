"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { router.push('/auth/login'); return; }
      
      const { data } = await supabase.from('orders').select('*').eq('user_id', userData.user.id).order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const statusLabels: Record<string, string> = {
    pending: '⏳ পেন্ডিং',
    processing: '🔄 প্রসেসিং',
    delivered: '✅ ডেলিভার্ড',
    cancelled: '❌ ক্যান্সেল',
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial' }}>
      <header style={{ background: '#e62e04', padding: '14px 20px', color: 'white', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' }}>←</button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>📦 আমার অর্ডার</h1>
      </header>

      <div style={{ padding: '15px' }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>📭</span>
            কোনো অর্ডার নেই
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} style={{
              background: 'white', borderRadius: '10px', padding: '14px', marginBottom: '10px',
              border: '1px solid #eee',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: '700', color: '#e62e04' }}>অর্ডার #{order.id}</span>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: '#f0f0f0' }}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                <div>💰 ৳{order.total?.toLocaleString()}</div>
                <div>📅 {new Date(order.created_at).toLocaleDateString('bn-BD')}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}