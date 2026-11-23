'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminSettings() {
  const [minWithdrawal, setMinWithdrawal] = useState('200');
  const [level1, setLevel1] = useState('10');
  const [level2, setLevel2] = useState('5');
  const [level3, setLevel3] = useState('2');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const { data } = await supabase
      .from('platform_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (data) {
      setMinWithdrawal(data.min_withdrawal);
      setLevel1(data.level1_percent);
      setLevel2(data.level2_percent);
      setLevel3(data.level3_percent);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    const { error } = await supabase
      .from('platform_settings')
      .update({
        min_withdrawal: parseFloat(minWithdrawal),
        level1_percent: parseFloat(level1),
        level2_percent: parseFloat(level2),
        level3_percent: parseFloat(level3),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    setSaving(false);
    if (error) {
      setMsg('خطأ: ' + error.message);
    } else {
      setMsg('تم حفظ الإعدادات بنجاح!');
    }
  }

  const boxStyle = {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: '6px',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    marginBottom: '14px',
    fontSize: '14px',
    boxSizing: 'border-box',
  };

  return (
    <form onSubmit={handleSave} style={boxStyle}>
      <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: '#1e293b' }}>
        إعدادات العمولات والسحب
      </h3>

      {msg && (
        <p style={{
          padding: '8px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 'bold',
          backgroundColor: msg.startsWith('خطأ') ? '#fee2e2' : '#dcfce7',
          color: msg.startsWith('خطأ') ? '#dc2626' : '#15803d',
          marginBottom: '12px',
        }}>
          {msg}
        </p>
      )}

      <label style={labelStyle}>الحد الأدنى للسحب (MAD)</label>
      <input
        type="number"
        value={minWithdrawal}
        onChange={(e) => setMinWithdrawal(e.target.value)}
        style={inputStyle}
        required
      />

      <label style={labelStyle}>نسبة عمولة المستوى الأول (%)</label>
      <input
        type="number"
        step="0.1"
        value={level1}
        onChange={(e) => setLevel1(e.target.value)}
        style={inputStyle}
        required
      />

      <label style={labelStyle}>نسبة عمولة المستوى الثاني (%)</label>
      <input
        type="number"
        step="0.1"
        value={level2}
        onChange={(e) => setLevel2(e.target.value)}
        style={inputStyle}
        required
      />

      <label style={labelStyle}>نسبة عمولة المستوى الثالث (%)</label>
      <input
        type="number"
        step="0.1"
        value={level3}
        onChange={(e) => setLevel3(e.target.value)}
        style={inputStyle}
        required
      />

      <button
        type="submit"
        disabled={saving}
        style={{
          width: '100%',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          border: 'none',
          padding: '12px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
      </button>
    </form>
  );
}
