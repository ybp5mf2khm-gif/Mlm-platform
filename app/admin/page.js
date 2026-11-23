'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminStats from '@/components/AdminStats';
import AdminTables from '@/components/AdminTables';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  useEffect(() => {
    initAdmin();
  }, []);

  async function initAdmin() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push('/login');

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'ADMIN') {
      return router.push('/dashboard');
    }

    await loadData();
    setLoading(false);
  }

  async function loadData() {
    const { data: u } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    const { data: o } = await supabase.from('orders').select('*, users(full_name, email)').order('created_at', { ascending: false });
    const { data: p } = await supabase.from('withdrawals').select('*, users(full_name, email)').order('created_at', { ascending: false });

    if (u) setUsers(u);
    if (o) setOrders(o);
    if (p) setPayouts(p);
  }

  async function handleToggleUser(id: string, status: string) {
    const nextStatus = status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await supabase.from('users').update({ status: nextStatus }).eq('id', id);
    loadData();
  }

  async function handleApproveOrder(id: string) {
    await supabase.from('orders').update({ status: 'PAID' }).eq('id', id);
    loadData();
  }

  async function handleApprovePayout(id: string) {
    await supabase.from('withdrawals').update({ status: 'APPROVED' }).eq('id', id);
    loadData();
  }

  if (loading) {
    return <div className="p-10 text-center font-bold">جاري التحميل...</div>;
  }

  const pendingCount = payouts.filter((p) => p.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gray-100 text-right" dir="rtl">
      <header className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">لوحة تحكم الإدارة</h1>
        <button onClick={() => router.push('/dashboard')} className="text-xs bg-slate-700 px-3 py-1.5 rounded">
          العودة
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {[
            { id: 'overview', label: 'الإحصائيات' },
            { id: 'users', label: `المسوقين (${users.length})` },
            { id: 'orders', label: `الطلبات (${orders.length})` },
            { id: 'payouts', label: `السحوبات (${pendingCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <AdminStats
            usersCount={users.length}
            ordersCount={orders.length}
            pendingPayouts={pendingCount}
          />
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
