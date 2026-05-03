"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    let query = supabase.from('admin_users_view').select('*').order('created_at', { ascending: false }).limit(50);
    if (searchTerm) query = query.ilike('email', `%${searchTerm}%`);
    const { data } = await query;
    if (data) setUsers(data);
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 4px 0' }}>👥 ইউজার ম্যানেজমেন্ট</h1>
        <p style={{ fontSize: '13px', color: '#888' }}>সব নিবন্ধিত ইউজার</p>
      </div>

      <div style={{ background: 'white', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #e8eaed', display: 'flex', gap: '10px' }}>
        <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyDown={e => e.key === 'Enter' && loadUsers()} placeholder="🔍 ইমেইল দিয়ে সার্চ..." style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '13px' }} />
        <button onClick={loadUsers} style={{ background: '#1a73e8', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}>🔍</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>⏳</div> : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', color: '#999' }}>📭 কোনো ইউজার নেই</div>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {users.map(user => (
            <div key={user.id} style={{
              background: 'white', borderRadius: '10px', padding: '14px 16px',
              border: '1px solid #e8eaed', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e62e04', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>
                  {(user.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>{user.full_name || 'নাম নাই'}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>{user.email}</div>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#999' }}>
                {new Date(user.created_at).toLocaleDateString('bn-BD')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}