"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Barcode from 'react-barcode';

function LabelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!orderId) return;
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (data) setOrder(data);
      setLoading(false);
    }
    load();
  }, [orderId]);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>⏳ লোড হচ্ছে...</div>;
  if (!order) return <div style={{ textAlign: 'center', padding: '40px' }}>❌ অর্ডার পাওয়া যায়নি</div>;

  let items: any[] = [];
  try {
    items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
  } catch { items = []; }

  return (
    <div style={{
      maxWidth: '420px', margin: '0 auto', padding: '18px',
      fontFamily: 'Arial, sans-serif', fontSize: '12px',
      border: '2px dashed #e62e04', borderRadius: '10px',
      background: 'white',
    }}>
      
      {/* লোগো + বারকোড */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #e62e04', paddingBottom: '10px', marginBottom: '10px' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#e62e04' }}>📦 AjkeDorkar</h1>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a2e', marginTop: '4px' }}>
          অর্ডার #{order.id}
        </div>
        
        {/* বারকোড */}
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
          <Barcode value={`ADK-${order.id}`} width={1.5} height={40} fontSize={12} />
        </div>
        <div style={{ fontSize: '9px', color: '#999', marginTop: '2px' }}>
          {new Date(order.created_at).toLocaleDateString('bn-BD')} • {new Date(order.created_at).toLocaleTimeString('bn-BD')}
        </div>
      </div>

      {/* ইউজার ইনফো */}
      <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>👤 {order.user_name || 'অতিথি'}</div>
        <div style={{ color: '#555', marginBottom: '2px', fontSize: '11px' }}>📱 {order.phone}</div>
        <div style={{ color: '#555', fontSize: '11px' }}>📍 {order.address}</div>
      </div>

      {/* পেমেন্ট + স্ট্যাটাস */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '10px' }}>
        <span style={{ background: '#FFF3E0', padding: '3px 8px', borderRadius: '12px', color: '#E65100', fontWeight: '600' }}>
          💰 {order.payment_method === 'cash_on_delivery' ? 'ক্যাশ অন ডেলিভারি' : order.payment_method}
        </span>
        <span style={{
          padding: '3px 8px', borderRadius: '12px', fontWeight: '600',
          background: order.status === 'pending' ? '#FFF3E0' : order.status === 'processing' ? '#e8f0fe' : '#e6f4ea',
          color: order.status === 'pending' ? '#E65100' : order.status === 'processing' ? '#1a73e8' : '#00a651',
        }}>
          {order.status === 'pending' ? '⏳ পেন্ডিং' : order.status === 'processing' ? '🔄 প্রসেসিং' : '✅ ডেলিভার্ড'}
        </span>
      </div>

      {/* আইটেম */}
      <div style={{ borderTop: '1px solid #eee', paddingTop: '8px', marginBottom: '8px' }}>
        <div style={{ fontWeight: '700', marginBottom: '4px', color: '#333', fontSize: '11px' }}>🛍️ আইটেম:</div>
        {items.map((item: any, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: '11px', color: '#555' }}>
            <span>• {item.products?.title || 'প্রোডাক্ট'} x{item.quantity}</span>
            <span style={{ fontWeight: '600', color: '#333' }}>৳{((item.products?.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* টোটাল */}
      <div style={{ borderTop: '2px solid #e62e04', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#333' }}>সর্বমোট</span>
        <span style={{ fontSize: '18px', fontWeight: '800', color: '#e62e04' }}>৳{order.total?.toLocaleString()}</span>
      </div>

      {/* নোট */}
      {order.note && (
        <div style={{ marginTop: '8px', padding: '6px', background: '#FFF8E1', borderRadius: '6px', fontSize: '10px', color: '#E65100' }}>
          📝 {order.note}
        </div>
      )}

      <button onClick={() => window.print()} style={{
        width: '100%', marginTop: '14px', padding: '10px',
        background: '#e62e04', color: 'white', border: 'none',
        borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
      }}>
        🖨️ প্রিন্ট লেবেল
      </button>

      <style jsx>{`
        @media print {
          button { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}

export default function ShippingLabelPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px' }}>⏳ লোড হচ্ছে...</div>}>
      <LabelContent />
    </Suspense>
  );
}