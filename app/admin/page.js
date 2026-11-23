'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import AdminStats from '../../components/AdminStats';
import AdminTables from '../../components/AdminTables';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payouts, setPayouts] = useState([]);

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

    if (u.data) setUsers(u.data);
    if (o.data) setOrders(o.data);
    if (p.data) setPayouts(p.data);
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

  if (loading) return <div className="p-10 text-center font-bold">جاري التحميل...</div>;

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center" dir="rtl">
        <p className="text-red-600 font-bold text-lg mb-4">{authError}</p>
        <button onClick={() => router.push('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
          العودة للصفحة الرئيسية وتسجيل الدخول
        </button>
      </div>
    );
  }

  const pendingCount = payouts.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gray-100 text-right" dir="rtl">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">لوحة تحكم الإدارة</h1>
        <button onClick={() => router.push('/')} className="text-xs bg-slate-700 px-3 py-1.5 rounded">
          العودة للرئيسية
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
            الإحصائيات
          </button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
            المسوقين ({users.length})
          </button>
          <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
            الطلبات ({orders.length})
          </button>
          <button onClick={() => setActiveTab('payouts')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'payouts' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
            السحوبات ({pendingCount})
          </button>
        </div>

        {activeTab === 'overview' ? (
          <AdminStats usersCount={users.length} ordersCount={orders.length} pendingPayouts={pendingCount} />
        ) : (
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
      </main>
    </div>
  );
}
