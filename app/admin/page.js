'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import AdminStats from '../../components/AdminStats';
import AdminTables from '../../components/AdminTables';
import AdminProducts from '../../components/AdminProducts';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    initAdmin();
  }, []);

  async function initAdmin() {
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      setAuthError('يجب تسجيل الدخول أولاً من الصفحة الرئيسية');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profile?.role !== 'ADMIN') {
      setAuthError('هذا الحساب ليس لديه صلاحية ADMIN');
      setLoading(false);
      return;
    }

    await loadData();
    setLoading(false);
  }

  async function loadData() {
    const u = await supabase.from('users').select('*').order('created_at', { ascending: false });
    const o = await supabase.from('orders').select('*, users(full_name, email)').order('created_at', { ascending: false });
    const p = await supabase.from('withdrawals').select('*, users(full_name, email)').order('created_at', { ascending: false });
    const prod = await supabase.from('products').select('*').order('created_at', { ascending: false });

    if (u.data) setUsers(u.data);
    if (o.data) setOrders(o.data);
    if (p.data) setPayouts(p.data);
    if (prod.data) setProducts(prod.data);
  }

  async function handleToggleUser(id, status) {
    const nextStatus = status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await supabase.from('users').update({ status: nextStatus }).eq('id', id);
    loadData();
  }

  async function handleApproveOrder(id) {
    await supabase.from('orders').update({ status: 'PAID' }).eq('id', id);
    loadData();
  }

  async function handleApprovePayout(id) {
    await supabase.from('withdrawals').update({ status: 'APPROVED' }).eq('id', id);
    loadData();
  }

  if (loading) return <div style={{ padding: '80px 20px', textAlign: 'center', fontWeight: 'bold' }}>جاري التحميل...</div>;

  if (authError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }} dir="rtl">
        <p style={{ color: '#dc2626', fontWeight: 'bold', marginBottom: '16px' }}>{authError}</p>
        <button onClick={() => router.push('/')} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px' }}>
          العودة للصفحة الرئيسية
        </button>
      </div>
    );
  }

  const pendingCount = payouts.filter((p) => p.status === 'PENDING').length;

  const getTabStyle = (tabName) => ({
    padding: '8px 14px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '13px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    backgroundColor: activeTab === tabName ? '#2563eb' : '#ffffff',
    color: activeTab === tabName ? '#ffffff' : '#374151',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', paddingTop: '75px', paddingBottom: '30px' }} dir="rtl">
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '14px 16px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>لوحة تحكم الإدارة</h1>
          <button onClick={() => router.push('/')} style={{ backgroundColor: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>
            العودة للرئيسية
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px' }}>
          <button onClick={() => setActiveTab('overview')} style={getTabStyle('overview')}>الإحصائيات</button>
          <button onClick={() => setActiveTab('products')} style={getTabStyle('products')}>المنتجات ({products.length})</button>
          <button onClick={() => setActiveTab('users')} style={getTabStyle('users')}>المسوقين ({users.length})</button>
          <button onClick={() => setActiveTab('orders')} style={getTabStyle('orders')}>الطلبات ({orders.length})</button>
          <button onClick={() => setActiveTab('payouts')} style={getTabStyle('payouts')}>السحوبات ({pendingCount})</button>
        </div>

        {activeTab === 'overview' && (
          <AdminStats usersCount={users.length} ordersCount={orders.length} pendingPayouts={pendingCount} />
        )}

        {activeTab === 'products' && (
          <AdminProducts products={products} onRefresh={loadData} />
        )}

        {(activeTab === 'users' || activeTab === 'orders' || activeTab === 'payouts') && (
          <AdminTables
            activeTab={activeTab}
            users={users}
            orders={orders}
            payouts={payouts}
            onToggleUser={handleToggleUser}
            onApproveOrder={handleApproveOrder}
            onApprovePayout={handleApprovePayout}
          />
        )}
      </div>
    </div>
  );
}
