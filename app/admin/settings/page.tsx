"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [user, setUser] = useState<any>(null);

  // General Settings
  const [general, setGeneral] = useState({
    siteName: 'AjkeDorkar',
    siteDescription: 'আজকের প্রয়োজন, আজই! — কুষ্টিয়ার সেরা ই-কমার্স',
    adminEmail: 'ajkedorkar@gmail.com',
    currency: '৳',
    timezone: 'Asia/Dhaka',
    language: 'bn',
  });

  // SEO Settings
  const [seo, setSeo] = useState({
    metaTitle: 'AjkeDorkar - Online Shopping in Bangladesh',
    metaDescription: 'Buy and sell products online in Kushtia, Bangladesh',
    googleAnalytics: '',
    facebookPixel: '',
  });

  // Payment Settings
  const [payment, setPayment] = useState({
    bkashNumber: '01XXXXXXXXX',
    nagadNumber: '01XXXXXXXXX',
    rocketNumber: '',
    cashOnDelivery: true,
    bkashEnabled: true,
    nagadEnabled: false,
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    orderConfirm: true,
    adminAlerts: true,
    smsAlerts: false,
  });

  // Security
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    ipWhitelist: '',
  });

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    load();
  }, []);

  async function saveSettings() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogoutAll() {
    if (!confirm('সব ডিভাইস থেকে লগআউট করবেন?')) return;
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  const tabs = [
    { key: 'general', icon: '⚙️', label: 'জেনারেল' },
    { key: 'seo', icon: '🔍', label: 'SEO' },
    { key: 'payment', icon: '💰', label: 'পেমেন্ট' },
    { key: 'notification', icon: '🔔', label: 'নোটিফিকেশন' },
    { key: 'security', icon: '🔒', label: 'সিকিউরিটি' },
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 4px 0' }}>⚙️ সেটিংস</h1>
        <p style={{ fontSize: '13px', color: '#888' }}>সাইট কনফিগারেশন ও কাস্টমাইজেশন</p>
      </div>

      {/* ট্যাব */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap', background: 'white', padding: '8px', borderRadius: '12px', border: '1px solid #e8eaed' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
            background: activeTab === tab.key ? '#e62e04' : 'transparent',
            color: activeTab === tab.key ? 'white' : '#666',
            border: 'none', transition: 'all 0.2s',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ===== জেনারেল সেটিংস ===== */}
      {activeTab === 'general' && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e8eaed', display: 'grid', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>⚙️ জেনারেল সেটিংস</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>🏷️ সাইটের নাম</label><input value={general.siteName} onChange={e => setGeneral({...general, siteName: e.target.value})} style={inp} /></div>
            <div><label style={lbl}>💰 কারেন্সি</label><input value={general.currency} onChange={e => setGeneral({...general, currency: e.target.value})} style={inp} /></div>
          </div>
          <div><label style={lbl}>📄 সাইট ডেসক্রিপশন</label><textarea value={general.siteDescription} onChange={e => setGeneral({...general, siteDescription: e.target.value})} style={{...inp, height: '70px', resize: 'vertical'}} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>📧 অ্যাডমিন ইমেইল</label><input value={general.adminEmail} onChange={e => setGeneral({...general, adminEmail: e.target.value})} style={inp} /></div>
            <div><label style={lbl}>🌐 ভাষা</label>
              <select value={general.language} onChange={e => setGeneral({...general, language: e.target.value})} style={inp}>
                <option value="bn">🇧🇩 বাংলা</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ===== SEO সেটিংস ===== */}
      {activeTab === 'seo' && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e8eaed', display: 'grid', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>🔍 SEO সেটিংস</h3>
          <div><label style={lbl}>📝 মেটা টাইটেল</label><input value={seo.metaTitle} onChange={e => setSeo({...seo, metaTitle: e.target.value})} style={inp} /></div>
          <div><label style={lbl}>📄 মেটা ডেসক্রিপশন</label><textarea value={seo.metaDescription} onChange={e => setSeo({...seo, metaDescription: e.target.value})} style={{...inp, height: '70px', resize: 'vertical'}} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>📊 Google Analytics ID</label><input value={seo.googleAnalytics} onChange={e => setSeo({...seo, googleAnalytics: e.target.value})} placeholder="G-XXXXXXXXXX" style={inp} /></div>
            <div><label style={lbl}>📘 Facebook Pixel ID</label><input value={seo.facebookPixel} onChange={e => setSeo({...seo, facebookPixel: e.target.value})} style={inp} /></div>
          </div>
        </div>
      )}

      {/* ===== পেমেন্ট সেটিংস ===== */}
      {activeTab === 'payment' && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e8eaed', display: 'grid', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>💰 পেমেন্ট সেটিংস</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>📱 বিকাশ নম্বর</label><input value={payment.bkashNumber} onChange={e => setPayment({...payment, bkashNumber: e.target.value})} style={inp} /></div>
            <div><label style={lbl}>📲 নগদ নম্বর</label><input value={payment.nagadNumber} onChange={e => setPayment({...payment, nagadNumber: e.target.value})} style={inp} /></div>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={payment.cashOnDelivery} onChange={e => setPayment({...payment, cashOnDelivery: e.target.checked})} />
              <span style={{ fontSize: '13px' }}>💵 ক্যাশ অন ডেলিভারি</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={payment.bkashEnabled} onChange={e => setPayment({...payment, bkashEnabled: e.target.checked})} />
              <span style={{ fontSize: '13px' }}>📱 বিকাশ</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input type="checkbox" checked={payment.nagadEnabled} onChange={e => setPayment({...payment, nagadEnabled: e.target.checked})} />
              <span style={{ fontSize: '13px' }}>📲 নগদ</span>
            </label>
          </div>
        </div>
      )}

      {/* ===== নোটিফিকেশন সেটিংস ===== */}
      {activeTab === 'notification' && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e8eaed' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>🔔 নোটিফিকেশন</h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {[
              { key: 'orderConfirm', label: '📦 অর্ডার কনফার্মেশন', desc: 'নতুন অর্ডার এলে জানানো হবে' },
              { key: 'emailAlerts', label: '📧 ইমেইল অ্যালার্ট', desc: 'ইমেইলে বিজ্ঞপ্তি পাবেন' },
              { key: 'adminAlerts', label: '🛠️ অ্যাডমিন অ্যালার্ট', desc: 'পেন্ডিং প্রোডাক্ট থাকলে জানানো হবে' },
              { key: 'smsAlerts', label: '📱 SMS অ্যালার্ট', desc: 'মোবাইলে SMS পাবেন' },
            ].map(item => (
              <label key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>{item.desc}</div>
                </div>
                <input type="checkbox" checked={(notifications as any)[item.key]} onChange={e => setNotifications({...notifications, [item.key]: e.target.checked})} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ===== সিকিউরিটি ===== */}
      {activeTab === 'security' && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e8eaed', display: 'grid', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>🔒 সিকিউরিটি</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={lbl}>⏰ সেশন টাইমআউট (মিনিট)</label><input value={security.sessionTimeout} onChange={e => setSecurity({...security, sessionTimeout: e.target.value})} type="number" style={inp} /></div>
            <div><label style={lbl}>🌐 IP হোয়াইটলিস্ট</label><input value={security.ipWhitelist} onChange={e => setSecurity({...security, ipWhitelist: e.target.value})} placeholder="192.168.1.1, 10.0.0.1" style={inp} /></div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={security.twoFactor} onChange={e => setSecurity({...security, twoFactor: e.target.checked})} style={{ width: '18px', height: '18px' }} />
            <span style={{ fontSize: '14px', fontWeight: '600' }}>🔐 টু-ফ্যাক্টর অথেন্টিকেশন</span>
          </label>
        </div>
      )}

      {/* সেভ বাটন */}
      <button onClick={saveSettings} style={{
        marginTop: '20px', width: '100%', padding: '14px',
        background: saved ? '#00a651' : 'linear-gradient(135deg, #1a73e8, #4A90D9)',
        color: 'white', border: 'none', borderRadius: '12px',
        fontWeight: '700', fontSize: '16px', cursor: 'pointer',
      }}>
        {saved ? '✅ সেটিংস সেভ হয়েছে!' : '💾 সব সেটিংস সেভ করুন'}
      </button>

      {/* ডেঞ্জার জোন */}
      <div style={{ marginTop: '20px', background: 'white', borderRadius: '14px', padding: '24px', border: '2px solid #e62e04' }}>
        <h3 style={{ color: '#e62e04', margin: '0 0 12px 0', fontSize: '16px' }}>⚠️ ডেঞ্জার জোন</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={handleLogoutAll} style={{
            padding: '10px 20px', background: '#fce8e6', color: '#e62e04', border: '1px solid #e62e04',
            borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
          }}>🚪 সব ডিভাইস লগআউট</button>
          <button onClick={() => router.push('/admin/login')} style={{
            padding: '10px 20px', background: '#e62e04', color: 'white', border: 'none',
            borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px',
          }}>🔐 লগইন পেজে যান</button>
        </div>
      </div>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '4px' };
const inp: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };