'use client';

export default function AdminStats({ usersCount, ordersCount, pendingPayouts }) {
  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb',
    textAlign: 'center',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
      <div style={cardStyle}>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>إجمالي المسوقين</p>
        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>{usersCount}</p>
      </div>
      <div style={cardStyle}>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>إجمالي الطلبات</p>
        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>{ordersCount}</p>
      </div>
      <div style={cardStyle}>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>طلبات سحب معلقة</p>
        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#d97706', margin: 0 }}>{pendingPayouts}</p>
      </div>
    </div>
  );
}
