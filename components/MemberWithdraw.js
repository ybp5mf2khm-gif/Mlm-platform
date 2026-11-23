'use client';
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const e = React.createElement;

export default function MemberWithdraw({ user, payouts, onSuccess, setMessage }) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNetwork, setWithdrawNetwork] = useState('TRC20');
  const [accountDetails, setAccountDetails] = useState('');

  async function handlePayout(ev) {
    ev.preventDefault();
    const minWithdraw = 100;
    const numAmount = parseFloat(withdrawAmount);

    if (isNaN(numAmount) || numAmount < minWithdraw) {
      setMessage('Error: Minimum withdrawal is ' + minWithdraw);
      return;
    }

    const trimmedWallet = accountDetails.trim();
    const isValidTRC20 = withdrawNetwork === 'TRC20' && /^T[a-zA-Z0-9]{33}$/.test(trimmedWallet);
    const isValidBEP20 = withdrawNetwork === 'BEP20' && /^0x[a-fA-F0-9]{40}$/.test(trimmedWallet);

    if (!isValidTRC20 && !isValidBEP20) {
      setMessage('Error: Invalid ' + withdrawNetwork + ' wallet address');
      return;
    }

    setMessage('Sending request...');
    const { error } = await supabase.rpc('request_payout', {
      p_user_id: user.id,
      p_amount: numAmount,
      p_method: 'USDT (' + withdrawNetwork + ')',
      p_account_info: { network: withdrawNetwork, wallet: trimmedWallet },
    });

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Payout requested!');
      setWithdrawAmount('');
      setAccountDetails('');
      await onSuccess();
    }
  }

  return e(
    'div',
    { style: card },
    e('h4', { style: { marginTop: 0 } }, 'Withdraw (USDT) - Min: 100'),
    e(
      'form',
      { onSubmit: handlePayout, style: col },
      e(
        'select',
        { value: withdrawNetwork, onChange: (ev) => setWithdrawNetwork(ev.target.value), style: inp },
        e('option', { value: 'TRC20' }, 'USDT - Tron (TRC20)'),
        e('option', { value: 'BEP20' }, 'USDT - BNB Smart Chain (BEP20)')
      ),
      e('input', { type: 'number', step: '0.01', min: 100, placeholder: 'Amount (Min: 100)', value: withdrawAmount, onChange: (ev) => setWithdrawAmount(ev.target.value), required: true, style: inp }),
      e('input', { placeholder: withdrawNetwork === 'TRC20' ? 'USDT TRC20 Address (T...)' : 'USDT BEP20 Address (0x...)', value: accountDetails, onChange: (ev) => setAccountDetails(ev.target.value), required: true, style: inp }),
      e('button', { type: 'submit', style: btn }, 'Request Payout')
    ),
    payouts.length > 0
      ? e(
          'div',
          { style: { marginTop: 12 } },
          e('small', { style: { color: '#666' } }, 'Payout History (' + payouts.length + ')'),
          payouts.map((py) => e('div', { key: py.id, style: row }, e('span', null, py.amount + ' (' + py.method + ')'), e('b', null, py.status)))
        )
      : null
  );
}

const card = { background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const col = { display: 'flex', flexDirection: 'column', gap: 12 };
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' };
const inp = { padding: 10, borderRadius: 6, border: '1px solid #ccc' };
const btn = { padding: '10px 14px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' };
