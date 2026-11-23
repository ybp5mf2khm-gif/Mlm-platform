'use client';

export default function AdminStats({ usersCount, ordersCount, pendingPayouts }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <p className="text-gray-500 text-sm">إجمالي المسوقين</p>
        <p className="text-3xl font-bold text-slate-800 mt-2">{usersCount}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <p className="text-gray-500 text-sm">إجمالي الطلبات</p>
        <p className="text-3xl font-bold text-blue-600 mt-2">{ordersCount}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <p className="text-gray-500 text-sm">طلبات سحب معلقة</p>
        <p className="text-3xl font-bold text-amber-600 mt-2">{pendingPayouts}</p>
      </div>
    </div>
  );
}

