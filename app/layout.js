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
          .VIpgJd-ZVi9od-ORHb-OEVmcd,
          .skiptranslate {
            display: none !important;
          }
          body {
            top: 0px !important;
          }
        `}</style>
      </head>
      <body>
        <div id="google_translate_element" style={{ display: 'none' }}></div>

        {children}

        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            window.googleTranslateElementInit = function() {
              new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                autoDisplay: false
              }, 'google_translate_element');

              var rawLang = navigator.language || navigator.userLanguage || 'en';
              var userLang = rawLang.split('-')[0].toLowerCase();

              if (userLang && userLang !== 'en') {
                var attempts = 0;
                var checkExist = setInterval(function() {
                  var select = document.querySelector('.goog-te-combo');
                  if (select) {
                    select.value = userLang;
                    select.dispatchEvent(new Event('change'));
                    clearInterval(checkExist);
                  }
                  attempts++;
                  if (attempts > 20) clearInterval(checkExist);
                }, 500);
              }
            };
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
