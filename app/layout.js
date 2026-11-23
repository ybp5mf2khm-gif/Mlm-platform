'use client';

import { useEffect, useState } from 'react';

const DICT = {
  ar: {
    dir: 'rtl',
    Logout: 'تسجيل الخروج',
    Code: 'الرمز',
    Available: 'الرصيد المتاح',
    Pending: 'قيد الانتظار',
    'Products Store': 'متجر المنتجات',
    'Buy Now': 'اشترِ الآن',
    'Referral Link': 'رابط الإحالة',
    Copy: 'نسخ',
    Copied: 'تم النسخ',
    Commissions: 'العمولات',
    Level: 'المستوى',
    PENDING: 'معلق',
    APPROVED: 'مقبول',
    'Order paid! Commission added.': 'تم دفع الطلب! تمت إضافة العمولة.',
  },
  fr: {
    dir: 'ltr',
    Logout: 'Déconnexion',
    Code: 'Code',
    Available: 'Disponible',
    Pending: 'En attente',
    'Products Store': 'Boutique de produits',
    'Buy Now': 'Acheter',
    'Referral Link': 'Lien de parrainage',
    Copy: 'Copier',
    Copied: 'Copié',
    Commissions: 'Commissions',
    Level: 'Niveau',
    PENDING: 'EN ATTENTE',
    APPROVED: 'APPROUVÉ',
    'Order paid! Commission added.': 'Commande payée ! Commission ajoutée.',
  },
  en: {
    dir: 'ltr',
    Logout: 'Logout',
    Code: 'Code',
    Available: 'Available',
    Pending: 'Pending',
    'Products Store': 'Products Store',
    'Buy Now': 'Buy Now',
    'Referral Link': 'Referral Link',
    Copy: 'Copy',
    Copied: 'Copied',
    Commissions: 'Commissions',
    Level: 'Level',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    'Order paid! Commission added.': 'Order paid! Commission added.',
  },
};

export default function RootLayout({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('app_lang');
    const browserLang = (navigator.language || 'en').slice(0, 2).toLowerCase();
    const initialLang = saved || (DICT[browserLang] ? browserLang : 'en');
    setLang(initialLang);
  }, []);

  useEffect(() => {
    const langDict = DICT[lang] || DICT.en;
    document.documentElement.dir = langDict.dir;
    document.documentElement.lang = lang;

    if (lang === 'en') return;

    const translateDOM = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        let val = node.nodeValue;
        if (!val || !val.trim()) continue;
        for (const [enText, trText] of Object.entries(langDict)) {
          if (enText === 'dir') continue;
          if (val.includes(enText)) {
            val = val.split(enText).join(trText);
          }
        }
        if (node.nodeValue !== val) {
          node.nodeValue = val;
        }
      }
    };

    const timer = setTimeout(translateDOM, 100);
    const observer = new MutationObserver(translateDOM);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [lang]);

  const changeLanguage = (newLang) => {
    localStorage.setItem('app_lang', newLang);
    window.location.reload();
  };

  return (
    <html lang={lang}>
      <body>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px', background: '#f3f4f6' }}>
          <select
            value={lang}
            onChange={(e) => changeLanguage(e.target.value)}
            aria-label="Language"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#111827',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="ar">🌐 العربية</option>
            <option value="fr">🌐 Français</option>
            <option value="en">🌐 English</option>
          </select>
        </div>
        {children}
      </body>
    </html>
  );
}
