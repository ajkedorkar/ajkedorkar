"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [deliveryCharge, setDeliveryCharge] = useState(60);
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => { loadCart(); }, []);

  async function loadCart() {
    setLoading(true);
    const { data } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('user_id', 'guest')
      .order('created_at', { ascending: false });
    if (data) {
      setCartItems(data);
      setSelectedItems(data.map((item: any) => item.id));
    }
    setLoading(false);
  }

  async function updateQuantity(id: number, qty: number) {
    if (qty < 1) return removeItem(id);
    await supabase.from('cart').update({ quantity: qty }).eq('id', id);
    loadCart();
  }

  async function removeItem(id: number) {
    await supabase.from('cart').delete().eq('id', id);
    setSelectedItems(prev => prev.filter(i => i !== id));
    loadCart();
  }

  function toggleSelect(id: number) {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  }

  function applyCoupon() {
    if (couponCode.toUpperCase() === 'AJKE50') {
      setDiscount(50);
      setPromoApplied(true);
      alert('✅ কুপন applied! ৳৫০ ছাড়!');
    } else if (couponCode.toUpperCase() === 'FREE') {
      setDeliveryCharge(0);
      setPromoApplied(true);
      alert('✅ ফ্রি ডেলিভারি applied!');
    } else {
      alert('❌ ভুল কুপন কোড!');
    }
  }

  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));
  
  const subtotal = selectedCartItems.reduce((sum, item) => {
    return sum + (item.products?.price || 0) * (item.quantity || 1);
  }, 0);

  const total = subtotal - discount + deliveryCharge;
  const totalItems = selectedCartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const isFreeDelivery = subtotal >= 999;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px' }}>🛒</div>
          <p style={{ color: '#999', marginTop: '10px' }}>কার্ট লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif', paddingBottom: '100px' }}>
      
      <header style={{
        background: '#e62e04', padding: '14px 20px', color: 'white',
        display: 'flex', alignItems: 'center', gap: '12px',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => router.back()} style={{
          background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: 0,
        }}>←</button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', flex: 1 }}>🛒 আমার কার্ট</h1>
        {cartItems.length > 0 && (
          <span style={{ fontSize: '13px', opacity: 0.9 }}>{cartItems.length}টি</span>
        )}
      </header>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '80px', marginBottom: '16px' }}>🛒</div>
          <h2 style={{ color: '#333', margin: '0 0 8px 0', fontSize: '20px' }}>আপনার কার্ট খালি!</h2>
          <p style={{ color: '#999', fontSize: '14px', margin: '0 0 24px 0' }}>প্রোডাক্ট যোগ করুন</p>
          <button onClick={() => router.push('/')} style={{
            background: '#e62e04', color: 'white', border: 'none', padding: '14px 40px',
            borderRadius: '30px', fontWeight: '700', fontSize: '16px', cursor: 'pointer',
          }}>🛍️ শপিং শুরু করুন</button>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '15px' }}>
          
          <div style={{
            background: 'white', borderRadius: '10px', padding: '10px 16px',
            marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div onClick={toggleSelectAll} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '4px', border: '2px solid #e62e04',
                background: selectedItems.length === cartItems.length ? '#e62e04' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '12px', fontWeight: '700',
              }}>
                {selectedItems.length === cartItems.length ? '✓' : ''}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#333' }}>
                সব সিলেক্ট ({cartItems.length})
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '8px', marginBottom: '10px' }}>
            {cartItems.map((item: any) => (
              <div key={item.id} style={{
                background: 'white', borderRadius: '10px', padding: '12px',
                display: 'flex', gap: '10px', border: '1px solid #eee',
                opacity: selectedItems.includes(item.id) ? 1 : 0.5,
              }}>
                <div onClick={() => toggleSelect(item.id)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    border: '2px solid #e62e04',
                    background: selectedItems.includes(item.id) ? '#e62e04' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '10px', fontWeight: '700',
                  }}>
                    {selectedItems.includes(item.id) ? '✓' : ''}
                  </div>
                </div>

                <img src={item.products?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} alt="" />

                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: '#333' }}>
                    {item.products?.title}
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#e62e04' }}>
                      ৳{((item.products?.price || 0) * item.quantity).toLocaleString()}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={qtyBtn}>−</button>
                      <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={qtyBtn}>+</button>
                      <button onClick={() => removeItem(item.id)} style={{
                        background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '16px',
                      }}>🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: '10px', padding: '16px', marginBottom: '10px' }}>
            {subtotal < 999 && !promoApplied && (
              <div style={{
                background: '#FFF3E0', padding: '10px', borderRadius: '8px', marginBottom: '12px',
                fontSize: '12px', color: '#E65100',
              }}>
                🚚 আরো ৳{(999 - subtotal).toLocaleString()} যোগ করলে ফ্রি ডেলিভারি!
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                placeholder="কুপন কোড (AJKE50 / FREE)"
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '8px', border: '2px dashed #e62e04',
                  fontSize: '13px', outline: 'none',
                }} />
              <button onClick={applyCoupon} disabled={promoApplied} style={{
                background: promoApplied ? '#ccc' : '#e62e04', color: 'white', border: 'none',
                padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: promoApplied ? 'not-allowed' : 'pointer', fontSize: '13px',
              }}>প্রয়োগ</button>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '10px', padding: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#333', margin: '0 0 12px 0' }}>🧾 বিল সামারি</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              <span>সাবটোটাল ({totalItems}টি)</span>
              <span>৳{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#00a651', marginBottom: '6px' }}>
                <span>কুপন ছাড়</span>
                <span>-৳{discount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666', marginBottom: '6px' }}>
              <span>ডেলিভারি চার্জ</span>
              <span>{deliveryCharge === 0 ? 'ফ্রি' : `৳${deliveryCharge}`}</span>
            </div>
            <div style={{ height: '1px', background: '#eee', margin: '10px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: '#333' }}>
              <span>সর্বমোট</span>
              <span style={{ color: '#e62e04', fontSize: '20px' }}>৳{total.toLocaleString()}</span>
            </div>
          </div>

          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'white', padding: '14px 20px', borderTop: '1px solid #eee',
            display: 'flex', gap: '12px', alignItems: 'center',
          }}>
            <div>
              <span style={{ fontSize: '11px', color: '#999' }}>সর্বমোট</span>
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#e62e04' }}>৳{total.toLocaleString()}</div>
            </div>
            <button 
              onClick={() => {
                if (selectedItems.length === 0) return alert('কমপক্ষে একটি আইটেম সিলেক্ট করুন!');
                alert('💰 পেমেন্ট সিস্টেম শীঘ্রই আসছে!');
              }}
              disabled={selectedItems.length === 0}
              style={{
                flex: 1, padding: '14px',
                background: selectedItems.length === 0 ? '#ccc' : '#e62e04',
                color: 'white', border: 'none', borderRadius: '30px',
                fontWeight: '700', fontSize: '16px', cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer',
              }}>
              অর্ডার কনফার্ম করুন • ৳{total.toLocaleString()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const qtyBtn: React.CSSProperties = {
  width: '26px', height: '26px', borderRadius: '50%',
  border: '1px solid #ddd', background: '#f5f5f5', cursor: 'pointer',
  fontSize: '14px', fontWeight: '600', display: 'flex',
  alignItems: 'center', justifyContent: 'center', color: '#555',
};