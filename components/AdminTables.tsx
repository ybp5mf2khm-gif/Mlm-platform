'use client';

interface AdminTablesProps {
  activeTab: string;
  users: any[];
  orders: any[];
  payouts: any[];
  onToggleUser: (id: string, status: string) => void;
  onApproveOrder: (id: string) => void;
  onApprovePayout: (id: string) => void;
}

export default function AdminTables({
  activeTab,
  users,
  orders,
  payouts,
  onToggleUser,
  onApproveOrder,
  onApprovePayout,
}: AdminTablesProps) {
  if (activeTab === 'users') {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-700 border-b">
            <tr>
              <th className="p-3">الاسم</th>
              <th className="p-3">الكود</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-3 font-medium">
                  {u.full_name}
                  <span className="block text-xs text-gray-400">{u.email}</span>
                </td>
                <td className="p-3 font-mono text-blue-600">{u.referral_code}</td>
                <td className="p-3">{u.status}</td>
                <td className="p-3">
                  <button
                    onClick={() => onToggleUser(u.id, u.status)}
                    className="text-xs bg-slate-800 text-white px-3 py-1 rounded"
                  >
                    {u.status === 'ACTIVE' ? 'إيقاف' : 'تفعيل'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeTab === 'orders') {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-700 border-b">
            <tr>
              <th className="p-3">المسوق</th>
              <th className="p-3">المبلغ</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-3">{order.users?.full_name || 'غير معروف'}</td>
                <td className="p-3 font-bold">${order.total_amount}</td>
                <td className="p-3">{order.status}</td>
                <td className="p-3">
                  {order.status !== 'PAID' && (
                    <button
                      onClick={() => onApproveOrder(order.id)}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded"
                    >
                      تأكيد الدفع
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeTab === 'payouts') {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-700 border-b">
            <tr>
              <th className="p-3">المسوق</th>
              <th className="p-3">المبلغ</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.users?.full_name}</td>
                <td className="p-3 font-bold text-green-700">${p.amount}</td>
                <td className="p-3">{p.status}</td>
                <td className="p-3">
                  {p.status === 'PENDING' && (
                    <button
                      onClick={() => onApprovePayout(p.id)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      موافقة
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}
