'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminProducts({ products, onRefresh }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAddProduct(e) {
    e.preventDefault();
    if (!name || !price) return;
    setSaving(true);

    const { error } = await supabase.from('products').insert([
      { name, price: parseFloat(price), is_active: true }
    ]);

    setSaving(false);

    if (error) {
      alert('خطأ في الحفظ: ' + error.message);
      return;
    }

    setName('');
    setPrice('');
    onRefresh();
  }

  async function handleAddProduct(e) {
    e.preventDefault();
    if (!name || !price) return;
    setSaving(true);

    await supabase.from('products').insert([
      { name, price: parseFloat(price), is_active: true }
    ]);

    setName('');
    setPrice('');
    setSaving(false);
    onRefresh();
  }

  async function toggleProduct(id, currentStatus) {
    await supabase
      .from('products')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    onRefresh();
  }

  const boxStyle = {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb',
    marginBottom: '16px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    marginBottom: '10px',
    fontSize: '14px',
    boxSizing: 'border-box',
  };

  return (
    <div>
      {/* نموذج إضافة منتج جديد */}
      <form onSubmit={handleAddProduct} style={boxStyle}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>إضافة منتج جديد</h3>
        <input
          type="text"
          placeholder="اسم المنتج"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          required
        />
        <input
          type="number"
          placeholder="السعر بالدرهم المغربي (MAD)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={inputStyle}
          required
        />
        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            padding: '10px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          {saving ? 'جاري الحفظ...' : '+ إضافة المنتج'}
        </button>
      </form>

      {/* قائمة المنتجات الحالية */}
      <div style={{ ...boxStyle, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
              <th style={{ padding: '12px', textAlign: 'right' }}>المنتج</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>السعر</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>الحالة</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{prod.name}</td>
                <td style={{ padding: '12px', color: '#15803d', fontWeight: 'bold' }}>{prod.price} MAD</td>
                <td style={{ padding: '12px' }}>{prod.is_active ? 'نشط' : 'مخفي'}</td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => toggleProduct(prod.id, prod.is_active)}
                    style={{
                      backgroundColor: prod.is_active ? '#dc2626' : '#16a34a',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                    }}
                  >
                    {prod.is_active ? 'إخفاء' : 'تفعيل'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
