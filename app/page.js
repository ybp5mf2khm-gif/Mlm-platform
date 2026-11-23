'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import MemberTree from '../components/MemberTree';
import MemberStore from '../components/MemberStore';
import MemberWithdraw from '../components/MemberWithdraw';

const e = React.createElement;

export default function Home() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [team, setTeam] = useState([]);
  const [products, setProducts] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) { setSponsorCode(ref.toUpperCase()); setIsSignUp(true); }
    checkUser().finally(() => clearTimeout(timer));
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setLoading(false);
        await loadData(session.user.id);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function loadData(uid) {
    try {
      const { data: u } = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
      if (u) setProfile(u);
      const { data: w } = await supabase.from('wallets').select('*').eq('user_id', uid).maybeSingle();
      if (w) setWallet(w);
      const { data: cl } = await supabase.from('user_closure').select('depth, descendant_id').eq('ancestor_id', uid).gt('depth', 0).lte('depth', 3);
      if (cl && cl.length > 0) {
        const ids = cl.map((c) => c.descendant_id);
        const { data: m } = await supabase.from('users').select('id, full_name, sponsor_id, referral_code, status').in('id', ids);
        setTeam(cl.map((c) => {
          const member = m?.find((x) => x.id === c.descendant_id);
          return { id: c.descendant_id, depth: c.depth, name: member?.full_name || 'Member', sponsor_id: member?.sponsor_id || null, referral_code: member?.referral_code || '', status: member?.status || '' };
        }));
      } else { setTeam([]); }
      const { data: p } = await supabase.from('products').select('*').eq('is_active', true);
      if (p) setProducts(p);
      const { data: cm } = await supabase.from('commissions').select('*').eq('beneficiary_id', uid).order('created_at', { ascending: false });
      if (cm) setCommissions(cm);
      const { data: py } = await supabase.from('payouts').select('*').eq('user_id', uid).order('created_at', { ascending: false });
      if (py) setPayouts(py);
    } catch (err) { console.error(err); }
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
  const tabStyle = (name) => ({ padding: '8px 14px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 'bold', whiteSpace: 'nowrap', cursor: 'pointer', background: activeTab === name ? '#2b6cb0' : '#fff', color: activeTab === name ? '#fff' : '#4a5568', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' });

  return e('div', { style: col },
    e('div', { style: { ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      e('div', null, e('h3', { style: { margin: 0 } }, profile?.full_name), e('small', null, 'Code: ', e('b', null, profile?.referral_code))),
      e('button', { onClick: logout, style: { ...btn, background: '#e53e3e' } }, 'Logout')
    ),
    message ? e('p', { style: msgBox }, message) : null,
    e('div', { style: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 } },
      e('button', { onClick: () => setActiveTab('overview'), style: tabStyle('overview') }, 'Overview'),
      e('button', { onClick: () => setActiveTab('store'), style: tabStyle('store') }, 'Store (' + products.length + ')'),
      e('button', { onClick: () => setActiveTab('tree'), style: tabStyle('tree') }, 'My Tree (' + team.length + ')'),
      e('button', { onClick: () => setActiveTab('withdraw'), style: tabStyle('withdraw') }, 'Withdraw')
    ),
    activeTab === 'overview' ? e('div', { style: col },
      e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
        e('div', { style: card }, e('small', null, 'Available'), e('h2', { style: { margin: '5px 0', color: '#2f855a' } }, wallet?.available_balance || '0.00')),
        e('div', { style: card }, e('small', null, 'Pending'), e('h2', { style: { margin: '5px 0', color: '#d69e2e' } }, wallet?.pending_balance || '0.00'))
      ),
      e('div', { style: card },
        e('h4', { style: { marginTop: 0 } }, 'Referral Link'),
        e('div', { style: { display: 'flex', gap: 8 } },
          e('input', { readOnly: true, value: refUrl, style: { ...inp, flex: 1 } }),
          e('button', { onClick: () => { navigator.clipboard.writeText(refUrl); setMessage('Copied!'); }, style: btn }, 'Copy')
        )
      ),
      e('div', { style: card },
        e('h4', { style: { marginTop: 0 } }, 'Commissions (' + commissions.length + ')'),
        commissions.map((c) => e('div', { key: c.id, style: row }, e('span', null, 'Level ' + c.level + ' (' + (Number(c.rate) * 100) + '%)'), e('b', { style: { color: '#2f855a' } }, '+' + c.amount + ' (' + c.status + ')')))
      )
    ) : null,
    activeTab === 'store' ? e(MemberStore, { user, products, onSuccess: () => loadData(user.id), setMessage }) : null,
    activeTab === 'tree' ? e(MemberTree, { user, profile, team }) : null,
    activeTab === 'withdraw' ? e(MemberWithdraw, { user, payouts, onSuccess: () => loadData(user.id), setMessage }) : null
  );
}

const card = { background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const col = { display: 'flex', flexDirection: 'column', gap: 12 };
const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' };
const inp = { padding: 10, borderRadius: 6, border: '1px solid #ccc' };
const btn = { padding: '10px 14px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' };
const linkBtn = { background: 'none', border: 'none', color: '#2b6cb0', marginTop: 12, width: '100%' };
const msgBox = { padding: 10, background: '#ebf8ff', color: '#2b6cb0', borderRadius: 6, margin: 0 };
