"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Order {
  id: number;
  user_name: string;
  phone: string;
  address: string;
  payment_method: string;
  payment_status: string;
  total: number;
  status: string;
  items: any;
  note: string;
  created_at: string;
}

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, delivered: 0, revenue: 0 });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => { loadOrders(); }, [filter, dateRange]);

  async function loadOrders() {
    setLoading(true);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    if (searchTerm) query = query.or(`user_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
    if (dateRange === 'today') {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('created_at', today);
    } else if (dateRange === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      query = query.gte('created_at', weekAgo);
    } else if (dateRange === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      query = query.gte('created_at', monthAgo);
    }
    const { data } = await query.limit(100);
    if (data) setOrders(data);

    const { data: all } = await supabase.from('orders').select('status, total');
    if (all) {
      setStats({
        total: all.length,
        pending: all.filter(o => o.status === 'pending').length,
        processing: all.filter(o => o.status === 'processing').length,
        delivered: all.filter(o => o.status === 'delivered').length,
        revenue: all.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.total || 0), 0),
      });
    }
    setLoading(false);
  }

  async function updateStatus(id: number, status: string) {
    await supabase.from('orders').update({ status, payment_status: status === 'delivered' ? 'paid' : 'pending' }).eq('id', id);
    loadOrders();
    if (selectedOrder?.id === id) setSelectedOrder(null);
  }

  async function bulkUpdateStatus(status: string) {
    if (selectedIds.length === 0) return alert('কোনো অর্ডার সিলেক্ট করা হয়নি!');
    if (!confirm(`${selectedIds.length}টি অর্ডার "${status}" করতে চান?`)) return;
    await supabase.from('orders').update({ status }).in('id', selectedIds);
    setSelectedIds([]);
    loadOrders();
  }

  function toggleSelect(id: number) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  function toggleSelectAll() {
    if (selectedIds.length === orders.length) setSelectedIds([]);
    else setSelectedIds(orders.map(o => o.id));
  }

  const statusColors: Record<string, string> = { pending: '#FFB347', processing: '#1a73e8', delivered: '#00a651', cancelled: '#e62e04' };
  const statusLabels: Record<string, string> = { pending: '⏳ পেন্ডিং', processing: '🔄 প্রসেসিং', delivered: '✅ ডেলিভার্ড', cancelled: '❌ ক্যান্সেল' };
  const paymentLabels: Record<string, string> = { cash_on_delivery: '💵 ক্যাশ', bkash: '📱 bKash', nagad: '📲 Nagad' };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: '#999' }}>⏳ লোড হচ্ছে...</div>;

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
      
      {/* হেডার */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)', padding: '20px 24px',
        borderRadius: '16px', color: 'white', marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', margin: 0, fontWeight: '800' }}>📋 অর্ডার ম্যানেজমেন্ট</h1>
            <p style={{ fontSize: '12px', margin: '4px 0 0', opacity: 0.8 }}>রিয়েল-টাইম অর্ডার ট্র্যাকিং</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
              {viewMode === 'table' ? '🃏 কার্ড' : '📋 টেবিল'}
            </button>
            <button onClick={loadOrders} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>🔄</button>
          </div>
        </div>
      </div>

      {/* স্ট্যাট */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'মোট', value: stats.total, icon: '📦', color: '#1a73e8' },
          { label: 'পেন্ডিং', value: stats.pending, icon: '⏳', color: '#FFB347' },
          { label: 'প্রসেসিং', value: stats.processing, icon: '🔄', color: '#1a73e8' },
          { label: 'ডেলিভার্ড', value: stats.delivered, icon: '✅', color: '#00a651' },
          { label: 'রেভিনিউ', value: '৳' + stats.revenue.toLocaleString(), icon: '💰', color: '#e62e04' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '10px', padding: '14px', textAlign: 'center', border: '1px solid #e8eaed' }}>
            <div style={{ fontSize: '20px' }}>{s.icon}</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#888' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* সার্চ + ফিল্টার + বাল্ক */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadOrders()} placeholder="🔍 নাম বা ফোন দিয়ে সার্চ..." style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', minWidth: '150px' }} />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={sel}>
          <option value="all">সব</option><option value="pending">⏳ পেন্ডিং</option><option value="processing">🔄 প্রসেসিং</option><option value="delivered">✅ ডেলিভার্ড</option><option value="cancelled">❌ ক্যান্সেল</option>
        </select>
        <select value={dateRange} onChange={e => setDateRange(e.target.value as any)} style={sel}>
          <option value="all">📅 সব সময়</option><option value="today">আজ</option><option value="week">৭ দিন</option><option value="month">৩০ দিন</option>
        </select>

        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: '#666' }}>{selectedIds.length}টি সিলেক্ট</span>
            <button onClick={() => bulkUpdateStatus('processing')} style={bulkBtn}>🔄 প্রসেসিং</button>
            <button onClick={() => bulkUpdateStatus('delivered')} style={{...bulkBtn, background: '#00a651'}}>✅ ডেলিভার্ড</button>
          </div>
        )}
      </div>

      {/* অর্ডার লিস্ট */}
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#999' }}>📭 কোনো অর্ডার নেই</div>
      ) : viewMode === 'table' ? (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e8eaed' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 60px 1fr 100px 90px 80px 90px 80px', padding: '12px 16px', background: '#f8f9fa', fontSize: '11px', fontWeight: '700', color: '#666', gap: '8px', alignItems: 'center' }}>
            <span><input type="checkbox" checked={selectedIds.length === orders.length} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} /></span>
            <span>ID</span><span>নাম / ফোন</span><span>মোট</span><span>পেমেন্ট</span><span>স্ট্যাটাস</span><span>তারিখ</span><span>অ্যাকশন</span>
          </div>
          {orders.map(order => (
            <div key={order.id} style={{
              display: 'grid', gridTemplateColumns: '40px 60px 1fr 100px 90px 80px 90px 80px',
              padding: '12px 16px', borderTop: '1px solid #f0f0f0', fontSize: '12px',
              alignItems: 'center', gap: '8px', background: selectedOrder?.id === order.id ? '#fdf2f0' : 'white',
            }}>
              <input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => toggleSelect(order.id)} style={{ cursor: 'pointer' }} />
              <span style={{ fontWeight: '700', color: '#e62e04' }}>#{order.id}</span>
              <div>
                <div style={{ fontWeight: '600', color: '#333' }}>{order.user_name || 'N/A'}</div>
                <div style={{ fontSize: '10px', color: '#999' }}>{order.phone}</div>
              </div>
              <span style={{ fontWeight: '700', color: '#e62e04' }}>৳{order.total?.toLocaleString()}</span>
              <span style={{ fontSize: '10px', color: '#666' }}>{paymentLabels[order.payment_method] || order.payment_method}</span>
              <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '600', background: statusColors[order.status] + '20', color: statusColors[order.status] }}>
                {statusLabels[order.status] || order.status}
              </span>
              <span style={{ fontSize: '10px', color: '#999' }}>{new Date(order.created_at).toLocaleDateString('bn-BD')}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => setSelectedOrder(order)} style={actBtn}>👁️</button>
                <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '10px', cursor: 'pointer' }}>
                  <option value="pending">⏳</option><option value="processing">🔄</option><option value="delivered">✅</option><option value="cancelled">❌</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {orders.map(order => (
            <div key={order.id} onClick={() => setSelectedOrder(order)} style={{
              background: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e8eaed',
              cursor: 'pointer', borderLeft: `4px solid ${statusColors[order.status]}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', color: '#e62e04' }}>#{order.id}</span>
                <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600', background: statusColors[order.status] + '20', color: statusColors[order.status] }}>
                  {statusLabels[order.status]}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>{order.user_name || 'N/A'}</div>
              <div style={{ fontSize: '11px', color: '#999' }}>{order.phone}</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#e62e04', marginTop: '8px' }}>৳{order.total?.toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                {paymentLabels[order.payment_method]} • {new Date(order.created_at).toLocaleDateString('bn-BD')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ডিটেইল মোডাল */}
      {selectedOrder && (
        <div onClick={() => setSelectedOrder(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '14px', padding: '24px', maxWidth: '500px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>📋 অর্ডার #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
              <div><strong>👤</strong> {selectedOrder.user_name}</div>
              <div><strong>📱</strong> {selectedOrder.phone}</div>
              <div><strong>📍</strong> {selectedOrder.address}</div>
              <div><strong>💰</strong> {paymentLabels[selectedOrder.payment_method]}</div>
              <div><strong>📦</strong> <span style={{ color: statusColors[selectedOrder.status], fontWeight: '600' }}>{statusLabels[selectedOrder.status]}</span></div>
              <div><strong>📅</strong> {new Date(selectedOrder.created_at).toLocaleString('bn-BD')}</div>
              <div style={{ height: '1px', background: '#eee' }} />
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#e62e04' }}>মোট: ৳{selectedOrder.total?.toLocaleString()}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              <button onClick={() => updateStatus(selectedOrder.id, 'processing')} style={{ flex: 1, padding: '10px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>🔄 প্রসেসিং</button>
              <button onClick={() => updateStatus(selectedOrder.id, 'delivered')} style={{ flex: 1, padding: '10px', background: '#00a651', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>✅ ডেলিভার্ড</button>
              
              {/* 🖨️ প্রিন্ট শিপিং লেবেল */}
              <button onClick={() => window.open(`/admin/orders/label?id=${selectedOrder.id}`, '_blank')} style={{
                width: '100%', marginTop: '6px', padding: '10px', background: '#1a1a2e', color: 'white', border: 'none',
                borderRadius: '8px', fontWeight: '600', fontSize: '12px', cursor: 'pointer',
              }}>🖨️ প্রিন্ট শিপিং লেবেল</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sel: React.CSSProperties = { padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '12px', cursor: 'pointer' };
const actBtn: React.CSSProperties = { background: '#e8f0fe', color: '#1a73e8', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' };
const bulkBtn: React.CSSProperties = { background: '#1a73e8', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' };