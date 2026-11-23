'use client';

import { useEffect } from 'react';
import { translations, getBrowserLang } from '../lib/i18n';

export default function RootLayout({ children }) {
  useEffect(() => {
    const lang = getBrowserLang();
    const dict = translations[lang] || translations.en;

    // ضبط اتجاه الصفحة تلقائياً (يمين لليسار للعربية، ويسار لليمين لباقي اللغات)
    document.documentElement.dir = dict.dir;
    document.documentElement.lang = lang;

    // دالة ترجمة النصوص في الصفحة تلقائياً
    const translatePage = () => {
      if (lang === 'en') return;

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while ((node = walker.nextNode())) {
        let text = node.nodeValue;
        if (!text || !text.trim()) continue;

        Object.keys(dict).forEach((key) => {
          if (key === 'dir') return;
          if (text.includes(key)) {
            text = text.replace(new RegExp(key, 'g'), dict[key]);
          }
        });

        if (node.nodeValue !== text) {
          node.nodeValue = text;
        }
      }
    };

    // تشغيل الترجمة عند التحميل وعند أي تحديث في الصفحة
    translatePage();
    const observer = new MutationObserver(translatePage);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
