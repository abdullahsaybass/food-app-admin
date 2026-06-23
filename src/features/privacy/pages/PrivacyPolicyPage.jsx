// src/features/privacy/pages/PrivacyPolicyPage.jsx
// Route: /privacy-policy — standalone, no sidebar, no footer

import styles from './PrivacyPolicyPage.module.css';

const LAST_UPDATED = 'June 22, 2026';

const sections = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: 'Information We Collect',
    content: 'We collect information that you provide directly to us when you create an account, place an order, or contact us.',
    checks: ['Name', 'Email Address', 'Phone Number', 'Delivery Address', 'Order Information', 'Payment Information (if applicable)'],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    title: 'How We Use Your Information',
    content: 'We use the information we collect for the following purposes:',
    checks: [
      'To process and deliver your orders',
      'To provide customer support',
      'To improve our services and user experience',
      'To send order updates and promotional offers (if you opt-in)',
    ],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    title: 'Data Security',
    content: 'We implement reasonable security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.',
    checks: [],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'Sharing of Information',
    content: 'We do not sell your personal information to third parties. Your information may be shared only with:',
    checks: [
      'Delivery partners (for order delivery)',
      'Trusted service providers (for payment processing, analytics, etc.)',
    ],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
      </svg>
    ),
    title: 'Cookies',
    content: 'Our website and app may use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content.',
    checks: [],
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: 'Your Rights',
    content: 'You have the right to access, correct, update, or delete your personal information. You can contact us anytime for any privacy-related requests.',
    checks: [],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.root}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Your Privacy Matters
          </div>
          <h1 className={styles.heroTitle}>Privacy Policy</h1>
          <p className={styles.heroDesc}>
            At <strong>VFresh</strong>, we value your trust and are committed to protecting your personal
            information. This Privacy Policy explains how we collect, use, and safeguard your data.
          </p>
          <div className={styles.heroDate}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Last Updated: <span>{LAST_UPDATED}</span>
          </div>
        </div>
        <div className={styles.heroRight}>
          {/* Shield illustration */}
          <div className={styles.shieldWrap}>
            <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" className={styles.shieldSvg}>
              {/* Outer glow circle */}
              <circle cx="100" cy="105" r="88" fill="#e8f5e9" opacity="0.7"/>
              {/* Shield body */}
              <path d="M100 20 L168 50 L168 110 C168 155 100 190 100 190 C100 190 32 155 32 110 L32 50 Z"
                fill="url(#shieldGrad)" filter="url(#shadow)"/>
              <defs>
                <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1a8a6e"/>
                  <stop offset="100%" stopColor="#0F6E56"/>
                </linearGradient>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0F6E56" floodOpacity="0.25"/>
                </filter>
              </defs>
              {/* Lock icon */}
              <rect x="80" y="95" width="40" height="32" rx="5" fill="white" opacity="0.95"/>
              <path d="M88 95 L88 87 C88 78 112 78 112 87 L112 95" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"/>
              <circle cx="100" cy="111" r="5" fill="#0F6E56"/>
              <rect x="98" y="111" width="4" height="8" rx="2" fill="#0F6E56"/>
              {/* Leaves */}
              <ellipse cx="148" cy="58" rx="14" ry="7" fill="#4CAF50" opacity="0.8" transform="rotate(-30 148 58)"/>
              <ellipse cx="162" cy="72" rx="12" ry="6" fill="#66BB6A" opacity="0.7" transform="rotate(-50 162 72)"/>
              <ellipse cx="52" cy="60" rx="13" ry="6" fill="#4CAF50" opacity="0.7" transform="rotate(30 52 60)"/>
              {/* Checkmark */}
              <polyline points="85,107 97,119 118,98" fill="none" stroke="#0F6E56" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── Cards grid ── */}
      <section className={styles.grid}>
        {sections.map((s, i) => (
          <div key={s.title} className={styles.card}>
            <div className={styles.cardIcon}>{s.icon}</div>
            <div className={styles.cardNum}>{i + 1}. {s.title}</div>
            <div className={styles.cardDivider} />
            <p className={styles.cardText}>{s.content}</p>
            {s.checks.length > 0 && (
              <ul className={styles.checkList}>
                {s.checks.map((c) => (
                  <li key={c} className={styles.checkItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {/* Contact card — full width */}
        <div className={`${styles.card} ${styles.contactCard}`}>
          <div className={styles.cardIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <div className={styles.cardNum}>7. Contact Us</div>
          <div className={styles.cardDivider} />
          <p className={styles.cardText}>If you have any questions about this Privacy Policy, please contact us:</p>
          <div className={styles.contactRow}>
            <div className={styles.contactItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              vvfresh643@gmail.com
            </div>
            <div className={styles.contactItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
              </svg>
              +960 123 4567
            </div>
            <div className={styles.contactItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
              </svg>
              www.vfresh.mv
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust banner ── */}
      <section className={styles.trustBanner}>
        <div className={styles.trustLeft}>
          <div className={styles.trustShieldIcon}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <polyline points="9 12 11 14 15 10"/>
            </svg>
          </div>
          <div>
            <h3 className={styles.trustTitle}>Your trust is our priority</h3>
            <p className={styles.trustDesc}>We are committed to protecting your privacy and ensuring a safe and seamless shopping experience.</p>
          </div>
        </div>
        <div className={styles.trustRight}>
          {/* Grocery basket illustration */}
          <svg viewBox="0 0 140 100" xmlns="http://www.w3.org/2000/svg" width="140" height="100">
            <rect x="25" y="55" width="90" height="38" rx="8" fill="#0F6E56"/>
            <path d="M35 55 L45 30 L95 30 L105 55Z" fill="#1a8a6e"/>
            <ellipse cx="70" cy="30" rx="25" ry="5" fill="#166e4a"/>
            {/* Veggies */}
            <circle cx="55" cy="45" r="10" fill="#4CAF50"/>
            <circle cx="70" cy="42" r="12" fill="#f44336"/>
            <circle cx="86" cy="45" r="9" fill="#FFEB3B"/>
            <rect x="68" y="28" width="4" height="12" rx="2" fill="#2E7D32"/>
            {/* Banana */}
            <path d="M88 38 Q100 30 105 42" fill="none" stroke="#FFC107" strokeWidth="5" strokeLinecap="round"/>
            {/* Leaf on basket */}
            <ellipse cx="30" cy="68" rx="8" ry="4" fill="#4CAF50" opacity="0.6" transform="rotate(-20 30 68)"/>
            <ellipse cx="110" cy="70" rx="7" ry="3.5" fill="#4CAF50" opacity="0.6" transform="rotate(20 110 70)"/>
          </svg>
        </div>
      </section>

    </div>
  );
}