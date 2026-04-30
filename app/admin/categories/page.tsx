"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  is_active: boolean;
}

export default function CategoryAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', icon: '🛍️' });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('id');
    if (data) setCategories(data);
    setLoading(false);
  }

  async function addCategory() {
    if (!newCategory.name || !newCategory.slug) return alert('নাম ও slug দাও!');
    const { error } = await supabase.from('categories').insert({
      name: newCategory.name,
      slug: newCategory.slug.toLowerCase().replace(/\s+/g, '-'),
      icon: newCategory.icon,
    });
    if (!error) { loadCategories(); setShowAdd(false); setNewCategory({ name: '', slug: '', icon: '🛍️' }); alert('✅ যোগ হয়েছে!'); }
    else alert('❌ এরর: ' + error.message);
  }

  async function updateCategory(cat: Category) {
    const { error } = await supabase.from('categories').update({
      name: cat.name, slug: cat.slug, icon: cat.icon, is_active: cat.is_active,
    }).eq('id', cat.id);
    if (!error) { setEditing(null); loadCategories(); alert('✅ আপডেট হয়েছে!'); }
    else alert('❌ এরর: ' + error.message);
  }

  async function deleteCategory(id: number) {
    if (!confirm('ডিলিট করবেন?')) return;
    await supabase.from('categories').delete().eq('id', id);
    loadCategories();
  }

  async function toggleActive(id: number, current: boolean) {
    await supabase.from('categories').update({ is_active: !current }).eq('id', id);
    loadCategories();
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>⏳ লোড হচ্ছে...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#222', fontSize: '24px', margin: 0 }}>🗂️ ক্যাটাগরি অ্যাডমিন</h1>
          <Link href="/admin" style={{ fontSize: '12px', color: '#1a73e8' }}>← ব্যানার অ্যাডমিন</Link>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          background: '#00a651', color: 'white', border: 'none', padding: '10px 20px',
          borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
        }}>➕ নতুন ক্যাটাগরি</button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{ background: 'white', padding: '15px', borderRadius: '10px', marginBottom: '15px', border: '1px solid #eee' }}>
          <input value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} placeholder="নাম" style={inputStyle} />
          <input value={newCategory.slug} onChange={e => setNewCategory({...newCategory, slug: e.target.value})} placeholder="slug (offer-zone)" style={inputStyle} />
          <input value={newCategory.icon} onChange={e => setNewCategory({...newCategory, icon: e.target.value})} placeholder="আইকন" style={{...inputStyle, width: '80px', textAlign: 'center', fontSize: '24px'}} />
          <button onClick={addCategory} style={{ background: '#00a651', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💾 সেভ</button>
        </div>
      )}

      {/* Category List */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {categories.map(cat => (
          <div key={cat.id} style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
            {editing?.id === cat.id ? (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} style={inputStyle} />
                <input value={editing.slug} onChange={e => setEditing({...editing, slug: e.target.value})} style={inputStyle} />
                <input value={editing.icon} onChange={e => setEditing({...editing, icon: e.target.value})} style={{...inputStyle, width: '60px', textAlign: 'center', fontSize: '24px'}} />
                <button onClick={() => updateCategory(editing)} style={saveBtn}>💾</button>
                <button onClick={() => setEditing(null)} style={cancelBtn}>❌</button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px' }}>{cat.icon}</span>
                  <div>
                    <strong>{cat.name}</strong>
                    <span style={{ color: '#999', fontSize: '11px', marginLeft: '8px' }}>({cat.slug})</span>
                  </div>
                  <span onClick={() => toggleActive(cat.id, cat.is_active)} style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '10px', cursor: 'pointer',
                    background: cat.is_active ? '#e6f4ea' : '#fce8e6', color: cat.is_active ? '#00a651' : '#e62e04',
                  }}>{cat.is_active ? 'Active' : 'Inactive'}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEditing(cat)} style={editBtn}>✏️</button>
                  <button onClick={() => deleteCategory(cat.id)} style={deleteBtn}>🗑️</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' };
const saveBtn: React.CSSProperties = { background: '#00a651', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' };
const cancelBtn: React.CSSProperties = { background: '#f5f5f5', color: '#666', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' };
const editBtn: React.CSSProperties = { background: '#1a73e8', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' };
const deleteBtn: React.CSSProperties = { background: '#e62e04', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer' };