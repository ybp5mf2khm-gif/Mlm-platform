'use client';

import { useEffect } from 'react';

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
  es: {
    dir: 'ltr',
    Logout: 'Cerrar sesión',
    Code: 'Código',
    Available: 'Disponible',
    Pending: 'Pendiente',
    'Products Store': 'Tienda de productos',
    'Buy Now': 'Comprar ahora',
    'Referral Link': 'Enlace de referencia',
    Copy: 'Copiar',
    Copied: 'Copiado',
    Commissions: 'Comisiones',
    Level: 'Nivel',
    PENDING: 'PENDIENTE',
    APPROVED: 'APROBADO',
    'Order paid! Commission added.': '¡Pedido pagado! Comisión añadida.',
  },
};

export default function RootLayout({ children }) {
  useEffect(() => {
    const rawLang = (navigator.language || navigator.userLanguage || 'en').slice(0, 2).toLowerCase();
    const langDict = DICT[rawLang];

    if (!langDict) return;

    document.documentElement.dir = langDict.dir;
    document.documentElement.lang = rawLang;

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

    translateDOM();
    const observer = new MutationObserver(translateDOM);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
