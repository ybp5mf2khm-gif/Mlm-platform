'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

const e = React.createElement;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleUpdate(ev) {
    ev.preventDefault();
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Password updated! Redirecting...');
      setTimeout(() => router.push('/'), 1500);
    }
  }

  return e(
    'div',
    { style: { background: '#fff', padding: 20, borderRadius: 10, maxWidth: 400, margin: '60px auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } },
    e('h3', { style: { marginTop: 0 } }, 'Set New Password'),
    message ? e('p', { style: { padding: 10, background: '#ebf8ff', color: '#2b6cb0', borderRadius: 6 } }, message) : null,
    e(
      'form',
      { onSubmit: handleUpdate, style: { display: 'flex', flexDirection: 'column', gap: 12 } },
      e('input', { type: 'password', placeholder: 'New Password (min 6 chars)', value: password, onChange: (ev) => setPassword(ev.target.value), required: true, style: { padding: 10, borderRadius: 6, border: '1px solid #ccc' } }),
      e('button', { type: 'submit', disabled: loading, style: { padding: '10px 14px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' } }, loading ? '...' : 'Update Password')
    )
  );
}
