'use client';
import React from 'react';

const e = React.createElement;

export default function ReferralCard({ refUrl, referralCode, setMessage }) {
  const shareText =
    'Join my team now! Referral Code: ' +
    (referralCode || '') +
    ' - Register here: ' +
    refUrl;

  const waUrl = 'https://wa.me' + encodeURIComponent(shareText);

  async function handleShare(ev) {
    if (typeof navigator !== 'undefined' && navigator.share) {
      ev.preventDefault();
      try {
        await navigator.share({
          title: 'Join My Team',
          text: 'Join my team now! Referral Code: ' + (referralCode || ''),
          url: refUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          window.location.href = waUrl;
        }
      }
    }
  }

  return e(
    'div',
    { style: { background: '#fff', padding: 16, borderRadius: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } },
    e('h4', { style: { marginTop: 0, marginBottom: 10 } }, 'Referral Link'),
    e(
      'div',
      { style: { display: 'flex', gap: 8, marginBottom: 10 } },
      e('input', {
        readOnly: true,
        value: refUrl,
        style: { padding: 10, borderRadius: 6, border: '1px solid #ccc', flex: 1, fontSize: 12 },
      }),
      e(
        'button',
        {
          type: 'button',
          onClick: () => {
            navigator.clipboard.writeText(refUrl);
            setMessage('Copied!');
          },
          style: {
            padding: '10px 14px',
            background: '#2b6cb0',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 'bold',
            cursor: 'pointer',
          },
        },
        'Copy'
      )
    ),
    e(
      'a',
      {
        href: waUrl,
        onClick: handleShare,
        style: {
          display: 'block',
          textAlign: 'center',
          textDecoration: 'none',
          width: '100%',
          boxSizing: 'border-box',
          padding: '10px 14px',
          background: '#25D366',
          color: '#fff',
          borderRadius: 6,
          fontWeight: 'bold',
          fontSize: 14,
        },
      },
      'Share on WhatsApp'
    )
  );
}
