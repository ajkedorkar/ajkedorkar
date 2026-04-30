"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
    if (!error) { 
      loadCategories(); 
      setShowAdd(false); 
      setNewCategory({ name: '', slug: '', icon: '🛍️' }); 
      alert('✅ ক্যাটাগরি যোগ হয়েছে!'); 
    } else {
      alert('❌ এরর: ' + error.message); 
    }
  }

  async function updateCategory(cat: Category) {
    const { error } = await supabase.from('categories').update({
      name: cat.name, slug: cat.slug, icon: cat.icon, is_active: cat.is_active,
    }).eq('id', cat.id);
    if (!error) { 
      setEditing(null); 
      loadCategories(); 
      alert('✅ আপডেট হয়েছে!'); 
    } else {
      alert('❌ এরর: ' + error.message); 
    }
  }

  async function deleteCategory(id: number) {
    if (!confirm('সত্যিই ডিলিট করবেন?')) return;
    await supabase.from('categories').delete().eq('id', id);
    loadCategories();
    alert('🗑️ ডিলিট হয়েছে');
  }

  async function toggleActive(id: number, current: boolean) {
    await supabase.from('categories').update({ is_active: !current }).eq('id', id);
    loadCategories();
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', fontSize: '16px', color: '#999' }}>
        ⏳ ক্যাটাগরি লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* হেডার */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '20px', flexWrap: 'wrap', gap: '10px'
      }}>
        <div>
          <h1 style={{ color: '#222', fontSize: '22px', margin: 0 }}>🗂️ ক্যাটাগরি ম্যানেজমেন্ট</h1>
          <p style={{ color: '#666', margin: '2px 0 0 0', fontSize: '12px' }}>
            {categories.length} টি ক্যাটাগরি | {categories.filter(c => c.is_active).length} টি অ্যাক্টিভ
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={loadCategories} style={{
            background: '#f5f5f5', color: '#333', border: '1px solid #ddd',
            padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
            fontWeight: '600', fontSize: '12px',
          }}>🔄 রিফ্রেশ</button>
          <button onClick={() => setShowAdd(!showAdd)} style={{
            background: 'linear-gradient(135deg, #00a651, #00c853)',
            color: 'white', border: 'none', padding: '8px 16px',
            borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
          }}>
            ➕ নতুন ক্যাটাগরি
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{
          background: 'white', padding: '20px', borderRadius: '12px',
          marginBottom: '16px', border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#333' }}>➕ নতুন ক্যাটাগরি যোগ করুন</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
            <div>
              <label style={labelStyle}>📝 নাম</label>
              <input value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} 
                style={inputStyle} placeholder="যেমন: মোবাইল" />
            </div>
            <div>
              <label style={labelStyle}>🔗 Slug</label>
              <input value={newCategory.slug} onChange={e => setNewCategory({...newCategory, slug: e.target.value})} 
                style={inputStyle} placeholder="যেমন: mobile" />
            </div>
            <div>
              <label style={labelStyle}>🔣 আইকন</label>
              <input value={newCategory.icon} onChange={e => setNewCategory({...newCategory, icon: e.target.value})} 
                style={{...inputStyle, width: '70px', textAlign: 'center', fontSize: '22px'}} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button onClick={addCategory} style={{
              background: 'linear-gradient(135deg, #00a651, #00c853)', color: 'white',
              border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '13px',
            }}>💾 সেভ করুন</button>
            <button onClick={() => setShowAdd(false)} style={{
              background: '#f5f5f5', color: '#666', border: '1px solid #ddd',
              padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
            }}>❌ বাতিল</button>
          </div>
        </div>
      )}

      {/* Category List */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {categories.map(cat => (
          <div key={cat.id} style={{
            background: 'white', borderRadius: '10px', padding: '14px 16px',
            border: '1px solid #e0e0e0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'all 0.2s',
          }}>
            {editing?.id === cat.id ? (
              // ===== এডিট মোড =====
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} 
                  style={{...inputStyle, flex: 1, minWidth: '150px'}} />
                <input value={editing.slug} onChange={e => setEditing({...editing, slug: e.target.value})} 
                  style={{...inputStyle, flex: 1, minWidth: '120px'}} />
                <input value={editing.icon} onChange={e => setEditing({...editing, icon: e.target.value})} 
                  style={{...inputStyle, width: '60px', textAlign: 'center', fontSize: '22px'}} />
                <button onClick={() => updateCategory(editing)} style={saveBtn}>💾 সেভ</button>
                <button onClick={() => setEditing(null)} style={cancelBtn}>❌</button>
              </div>
            ) : (
              // ===== ভিউ মোড =====
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f0f0f0, #e0e0e0)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px',
                  }}>
                    {cat.icon}
                  </div>
                  <div>
                    <strong style={{ fontSize: '14px', color: '#222' }}>{cat.name}</strong>
                    <span style={{ color: '#999', fontSize: '11px', marginLeft: '8px' }}>/ {cat.slug}</span>
                    <div style={{ marginTop: '2px' }}>
                      <span onClick={() => toggleActive(cat.id, cat.is_active)} style={{
                        display: 'inline-block', padding: '2px 10px', borderRadius: '12px',
                        fontSize: '10px', cursor: 'pointer', fontWeight: '600',
                        background: cat.is_active ? '#e6f4ea' : '#fce8e6',
                        color: cat.is_active ? '#00a651' : '#e62e04',
                      }}>
                        {cat.is_active ? '🟢 অ্যাক্টিভ' : '🔴 ইনঅ্যাক্টিভ'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setEditing(cat)} style={editBtn}>✏️ এডিট</button>
                  <button onClick={() => deleteCategory(cat.id)} style={deleteBtn}>🗑️ ডিলিট</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>📭</span>
          <p>কোনো ক্যাটাগরি নেই। নতুন যোগ করুন!</p>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { 
  display: 'block', fontSize: '11px', fontWeight: '600', color: '#555', marginBottom: '3px' 
};
const inputStyle: React.CSSProperties = { 
  width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', 
  fontSize: '13px', outline: 'none', boxSizing: 'border-box'
};
const saveBtn: React.CSSProperties = { 
  background: 'linear-gradient(135deg, #00a651, #00c853)', color: 'white', 
  border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' 
};
const cancelBtn: React.CSSProperties = { 
  background: '#f5f5f5', color: '#666', border: '1px solid #ddd', 
  padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' 
};
const editBtn: React.CSSProperties = { 
  background: '#1a73e8', color: 'white', border: 'none', 
  padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' 
};
const deleteBtn: React.CSSProperties = { 
  background: '#e62e04', color: 'white', border: 'none', 
  padding: '7px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '11px' 
};