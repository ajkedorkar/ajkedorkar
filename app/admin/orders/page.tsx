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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, delivered: 0 });

  useEffect(() => { loadOrders(); }, [filter]);

  async function loadOrders() {
    setLoading(true);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data, count } = await query;
    if (data) setOrders(data);
    
    // স্ট্যাট
    const { data: all } = await supabase.from('orders').select('status');
    if (all) {
      setStats({
        total: all.length,
        pending: all.filter(o => o.status === 'pending').length,
        processing: all.filter(o => o.status === 'processing').length,
        delivered: all.filter(o => o.status === 'delivered').length,
      });
    }
    setLoading(false);
  }

  async function updateStatus(id: number, status: string) {
    await supabase.from('orders').update({ 
      status,
      payment_status: status === 'delivered' ? 'paid' : 'pending'
    }).eq('id', id);
    loadOrders();
    setSelectedOrder(null);
    alert(`✅ অর্ডার #${id} → "${status}" আপডেট হয়েছে!`);
  }

  async function deleteOrder(id: number) {
    if (!confirm('অর্ডার ডিলিট করবেন?')) return;
    await supabase.from('orders').delete().eq('id', id);
    loadOrders();
  }

  const statusColors: Record<string, string> = {
    pending: '#FFB347',
    processing: '#1a73e8',
    delivered: '#00a651',
    cancelled: '#e62e04',
  };

  const statusLabels: Record<string, string> = {
    pending: '⏳ পেন্ডিং',
    processing: '🔄 প্রসেসিং',
    delivered: '✅ ডেলিভার্ড',
    cancelled: '❌ ক্যান্সেল',
  };

  const paymentLabels: Record<string, string> = {
    cash_on_delivery: '💵 ক্যাশ',
    bkash: '📱 bKash',
    nagad: '📲 Nagad',
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: '#999' }}>⏳ লোড হচ্ছে...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* হেডার + স্ট্যাট */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
        background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)',
        padding: '20px 24px', borderRadius: '16px', color: 'white',
      }}>
        <div>
          <h1 style={{ fontSize: '24px', margin: 0, fontWeight: '800' }}>📋 অর্ডার ম্যানেজমেন্ট</h1>
          <p style={{ fontSize: '12px', margin: '4px 0 0', opacity: 0.8 }}>
            সব অর্ডার দেখুন ও ম্যানেজ করুন
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={loadOrders} style={{
            background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)',
            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
          }}>🔄 রিফ্রেশ</button>
        </div>
      </div>

      {/* স্ট্যাট কার্ড */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'মোট অর্ডার', value: stats.total, color: '#1a73e8', icon: '📦' },
          { label: 'পেন্ডিং', value: stats.pending, color: '#FFB347', icon: '⏳' },
          { label: 'প্রসেসিং', value: stats.processing, color: '#1a73e8', icon: '🔄' },
          { label: 'ডেলিভার্ড', value: stats.delivered, color: '#00a651', icon: '✅' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: '10px', padding: '16px', textAlign: 'center',
            border: '1px solid #e8eaed',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>{stat.icon}</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ফিল্টার */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'processing', 'delivered', 'cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
            background: filter === f ? '#e62e04' : '#f5f5f5',
            color: filter === f ? 'white' : '#666',
            border: 'none',
          }}>{f === 'all' ? 'সব' : statusLabels[f]?.replace(/[^\u0980-\u09FF\s]/g, '').trim() || f}</button>
        ))}
      </div>

      {/* অর্ডার টেবিল */}
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#999' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>📭</span>
          কোনো অর্ডার নেই
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e8eaed' }}>
          {/* টেবিল হেডার */}
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 1fr 100px 90px 80px 90px 80px',
            padding: '12px 16px', background: '#f8f9fa', fontSize: '11px', fontWeight: '700',
            color: '#666', gap: '8px',
          }}>
            <span>ID</span><span>নাম / ফোন</span><span>মোট</span><span>পেমেন্ট</span><span>স্ট্যাটাস</span><span>তারিখ</span><span>অ্যাকশন</span>
          </div>

          {orders.map(order => (
            <div key={order.id} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 100px 90px 80px 90px 80px',
              padding: '14px 16px', borderTop: '1px solid #f0f0f0', fontSize: '12px',
              alignItems: 'center', gap: '8px', background: selectedOrder?.id === order.id ? '#fdf2f0' : 'white',
            }}>
              <span style={{ fontWeight: '700', color: '#e62e04' }}>#{order.id}</span>
              <div>
                <div style={{ fontWeight: '600', color: '#333' }}>{order.user_name}</div>
                <div style={{ fontSize: '10px', color: '#999' }}>{order.phone}</div>
              </div>
              <span style={{ fontWeight: '700', color: '#e62e04' }}>৳{order.total?.toLocaleString()}</span>
              <span style={{ fontSize: '10px', color: '#666' }}>
                {paymentLabels[order.payment_method] || order.payment_method}
              </span>
              <span style={{
                padding: '3px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: '600',
                background: statusColors[order.status] + '20', color: statusColors[order.status],
              }}>{statusLabels[order.status] || order.status}</span>
              <span style={{ fontSize: '10px', color: '#999' }}>
                {new Date(order.created_at).toLocaleDateString('bn-BD')}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)} style={{
                  background: '#e8f0fe', color: '#1a73e8', border: 'none',
                  padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px',
                }}>👁️</button>
                <select 
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                  style={{
                    padding: '4px 6px', borderRadius: '4px', border: '1px solid #ddd',
                    fontSize: '10px', cursor: 'pointer', background: 'white',
                  }}
                >
                  <option value="pending">⏳ পেন্ডিং</option>
                  <option value="processing">🔄 প্রসেসিং</option>
                  <option value="delivered">✅ ডেলিভার্ড</option>
                  <option value="cancelled">❌ ক্যান্সেল</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* অর্ডার ডিটেইল মোডাল */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 200,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px',
        }} onClick={() => setSelectedOrder(null)}>
          <div style={{
            background: 'white', borderRadius: '14px', padding: '24px', maxWidth: '500px',
            width: '100%', maxHeight: '80vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '18px' }}>📋 অর্ডার #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gap: '10px', fontSize: '13px' }}>
              <div><strong>👤 গ্রাহক:</strong> {selectedOrder.user_name}</div>
              <div><strong>📱 ফোন:</strong> {selectedOrder.phone}</div>
              <div><strong>📍 ঠিকানা:</strong> {selectedOrder.address}</div>
              <div><strong>💰 পেমেন্ট:</strong> {paymentLabels[selectedOrder.payment_method]}</div>
              <div><strong>📦 স্ট্যাটাস:</strong> 
                <span style={{ color: statusColors[selectedOrder.status], marginLeft: '6px', fontWeight: '600' }}>
                  {statusLabels[selectedOrder.status]}
                </span>
              </div>
              <div><strong>📝 নোট:</strong> {selectedOrder.note || 'নাই'}</div>
              <div><strong>📅 তারিখ:</strong> {new Date(selectedOrder.created_at).toLocaleString('bn-BD')}</div>

              {/* আইটেম */}
              <div style={{ marginTop: '8px' }}>
                <strong>🛍️ আইটেম:</strong>
                {(() => {
                  try {
                    const items = typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items;
                    if (Array.isArray(items)) {
                      return items.map((item: any, i: number) => (
                        <div key={i} style={{ marginTop: '4px', fontSize: '11px', color: '#666' }}>
                          • {item.products?.title || 'প্রোডাক্ট'} x{item.quantity} = ৳{((item.products?.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </div>
                      ));
                    }
                    return <span style={{ color: '#999' }}>বিস্তারিত নাই</span>;
                  } catch { return <span style={{ color: '#999' }}>বিস্তারিত নাই</span>; }
                })()}
              </div>

              <div style={{ height: '1px', background: '#eee', margin: '8px 0' }} />
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#e62e04' }}>
                মোট: ৳{selectedOrder.total?.toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => updateStatus(selectedOrder.id, 'processing')} style={{
                flex: 1, padding: '10px', background: '#1a73e8', color: 'white', border: 'none',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px',
              }}>🔄 প্রসেসিং</button>
              <button onClick={() => updateStatus(selectedOrder.id, 'delivered')} style={{
                flex: 1, padding: '10px', background: '#00a651', color: 'white', border: 'none',
                borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px',
              }}>✅ ডেলিভার্ড</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}