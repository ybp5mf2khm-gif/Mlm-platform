'use client';

export default function AdminTables({
  activeTab,
  users,
  orders,
  payouts,
  onToggleUser,
  onApproveOrder,
  onProcessPayout,
}) {
  const boxStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    overflowX: 'auto',
    border: '1px solid #e5e7eb',
  };

  const thStyle = { padding: '12px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '13px', textAlign: 'right' };
  const tdStyle = { padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' };

  if (activeTab === 'users') {
    return (
      <div style={boxStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>الاسم</th>
              <th style={thStyle}>الكود</th>
              <th style={thStyle}>الحالة</th>
              <th style={thStyle}>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 'bold' }}>{u.full_name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{u.email}</div>
                </td>
                <td style={{ ...tdStyle, color: '#2563eb', fontFamily: 'monospace' }}>{u.referral_code}</td>
                <td style={tdStyle}>{u.status}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => onToggleUser(u.id, u.status)}
                    style={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}
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
      <div style={boxStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>المسوق</th>
              <th style={thStyle}>المبلغ</th>
              <th style={thStyle}>الحالة</th>
              <th style={thStyle}>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={tdStyle}>{order.users?.full_name || 'غير معروف'}</td>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{order.total_amount} MAD</td>
                <td style={tdStyle}>{order.status}</td>
                <td style={tdStyle}>
                  {order.status !== 'PAID' && (
                    <button
                      onClick={() => onApproveOrder(order.id)}
                      style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}
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
      <div style={boxStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>المسوق</th>
              <th style={thStyle}>المبلغ والمحفظة</th>
              <th style={thStyle}>الحالة</th>
              <th style={thStyle}>إجراء</th>
            </tr>
          </thead>
          <tbody>
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ ...tdStyle, textAlign: 'center', color: '#64748b' }}>لا توجد طلبات سحب حالياً</td>
              </tr>
            ) : (
              payouts.map((p) => {
                const walletAddr = p.account_info?.wallet || '';
                const network = p.account_info?.network || p.method || '';
                return (
                  <tr key={p.id}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 'bold' }}>{p.users?.full_name || 'مسوق'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{p.users?.email}</div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 'bold', color: '#15803d' }}>{p.amount} USDT</div>
                      <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 'bold' }}>{network}</div>
                      {walletAddr && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span style={{ fontSize: '11px', fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                            {walletAddr.slice(0, 8)}...{walletAddr.slice(-6)}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(walletAddr);
                              alert('تم نسخ عنوان المحفظة: ' + walletAddr);
                            }}
                            style={{ backgroundColor: '#e2e8f0', border: 'none', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                          >
                            نسخ
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>{p.status}</td>
                    <td style={tdStyle}>
                      {p.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => onProcessPayout(p.id, 'PAID')}
                            style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            تم التحويل
                          </button>
                          <button
                            onClick={() => onProcessPayout(p.id, 'REJECTED')}
                            style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            رفض
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
}
