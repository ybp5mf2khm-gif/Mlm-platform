'use client';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const e = React.createElement;

const ADMIN_WALLETS = {
  TRC20: 'PUT_YOUR_TRC20_WALLET_HERE',
  BEP20: 'PUT_YOUR_BEP20_WALLET_HERE',
};

export default function MemberStore({ user, products, onSuccess, setMessage }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [payNetwork, setPayNetwork] = useState('TRC20');
  const [txHash, setTxHash] = useState('');
  const [buyingId, setBuyingId] = useState(null);

  async function confirmUsdtOrder(ev) {
    ev.preventDefault();
    if (!selectedProduct || buyingId) return;
    setBuyingId(selectedProduct.id);
    setMessage('Processing...');

    const { data: ord, error: err } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        total_amount: selectedProduct.price,
        total_pv: selectedProduct.pv,
        status: 'PENDING',
        tx_hash: txHash.trim(),
        network: payNetwork,
      })
      .select()
      .single();

    if (err) {
      setMessage('Error: ' + err.message);
      setBuyingId(null);
      return;
    }

    await supabase.from('order_items').insert({
      order_id: ord.id,
      product_id: selectedProduct.id,
      quantity: 1,
      unit_price: selectedProduct.price,
      unit_pv: selectedProduct.pv,
    });

    setMessage('Payment submitted! Waiting for admin approval.');
    setSelectedProduct(null);
    setTxHash('');
    await onSuccess();
    setBuyingId(null);
  }

  return e(
    'div',
    { style: card },
    e('h4', { style: { marginTop: 0 } }, 'Products Store'),
    products.map((p) =>
      e(
        'div',
        { key: p.id, style: row },
        e('div', null, e('b', null, p.name), e('div', { style: { fontSize: 12, color: '#666' } }, p.price + ' MAD | ' + p.pv + ' PV')),
        e('button', { onClick: () => setSelectedProduct(p), style: { ...btn, background: '#38a169' } }, 'Buy Now')
      )
    ),
    selectedProduct
      ? e(
          'div',
          { style: { marginTop: 14, padding: 14, background: '#f7fafc', borderRadius: 8, border: '1px solid #cbd5e0' } },
          e(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
            e('b', null, 'Pay with USDT: ' + selectedProduct.name),
            e('button', { onClick: () => setSelectedProduct(null), style: { background: 'none', border: 'none', color: '#e53e3e', fontWeight: 'bold', cursor: 'pointer' } }, 'X')
          ),
          e(
            'form',
            { onSubmit: confirmUsdtOrder, style: col },
            e(
              'select',
              { value: payNetwork, onChange: (ev) => setPayNetwork(ev.target.value), style: inp },
              e('option', { value: 'TRC20' }, 'Network: USDT (TRC20)'),
              e('option', { value: 'BEP20' }, 'Network: USDT (BEP20)')
            ),
            e(
              'div',
              { style: { display: 'flex', gap: 6 } },
              e('input', { readOnly: true, value: ADMIN_WALLETS[payNetwork], style: { ...inp, flex: 1, fontSize: 12, background: '#edf2f7' } }),
              e('button', { type: 'button', onClick: () => { navigator.clipboard.writeText(ADMIN_WALLETS[payNetwork]); setMessage('Wallet Copied!'); }, style: btn }, 'Copy')
            ),
            e('input', { placeholder: 'Transaction Hash (TxID)', value: txHash, onChange: (ev) => setTxHash(ev.target.value), required: true, style: inp }),
            e('button', { type: 'submit', disabled: buyingId === selectedProduct.id, style: { ...btn, background: '#38a169' } }, buyingId === selectedProduct.id ? '...' : 'Confirm Payment')
          )
        )
      : null
  );
}

const card = { background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const col = { display: 'flex', flexDirection: 'column', gap: 12 };
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' };
const inp = { padding: 10, borderRadius: 6, border: '1px solid #ccc' };
const btn = { padding: '10px 14px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' };
