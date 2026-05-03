"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState({ adminEmail: 'ajkedorkar@gmail.com', siteName: 'AjkeDorkar', currency: '৳' });
  const [saved, setSaved] = useState(false);

  async function saveSettings() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 4px 0' }}>⚙️ সেটিংস</h1>
        <p style={{ fontSize: '13px', color: '#888' }}>সাইট কনফিগারেশন</p>
      </div>

      <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e8eaed', display: 'grid', gap: '14px' }}>
        <div><label style={lbl}>📧 অ্যাডমিন ইমেইল</label><input value={form.adminEmail} onChange={e => setForm({...form, adminEmail: e.target.value})} style={inp} /></div>
        <div><label style={lbl}>🏷️ সাইটের নাম</label><input value={form.siteName} onChange={e => setForm({...form, siteName: e.target.value})} style={inp} /></div>
        <div><label style={lbl}>💰 কারেন্সি</label><input value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} style={inp} /></div>
        <button onClick={saveSettings} style={{
          padding: '12px', background: saved ? '#00a651' : '#1a73e8', color: 'white',
          border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '14px',
        }}>
          {saved ? '✅ সেভ হয়েছে!' : '💾 সেভ করুন'}
        </button>
      </div>

      {/* ডেঞ্জার জোন */}
      <div style={{ marginTop: '20px', background: 'white', borderRadius: '14px', padding: '24px', border: '2px solid #e62e04' }}>
        <h3 style={{ color: '#e62e04', margin: '0 0 8px 0' }}>⚠️ ডেঞ্জার জোন</h3>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login'); }} style={{
          padding: '10px 20px', background: '#e62e04', color: 'white', border: 'none',
          borderRadius: '8px', cursor: 'pointer', fontWeight: '600',
        }}>🚪 লগআউট</button>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '4px' };
const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };