'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const e = React.createElement;

const ADMIN_WALLETS = {
  TRC20: 'PUT_YOUR_TRC20_WALLET_HERE',
  BEP20: 'PUT_YOUR_BEP20_WALLET_HERE',
};

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [team, setTeam] = useState([]);
  const [products, setProducts] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [message, setMessage] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNetwork, setWithdrawNetwork] = useState('TRC20');
  const [accountDetails, setAccountDetails] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [payNetwork, setPayNetwork] = useState('TRC20');
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) { setSponsorCode(ref.toUpperCase()); setIsSignUp(true); }
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) { setUser(session.user); await loadData(session.user.id); }
    } finally { setLoading(false); }
  }

  async function loadData(uid) {
    const { data: u } = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
    if (u) setProfile(u);
    const { data: w } = await supabase.from('wallets').select('*').eq('user_id', uid).maybeSingle();
    if (w) setWallet(w);
    const { data: cl } = await supabase.from('user_closure').select('depth, descendant_id').eq('ancestor_id', uid).gt('depth', 0).lte('depth', 3);
    if (cl && cl.length > 0) {
      const ids = cl.map((c) => c.descendant_id);
      const { data: m } = await supabase.from('users').select('id, full_name').in('id', ids);
      setTeam(cl.map((c) => ({ depth: c.depth, name: m?.find((x) => x.id === c.descendant_id)?.full_name || 'Member' })));
    } else { setTeam([]); }
    const { data: p } = await supabase.from('products').select('*').eq('is_active', true);
    if (p) setProducts(p);
    const { data: cm } = await supabase.from('commissions').select('*').eq('beneficiary_id', uid).order('created_at', { ascending: false });
    if (cm) setCommissions(cm);
    const { data: py } = await supabase.from('payouts').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (py) setPayouts(py);
  }
  async function confirmUsdtOrder(ev) {
    ev.preventDefault();
    if (!selectedProduct || buyingId) return;
    setBuyingId(selectedProduct.id);
    setMessage('Processing...');
    const { data: ord, error: err } = await supabase.from('orders').insert({
      buyer_id: user.id, total_amount: selectedProduct.price, total_pv: selectedProduct.pv, status: 'PENDING'
    }).select().single();
    if (err) { setMessage('Error: ' + err.message); setBuyingId(null); return; }
    await supabase.from('order_items').insert({
      order_id: ord.id, product_id: selectedProduct.id, quantity: 1, unit_price: selectedProduct.price, unit_pv: selectedProduct.pv
    });
    setMessage('Payment submitted! Waiting for admin approval.');
    setSelectedProduct(null); setTxHash('');
    await loadData(user.id); setBuyingId(null);
  }

  async function handleAuth(ev) {
    ev.preventDefault();
    setMessage('Loading...');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, sponsor_code: sponsorCode } } });
      if (error) setMessage('Error: ' + error.message);
      else { setMessage('Account created!'); checkUser(); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage('Error: ' + error.message);
      else { setMessage(''); checkUser(); }
    }
  }

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
    if (!isValidTRC20 && !isValidBEP20) { setMessage('Error: Invalid ' + withdrawNetwork + ' wallet address'); return; }

    setMessage('Sending request...');
    const { error } = await supabase.rpc('request_payout', {
      p_user_id: user.id, p_amount: numAmount, p_method: 'USDT (' + withdrawNetwork + ')', p_account_info: { network: withdrawNetwork, wallet: trimmedWallet }
    });
    if (error) setMessage('Error: ' + error.message);
    else { setMessage('Payout requested!'); setWithdrawAmount(''); setAccountDetails(''); await loadData(user.id); }
  }


  async function logout() { await supabase.auth.signOut(); setUser(null); setProfile(null); }
  if (loading) return e('p', { style: { textAlign: 'center', marginTop: 40 } }, 'Loading...');
  if (!user) {
    return e('div', { style: card },
      e('h2', null, isSignUp ? 'Sign Up' : 'Login'),
      message ? e('p', { style: msgBox }, message) : null,
      e('form', { onSubmit: handleAuth, style: col },
        isSignUp ? e('input', { placeholder: 'Full Name', value: fullName, onChange: (ev) => setFullName(ev.target.value), required: true, style: inp }) : null,
        isSignUp ? e('input', { placeholder: 'Sponsor Code', value: sponsorCode, onChange: (ev) => setSponsorCode(ev.target.value.toUpperCase()), style: inp }) : null,
        e('input', { type: 'email', placeholder: 'Email', value: email, onChange: (ev) => setEmail(ev.target.value), required: true, style: inp }),
        e('input', { type: 'password', placeholder: 'Password', value: password, onChange: (ev) => setPassword(ev.target.value), required: true, style: inp }),
        e('button', { type: 'submit', style: btn }, isSignUp ? 'Register' : 'Sign In')
      ),
      e('button', { onClick: () => setIsSignUp(!isSignUp), style: linkBtn }, isSignUp ? 'Already have an account? Login' : 'Create new account')
    );
  }

  const refUrl = typeof window !== 'undefined' ? window.location.origin + '/?ref=' + (profile?.referral_code || '') : '';
  return e('div', { style: col },
    e('div', { style: { ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      e('div', null, e('h3', { style: { margin: 0 } }, profile?.full_name), e('small', null, 'Code: ', e('b', null, profile?.referral_code))),
      e('button', { onClick: logout, style: { ...btn, background: '#e53e3e' } }, 'Logout')
    ),
    message ? e('p', { style: msgBox }, message) : null,
    e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
      e('div', { style: card }, e('small', null, 'Available'), e('h2', { style: { margin: '5px 0', color: '#2f855a' } }, wallet?.available_balance || '0.00')),
      e('div', { style: card }, e('small', null, 'Pending'), e('h2', { style: { margin: '5px 0', color: '#d69e2e' } }, wallet?.pending_balance || '0.00'))
    ),
    e('div', { style: card },
     e('h4', { style: { marginTop: 0 } }, 'Withdraw (USDT) - Min: 10'),

      products.map((p) => e('div', { key: p.id, style: row },
        e('div', null, e('b', null, p.name), e('div', { style: { fontSize: 12, color: '#666' } }, p.price + ' MAD | ' + p.pv + ' PV')),
        e('button', { onClick: () => setSelectedProduct(p), style: { ...btn, background: '#38a169' } }, 'Buy Now')
      )),
      selectedProduct ? e('div', { style: { marginTop: 14, padding: 14, background: '#f7fafc', borderRadius: 8, border: '1px solid #cbd5e0' } },
        e('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
          e('b', null, 'Pay with USDT: ' + selectedProduct.name),
          e('button', { onClick: () => setSelectedProduct(null), style: { background: 'none', border: 'none', color: '#e53e3e', fontWeight: 'bold', cursor: 'pointer' } }, 'X')
        ),
        e('form', { onSubmit: confirmUsdtOrder, style: col },
          e('select', { value: payNetwork, onChange: (ev) => setPayNetwork(ev.target.value), style: inp },
            e('option', { value: 'TRC20' }, 'Network: USDT (TRC20)'), e('option', { value: 'BEP20' }, 'Network: USDT (BEP20)')
          ),
          e('div', { style: { display: 'flex', gap: 6 } },
            e('input', { readOnly: true, value: ADMIN_WALLETS[payNetwork], style: { ...inp, flex: 1, fontSize: 12, background: '#edf2f7' } }),
            e('button', { type: 'button', onClick: () => { navigator.clipboard.writeText(ADMIN_WALLETS[payNetwork]); setMessage('Wallet Copied!'); }, style: btn }, 'Copy')
          ),
          e('input', { placeholder: 'Transaction Hash (TxID)', value: txHash, onChange: (ev) => setTxHash(ev.target.value), required: true, style: inp }),
          e('button', { type: 'submit', disabled: buyingId === selectedProduct.id, style: { ...btn, background: '#38a169' } }, buyingId === selectedProduct.id ? '...' : 'Confirm Payment')
        )
      ) : null
    ),
    e('div', { style: card }, e('h4', { style: { marginTop: 0 } }, 'Referral Link'), e('div', { style: { display: 'flex', gap: 8 } }, e('input', { readOnly: true, value: refUrl, style: { ...inp, flex: 1 } }), e('button', { onClick: () => { navigator.clipboard.writeText(refUrl); setMessage('Copied!'); }, style: btn }, 'Copy'))),
    e('div', { style: card }, e('h4', { style: { marginTop: 0 } }, 'Commissions (' + commissions.length + ')'), commissions.map((c) => e('div', { key: c.id, style: row }, e('span', null, 'Level ' + c.level + ' (' + (Number(c.rate) * 100) + '%)'), e('b', { style: { color: '#2f855a' } }, '+' + c.amount + ' (' + c.status + ')')))),
    e('div', { style: card },
      e('h4', { style: { marginTop: 0 } }, 'Withdraw (USDT)'),
      e('form', { onSubmit: handlePayout, style: col },
        e('select', { value: withdrawNetwork, onChange: (ev) => setWithdrawNetwork(ev.target.value), style: inp }, e('option', { value: 'TRC20' }, 'USDT - Tron (TRC20)'), e('option', { value: 'BEP20' }, 'USDT - BNB Smart Chain (BEP20)')),
        e('input', { type: 'number', step: '0.01', placeholder: 'Amount', value: withdrawAmount, onChange: (ev) => setWithdrawAmount(ev.target.value), required: true, style: inp }),
        e('input', { placeholder: withdrawNetwork === 'TRC20' ? 'USDT TRC20 Address (T...)' : 'USDT BEP20 Address (0x...)', value: accountDetails, onChange: (ev) => setAccountDetails(ev.target.value), required: true, style: inp }),
        e('button', { type: 'submit', style: btn }, 'Request Payout')
      ),
      payouts.length > 0 ? e('div', { style: { marginTop: 12 } }, e('small', { style: { color: '#666' } }, 'Payout History (' + payouts.length + ')'), payouts.map((py) => e('div', { key: py.id, style: row }, e('span', null, py.amount + ' (' + py.method + ')'), e('b', null, py.status)))) : null
    ),
    e('div', { style: card }, e('h4', { style: { marginTop: 0 } }, 'My Team (' + team.length + ')'), team.map((t, i) => e('div', { key: i, style: row }, e('span', null, t.name), e('span', null, 'Level ' + t.depth))))
  );
}
const card = { background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const col = { display: 'flex', flexDirection: 'column', gap: 12 };
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' };
const inp = { padding: 10, borderRadius: 6, border: '1px solid #ccc' };
const btn = { padding: '10px 14px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' };
const linkBtn = { background: 'none', border: 'none', color: '#2b6cb0', marginTop: 12, width: '100%' };
const msgBox = { padding: 10, background: '#ebf8ff', color: '#2b6cb0', borderRadius: 6, margin: 0 };
