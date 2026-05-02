"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  async function send() {
    if (!form.message) return alert('মেসেজ লিখুন!');
    await supabase.from('contacts').insert(form);
    setSent(true);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial' }}>
      <header style={{ background: '#e62e04', padding: '14px 20px', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '18px' }}>📞 যোগাযোগ</h1>
      </header>
      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '12px' }}>
            <span style={{ fontSize: '48px' }}>✅</span>
            <h3>মেসেজ পাঠানো হয়েছে!</h3>
            <p>আমরা শীঘ্রই যোগাযোগ করবো।</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="আপনার নাম" style={inp} />
            <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="ইমেইল" style={inp} />
            <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="আপনার মেসেজ..." style={{...inp, height: '120px'}} />
            <button onClick={send} style={{ padding: '14px', background: '#e62e04', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>📤 পাঠান</button>
          </div>
        )}
      </div>
    </div>
  );
}

const inp: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };