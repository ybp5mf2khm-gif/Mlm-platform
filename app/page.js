'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
    if (ref) {
      setSponsorCode(ref.toUpperCase());
      setIsSignUp(true);
    }
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadData(session.user.id);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadData(uid) {
    const { data: u } = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
    if (u) setProfile(u);

    const { data: w } = await supabase.from('wallets').select('*').eq('user_id', uid).maybeSingle();
    if (w) setWallet(w);

    const { data: cl } = await supabase
      .from('user_closure')
      .select('depth, descendant_id')
      .eq('ancestor_id', uid)
      .gt('depth', 0)
      .lte('depth', 3);

    if (cl && cl.length > 0) {
      const ids = cl.map((c) => c.descendant_id);
      const { data: m } = await supabase.from('users').select('id, full_name').in('id', ids);
      setTeam(cl.map((c) => ({
        depth: c.depth,
        name: m?.find((x) => x.id === c.descendant_id)?.full_name || 'Member'
      })));
    } else {
      setTeam([]);
    }

    const { data: p } = await supabase.from('products').select('*').eq('is_active', true);
    if (p) setProducts(p);

    const { data: cm } = await supabase
      .from('commissions')
      .select('*')
      .eq('beneficiary_id', uid)
      .order('created_at', { ascending: false });
    if (cm) setCommissions(cm);

    const { data: py } = await supabase
      .from('payouts')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (py) setPayouts(py);
  }

  async function confirmUsdtOrder(e) {
    e.preventDefault();
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
      unit_pv: selectedProduct.pv
    });

    setMessage('Payment submitted! Waiting for admin approval.');
    setSelectedProduct(null);
    setTxHash('');
    await loadData(user.id);
    setBuyingId(null);
  }

  async function handleAuth(e) {
    e.preventDefault();
    setMessage('Loading...');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, sponsor_code: sponsorCode } }
      });
      if (error) setMessage('Error: ' + error.message);
      else {
        setMessage('Account created!');
        checkUser();
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage('Error: ' + error.message);
      else {
        setMessage('');
        checkUser();
      }
    }
  }

  async function handlePayout(e) {
    e.preventDefault();
    const trimmedWallet = accountDetails.trim();
    const isValidTRC20 = withdrawNetwork === 'TRC20' && /^T[a-zA-Z0-9]{33}$/.test(trimmedWallet);
    const isValidBEP20 = withdrawNetwork === 'BEP20' && /^0x[a-fA-F0-9]{40}$/.test(trimmedWallet);

    if (!isValidTRC20 && !isValidBEP20) {
      setMessage(`Error: Invalid ${withdrawNetwork} wallet address`);
      return;
    }

    setMessage('Sending request...');
    const { error } = await supabase.rpc('request_payout', {
      p_user_id: user.id,
      p_amount: parseFloat(withdrawAmount),
      p_method: `USDT (${withdrawNetwork})`,
      p_account_info: { network: withdrawNetwork, wallet: trimmedWallet }
    });

    if (error) setMessage('Error: ' + error.message);
    else {
      setMessage('Payout requested!');
      setWithdrawAmount('');
      setAccountDetails('');
      await loadData(user.id);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  if (loading) return <p style={{ textAlign: 'center', marginTop: 40 }}>Loading...</p>;

  if (!user) {
    return (
      <div style={card}>
        <h2>{isSignUp ? 'Sign Up' : 'Login'}</h2>
        {message && <p style={msgBox}>{message}</p>}
        <form onSubmit={handleAuth} style={col}>
          {isSignUp && (
            <>
              <input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={inp} />
              <input placeholder="Sponsor Code" value={sponsorCode} onChange={(e) => setSponsorCode(e.target.value.toUpperCase())} style={inp} />
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inp} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inp} />
          <button type="submit" style={btn}>{isSignUp ? 'Register' : 'Sign In'}</button>
        </form>
        <button onClick={() => setIsSignUp(!isSignUp)} style={linkBtn}>
          {isSignUp ? 'Already have an account? Login' : 'Create new account'}
        </button>
      </div>
    );
  }

  const refUrl = typeof window !== 'undefined' ? `${window.location.origin}/?ref=${profile?.referral_code || ''}` : '';

  return (
    <div style={col}>
      <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>{profile?.full_name}</h3>
          <small>Code: <b>{profile?.referral_code}</b></small>
        </div>
        <button onClick={logout} style={{ ...btn, background: '#e53e3e' }}>Logout</button>
      </div>

      {message && <p style={msgBox}>{message}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={card}>
          <small>Available</small>
          <h2 style={{ margin: '5px 0', color: '#2f855a' }}>{wallet?.available_balance || '0.00'}</h2>
        </div>
        <div style={card}>
          <small>Pending</small>
          <h2 style={{ margin: '5px 0', color: '#d69e2e' }}>{wallet?.pending_balance || '0.00'}</h2>
        </div>
      </div>

      <div style={card}>
        <h4 style={{ marginTop: 0 }}>Products Store</h4>
        {products.map((p) => (
          <div key={p.id} style={row}>
            <div>
              <b>{p.name}</b>
              <div style={{ fontSize: 12, color: '#666' }}>{p.price} MAD | {p.pv} PV</div>
            </div>
            <button onClick={() => setSelectedProduct(p)} style={{ ...btn, background: '#38a169' }}>
              Buy Now
            </button>
          </div>
        ))}

        {selectedProduct && (
          <div style={{ marginTop: 14, padding: 14, background: '#f7fafc', borderRadius: 8, border: '1px solid #cbd5e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <b>Pay with USDT: {selectedProduct.name}</b>
              <button onClick={() => setSelectedProduct(null)} style={{ background: 'none', border: 'none', color: '#e53e3e', fontWeight: 'bold', cursor: 'pointer' }}>X</button>
            </div>

            <form onSubmit={confirmUsdtOrder} style={col}>
              <select value={payNetwork} onChange={(e) => setPayNetwork(e.target.value)} style={inp}>
                <option value="TRC20">Network: USDT (TRC20)</option>
                <option value="BEP20">Network: USDT (BEP20)</option>
              </select>

              <div style={{ display: 'flex', gap: 6 }}>
                <input readOnly value={ADMIN_WALLETS[payNetwork]} style={{ ...inp, flex: 1, fontSize: 12, background: '#edf2f7' }} />
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(ADMIN_WALLETS[payNetwork]); setMessage('Wallet Copied!'); }}
                  style={btn}
                >
                  Copy
                </button>
              </div>

              <input
Use code with caution.
placeholder="Transaction Hash (TxID)"
value={txHash}
onChange={(e) => setTxHash(e.target.value)}
required
style={inp}
/>
<button type="submit" disabled={buyingId === selectedProduct.id} style={{ ...btn, background: '#38a169' }}>
{buyingId === selectedProduct.id ? '...' : 'Confirm Payment'}



)}
<h4 style={{ marginTop: 0 }}>Referral Link
<div style={{ display: 'flex', gap: 8 }}>
<input readOnly value={refUrl} style={{ ...inp, flex: 1 }} />
<button onClick={() => { navigator.clipboard.writeText(refUrl); setMessage('Copied!'); }} style={btn}>Copy

<h4 style={{ marginTop: 0 }}>Commissions ({commissions.length})
{commissions.map((c) => (

Level {c.level} ({Number(c.rate) * 100}%)
<b style={{ color: '#2f855a' }}>+{c.amount} ({c.status})

))}
<h4 style={{ marginTop: 0 }}>Withdraw (USDT)

<select value={withdrawNetwork} onChange={(e) => setWithdrawNetwork(e.target.value)} style={inp}>
USDT - Tron (TRC20)
USDT - BNB Smart Chain (BEP20)

<input
type="number"
step="0.01"
placeholder="Amount"
value={withdrawAmount}
onChange={(e) => setWithdrawAmount(e.target.value)}
required
style={inp}
/>
<input
placeholder={withdrawNetwork === 'TRC20' ? 'USDT TRC20 Address (T...)' : 'USDT BEP20 Address (0x...)'}
value={accountDetails}
onChange={(e) => setAccountDetails(e.target.value)}
required
style={inp}
/>
Request Payout
{payouts.length > 0 && (
<div style={{ marginTop: 12 }}>
<small style={{ color: '#666' }}>Payout History ({payouts.length})
{payouts.map((py) => (

{py.amount} ({py.method})
{py.status}

))}

)}
<h4 style={{ marginTop: 0 }}>My Team ({team.length})
{team.map((t, i) => (

{t.name}
Level {t.depth}

))}


);
}
const card = { background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const col = { display: 'flex', flexDirection: 'column', gap: 12 };
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' };
const inp = { padding: 10, borderRadius: 6, border: '1px solid #ccc' };
const btn = { padding: '10px 14px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' };
const linkBtn = { background: 'none', border: 'none', color: '#2b6cb0', marginTop: 12, width: '100%' };
const msgBox = { padding: 10, background: '#ebf8ff', color: '#2b6cb0', borderRadius: 6, margin: 0 };
