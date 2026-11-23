'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const e = React.createElement;
const ADMIN_PASS = 'admin1234';

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [orders, setOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [products, setProducts] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newPv, setNewPv] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (auth) loadAll();
  }, [auth]);

  async function loadAll() {
    const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (o) setOrders(o);
    const { data: p } = await supabase.from('payouts').select('*').order('created_at', { ascending: false });
    if (p) setPayouts(p);
    const { data: pr } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (pr) setProducts(pr);
  }

  async function approveOrder(id) {
    setMsg('Updating order...');
    const { error } = await supabase.from('orders').update({ status: 'PAID', paid_at: new Date().toISOString() }).eq('id', id);
    if (error) setMsg('Error: ' + error.message);
    else { setMsg('Order Approved!'); loadAll(); }
  }

  async function approvePayout(id) {
    setMsg('Updating payout...');
    const { error } = await supabase.from('payouts').update({ status: 'APPROVED' }).eq('id', id);
    if (error) setMsg('Error: ' + error.message);
    else { setMsg('Payout Marked as Paid!'); loadAll(); }
  }

  async function addProduct(ev) {
    ev.preventDefault();
    setMsg('Adding product...');
    const { error } = await supabase.from('products').insert({
      sku: 'SKU-' + Date.now(), name: newName, price: parseFloat(newPrice), pv: parseFloat(newPv), is_active: true
    });
    if (error) setMsg('Error: ' + error.message);
    else { setMsg('Product Added!'); setNewName(''); setNewPrice(''); setNewPv(''); loadAll(); }
  }

  async function toggleProduct(prod) {
    await supabase.from('products').update({ is_active: !prod.is_active }).eq('id', prod.id);
    loadAll();
  }
  if (!auth) {
    return e('div', { style: card },
      e('h3', null, 'Admin Login'),
      e('form', { onSubmit: (ev) => { ev.preventDefault(); if (passInput === ADMIN_PASS) setAuth(true); else setMsg('Wrong password'); }, style: col },
        msg ? e('p', { style: msgBox }, msg) : null,
        e('input', { type: 'password', placeholder: 'Admin Password', value: passInput, onChange: (ev) => setPassInput(ev.target.value), style: inp }),
        e('button', { type: 'submit', style: btn }, 'Enter')
      )
    );
  }

  return e('div', { style: col },
    e('div', { style: { ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      e('h3', { style: { margin: 0 } }, 'Admin Panel'),
      e('button', { onClick: loadAll, style: btn }, 'Refresh')
    ),
    msg ? e('p', { style: msgBox }, msg) : null,
    e('div', { style: card },
      e('h4', { style: { marginTop: 0 } }, 'Orders (' + orders.length + ')'),
      orders.map((o) => e('div', { key: o.id, style: row },
        e('div', null, e('b', null, o.total_amount + ' MAD | ' + o.total_pv + ' PV'), e('div', { style: { fontSize: 12, color: '#666' } }, 'Status: ' + o.status)),
        o.status === 'PENDING' ? e('button', { onClick: () => approveOrder(o.id), style: { ...btn, background: '#38a169' } }, 'Approve') : e('b', { style: { color: '#38a169' } }, 'PAID')
      ))
    ),
    e('div', { style: card },
      e('h4', { style: { marginTop: 0 } }, 'USDT Withdrawals (' + payouts.length + ')'),
      payouts.map((p) => e('div', { key: p.id, style: row },
        e('div', { style: { flex: 1 } },
          e('b', null, p.amount + ' (' + p.method + ')'),
          e('div', { style: { fontSize: 11, color: '#444', wordBreak: 'break-all' } }, p.account_info?.wallet || ''),
          e('div', { style: { fontSize: 12, color: '#666' } }, 'Status: ' + p.status)
        ),
        e('div', { style: { display: 'flex', gap: 6 } },
          p.account_info?.wallet ? e('button', { onClick: () => { navigator.clipboard.writeText(p.account_info.wallet); setMsg('Wallet Copied!'); }, style: btn }, 'Copy') : null,
          p.status === 'PENDING' ? e('button', { onClick: () => approvePayout(p.id), style: { ...btn, background: '#38a169' } }, 'Mark Paid') : e('b', { style: { color: '#38a169' } }, p.status)
        )
      ))
    ),
    e('div', { style: card },
      e('h4', { style: { marginTop: 0 } }, 'Add Product'),
      e('form', { onSubmit: addProduct, style: col },
        e('input', { placeholder: 'Product Name', value: newName, onChange: (ev) => setNewName(ev.target.value), required: true, style: inp }),
        e('input', { type: 'number', step: '0.01', placeholder: 'Price (MAD)', value: newPrice, onChange: (ev) => setNewPrice(ev.target.value), required: true, style: inp }),
        e('input', { type: 'number', step: '0.01', placeholder: 'PV Points', value: newPv, onChange: (ev) => setNewPv(ev.target.value), required: true, style: inp }),
        e('button', { type: 'submit', style: btn }, 'Add Product')
      ),
      e('div', { style: { marginTop: 12 } },
        products.map((pr) => e('div', { key: pr.id, style: row },
          e('span', null, pr.name + ' (' + pr.price + ' MAD)'),
          e('button', { onClick: () => toggleProduct(pr), style: { ...btn, background: pr.is_active ? '#e53e3e' : '#38a169' } }, pr.is_active ? 'Hide' : 'Show')
        ))
      )
    )
  );
}

const card = { background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const col = { display: 'flex', flexDirection: 'column', gap: 12 };
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #eee' };
const inp = { padding: 10, borderRadius: 6, border: '1px solid #ccc' };
const btn = { padding: '8px 12px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' };
const msgBox = { padding: 10, background: '#ebf8ff', color: '#2b6cb0', borderRadius: 6, margin: 0 };

