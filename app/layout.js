import Script from 'next/script';

export const metadata = {
  title: 'MLM Platform',
  description: 'Marketing Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          .goog-te-banner-frame.skiptranslate,
          .goog-te-gadget-icon,
          #goog-gt-tt,
          .VIpgJd-ZVi9od-ORHb-OEVmcd {
            display: none !important;
          }
          body {
            top: 0px !important;
          }
          .skiptranslate {
            display: none !important;
          }
        `}</style>
      </head>
      <body>
        {/* عنصر الترجمة المخفي */}
        <div id="google_translate_element" style={{ display: 'none' }}></div>

        {children}

        {/* تهيئة ترجمة جوجل التلقائية حسب لغة الهاتف */}
        <Script id="google-translate-config" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false
              }, 'google_translate_element');

              var userLang = (navigator.language || navigator.userLanguage || 'en').split('-')[0];
              if (userLang && userLang !== 'en') {
                var checkExist = setInterval(function() {
                  var select = document.querySelector('.goog-te-combo');
                  if (select) {
                    select.value = userLang;
                    select.dispatchEvent(new Event('change'));
                    clearInterval(checkExist);
                  }
                }, 500);
              }
            }
          `}
        </Script>
        <Script
          src="https://google.com"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
