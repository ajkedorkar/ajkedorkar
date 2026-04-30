"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'কুষ্টিয়া',
    note: '',
    paymentMethod: 'cash_on_delivery',
  });

  useEffect(() => { loadCart(); }, []);

  async function loadCart() {
    setLoading(true);
    const { data } = await supabase
      .from('cart')
      .select('*, products(*)')
      .eq('user_id', 'guest');
    if (data) setCartItems(data);
    setLoading(false);
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * (item.quantity || 1), 0);
  const deliveryCharge = subtotal >= 999 ? 0 : 60;
  const total = subtotal + deliveryCharge;
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  async function placeOrder() {
    if (!form.name || !form.phone || !form.address) {
      return alert('নাম, ফোন ও ঠিকানা আবশ্যক!');
    }
    if (cartItems.length === 0) return alert('কার্ট খালি!');

    setSubmitting(true);

    const orderData = {
      user_name: form.name,
      phone: form.phone,
      address: form.address + ', ' + form.city,
      payment_method: form.paymentMethod,
      payment_status: form.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending',
      total: total,
      items: JSON.stringify(cartItems),
      status: 'pending',
      note: form.note,
    };

    const { error } = await supabase.from('orders').insert(orderData);

    if (!error) {
      await supabase.from('cart').delete().eq('user_id', 'guest');
      
      if (form.paymentMethod === 'bkash') {
        alert('📱 bKash পেমেন্টে রিডাইরেক্ট হচ্ছে...');
        setSubmitting(false);
        return;
      }
      if (form.paymentMethod === 'nagad') {
        alert('📱 Nagad পেমেন্টে রিডাইরেক্ট হচ্ছে...');
        setSubmitting(false);
        return;
      }
      
      alert('✅ অর্ডার সফল হয়েছে! ক্যাশ অন ডেলিভারি!');
      router.push('/order-success');
    } else {
      alert('❌ এরর: ' + error.message);
    }
    setSubmitting(false);
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>⏳ লোড হচ্ছে...</div>;
  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <span style={{ fontSize: '64px' }}>🛒</span>
        <h2>কার্ট খালি!</h2>
        <button onClick={() => router.push('/')} style={btnStyle}>শপিং করুন</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif', paddingBottom: '40px' }}>
      
      {/* হেডার */}
      <header style={{
        background: 'linear-gradient(135deg, #e62e04, #FF6B35)', padding: '14px 20px', color: 'white',
        display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer' }}>←</button>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>🛒 চেকআউট</h1>
      </header>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '15px' }}>
        
        {/* স্টেপ ইন্ডিকেটর */}
        <div style={{
          background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '12px',
          display: 'flex', justifyContent: 'center', gap: '20px',
        }}>
          {['🛒 কার্ট', '📋 তথ্য', '💰 পেমেন্ট'].map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
              color: i <= 1 ? '#e62e04' : '#ccc', fontWeight: i <= 1 ? '700' : '400',
            }}>
              <span style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: i <= 1 ? '#e62e04' : '#eee',
                color: i <= 1 ? 'white' : '#999',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: '700',
              }}>{i <= 1 ? '✓' : i + 1}</span>
              {step}
            </div>
          ))}
        </div>

        {/* শিপিং ফর্ম */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#222', margin: '0 0 16px 0' }}>📋 শিপিং তথ্য</h2>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <label style={lbl}>👤 সম্পূর্ণ নাম *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={inp} placeholder="আপনার নাম" />
            </div>
            <div>
              <label style={lbl}>📱 ফোন নম্বর *</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={inp} placeholder="০১XXXXXXXXX" type="tel" />
            </div>
            <div>
              <label style={lbl}>📍 ঠিকানা *</label>
              <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{...inp, height: '70px', resize: 'vertical'}} placeholder="বিস্তারিত ঠিকানা" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={lbl}>🏙️ শহর</label>
                <select value={form.city} onChange={e => setForm({...form, city: e.target.value})} style={inp}>
                  <option>কুষ্টিয়া</option><option>ঢাকা</option><option>রাজশাহী</option><option>খুলনা</option>
                </select>
              </div>
              <div>
                <label style={lbl}>📝 নোট (অপশনাল)</label>
                <input value={form.note} onChange={e => setForm({...form, note: e.target.value})} style={inp} placeholder="কোনো বিশেষ নির্দেশনা" />
              </div>
            </div>
          </div>
        </div>

        {/* পেমেন্ট মেথড */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#222', margin: '0 0 16px 0' }}>💰 পেমেন্ট মেথড</h2>
          
          <div style={{ display: 'grid', gap: '10px' }}>
            {[
              { id: 'cash_on_delivery', icon: '💵', title: 'ক্যাশ অন ডেলিভারি', desc: 'পণ্য হাতে পেয়ে টাকা দিন', color: '#00a651' },
              { id: 'bkash', icon: '📱', title: 'bKash', desc: 'বিকাশে পেমেন্ট করুন', color: '#E2136E' },
              { id: 'nagad', icon: '📲', title: 'Nagad', desc: 'নগদে পেমেন্ট করুন', color: '#EF4636' },
            ].map(method => (
              <div key={method.id} onClick={() => setForm({...form, paymentMethod: method.id})} style={{
                padding: '14px 16px', borderRadius: '10px', cursor: 'pointer',
                border: form.paymentMethod === method.id ? `2px solid ${method.color}` : '2px solid #eee',
                background: form.paymentMethod === method.id ? `${method.color}08` : 'white',
                display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: method.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                }}>{method.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#333' }}>{method.title}</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>{method.desc}</div>
                </div>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%',
                  border: form.paymentMethod === method.id ? `2px solid ${method.color}` : '2px solid #ddd',
                  background: form.paymentMethod === method.id ? method.color : 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {form.paymentMethod === method.id && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* অর্ডার সামারি */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#222', margin: '0 0 12px 0' }}>📦 অর্ডার সামারি ({totalItems}টি)</h2>
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
            {cartItems.map((item: any) => (
              <div key={item.id} style={{ display: 'flex', gap: '10px', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                <img src={item.products?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'} 
                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} alt="" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#333', margin: '0 0 2px 0' }}>{item.products?.title}</p>
                  <span style={{ fontSize: '11px', color: '#999' }}>x{item.quantity}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#e62e04' }}>
                  ৳{((item.products?.price || 0) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666', marginBottom: '4px' }}>
            <span>সাবটোটাল</span><span>৳{subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666', marginBottom: '4px' }}>
            <span>ডেলিভারি</span>
            <span style={{ color: deliveryCharge === 0 ? '#00a651' : '#666' }}>
              {deliveryCharge === 0 ? 'ফ্রি 🎉' : `৳${deliveryCharge}`}
            </span>
          </div>
          <div style={{ height: '1px', background: '#eee', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700' }}>
            <span>সর্বমোট</span>
            <span style={{ color: '#e62e04', fontSize: '20px' }}>৳{total.toLocaleString()}</span>
          </div>
        </div>

        {/* প্লেস অর্ডার বাটন */}
        <button onClick={placeOrder} disabled={submitting} style={{
          width: '100%', padding: '16px',
          background: submitting ? '#ccc' : 'linear-gradient(135deg, #e62e04, #FF6B35)',
          color: 'white', border: 'none', borderRadius: '12px',
          fontWeight: '700', fontSize: '17px', cursor: submitting ? 'not-allowed' : 'pointer',
          boxShadow: submitting ? 'none' : '0 6px 25px rgba(230,46,4,0.3)',
        }}>
          {submitting ? '⏳ প্রসেসিং...' : `✅ অর্ডার কনফার্ম করুন • ৳${total.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '4px' };
const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px', outline: 'none', boxSizing: 'border-box' };
const btnStyle: React.CSSProperties = { marginTop: '16px', padding: '12px 30px', background: '#e62e04', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };