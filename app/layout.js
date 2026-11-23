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
          <div id="google_translate_element" style={{ display: 'none' }}></div>

<Script id="google-translate-init" strategy="afterInteractive">
  {`
    function googleTranslateElementInit() {
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        autoDisplay: false
      }, 'google_translate_element');

      var userLang = (navigator.language || navigator.userLanguage).split('-');
      if (userLang && userLang !== 'en') {
        setTimeout(function() {
          var select = document.querySelector('.goog-te-combo');
          if (select) {
            select.value = userLang;
            select.dispatchEvent(new Event('change'));
          }
        }, 1000);
      }
    }
  `}
</Script>

<Script
  src="https://google.com"
  strategy="afterInteractive"
/>

<style>{`
  .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
  body { top: 0px !important; }
  .skiptranslate { display: none !important; }
`}</style>

    </html>
  );
}
