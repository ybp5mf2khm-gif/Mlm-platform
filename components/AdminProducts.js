'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminProducts({ products, onRefresh }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  async function handleAddProduct(e) {
    e.preventDefault();
    setStatusMsg('');
    if (!name || !price) return;
    setSaving(true);

    // تجهيز البيانات بناءً على الأعمدة الموجودة في جدولح
    const newProduct = {
      name: name.trim(),
      price: parseFloat(price),
      sku: 'PRD-' + Date.now(),
    };

    // التحقق من اسم عمود الحالة الموجود في منتجاتك السابقة
    if (products.length > 0 && 'is_active' in products[0]) {
      newProduct.is_active = true;
    } else if (products.length > 0 && 'status' in products[0]) {
      newProduct.status = 'ACTIVE';
    }

    const { error } = await supabase.from('products').insert([newProduct]);

    setSaving(false);

    if (error) {
      setStatusMsg('خطأ: ' + error.message);
      return;
    }

    setStatusMsg('تمت إضافة المنتج بنجاح!');
    setName('');
    setPrice('');
    onRefresh();
  }

  async function toggleProduct(prod) {
    const updates = 'is_active' in prod 
      ? { is_active: !prod.is_active } 
      : { status: prod.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' };

    const { error } = await supabase.from('products').update(updates).eq('id', prod.id);
    if (error) {
      setStatusMsg('خطأ في التحديث: ' + error.message);
    } else {
      onRefresh();
    }
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
      <form onSubmit={handleAddProduct} style={boxStyle}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1e293b' }}>إضافة منتج جديد</h3>
        
        {statusMsg && (
          <p style={{ 
            padding: '8px', 
            borderRadius: '6px', 
            fontSize: '13px', 
            fontWeight: 'bold',
            backgroundColor: statusMsg.startsWith('خطأ') ? '#fee2e2' : '#dcfce7',
            color: statusMsg.startsWith('خطأ') ? '#dc2626' : '#15803d',
            marginBottom: '10px'
          }}>
            {statusMsg}
          </p>
        )}

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
            {products.map((prod) => {
              const active = 'is_active' in prod ? prod.is_active : prod.status === 'ACTIVE';
              return (
                <tr key={prod.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{prod.name}</td>
                  <td style={{ padding: '12px', color: '#15803d', fontWeight: 'bold' }}>{prod.price} MAD</td>
                  <td style={{ padding: '12px' }}>{active ? 'نشط' : 'مخفي'}</td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => toggleProduct(prod)}
                      style={{
                        backgroundColor: active ? '#dc2626' : '#16a34a',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    >
                      {active ? 'إخفاء' : 'تفعيل'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
