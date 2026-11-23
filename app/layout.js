export const metadata = {
  import Script from 'next/script';

  title: 'منصة التسويق بالعمولة',
  description: 'نظام إدارة الفريق والعمولات والمحفظة',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f4f6f8', margin: 0, padding: '16px', color: '#1a202c' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
