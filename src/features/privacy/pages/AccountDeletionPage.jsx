// src/features/privacy/pages/AccountDeletionPage.jsx
// Route: /account-deletion — standalone, no sidebar, no AuthGuard

import styles from './AccountDeletionPage.module.css';

export default function AccountDeletionPage() {
  return (
    <div className={styles.root}>
      <div className={styles.container}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Account Deletion Request</h1>
          <p className={styles.pageSub}>Delete Your Vfresh Account</p>
        </div>

        <p className={styles.intro}>
          Thank you for using Vfresh. You can request deletion of your account and associated
          personal data by contacting us using the details below.
        </p>

        {/* ── 1 ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>1. How to Request Account Deletion</h2>
          <p className={styles.para}>Send an email to:</p>
          <div className={styles.emailBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <a href="mailto:vvfresh643@gmail.com">vvfresh643@gmail.com</a>
          </div>
          <p className={styles.para}>
            <strong>Subject:</strong> Account Deletion Request
          </p>
          <p className={styles.para}>Please include the following in your email:</p>
          <ul className={styles.list}>
            <li>Your registered email address</li>
            <li>Your phone number (if applicable)</li>
            <li>Your account name</li>
          </ul>
        </div>

        {/* ── 2 ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>2. What Data Will Be Deleted</h2>
          <p className={styles.para}>Upon successful verification, we will permanently delete:</p>
          <ul className={styles.list}>
            <li>User account information</li>
            <li>Name, email address, and phone number</li>
            <li>Delivery addresses</li>
            <li>Shopping cart data</li>
            <li>Wishlist data</li>
            <li>Profile information</li>
          </ul>
        </div>

        {/* ── 3 ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Data That May Be Retained</h2>
          <p className={styles.para}>
            Some information may be retained for legal, security, fraud prevention, accounting,
            or regulatory purposes, including:
          </p>
          <ul className={styles.list}>
            <li>Order history</li>
            <li>Transaction records</li>
            <li>Server logs</li>
          </ul>
        </div>

        {/* ── 4 ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>4. Retention Period</h2>
          <p className={styles.para}>
            Account deletion requests are processed within <strong>30 days</strong> of verification.
          </p>
        </div>

        {/* ── 5 ── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Contact Us</h2>
          <div className={styles.contactCard}>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Email</span>
              <a href="mailto:vvfresh643@gmail.com" className={styles.contactValue}>vvfresh643@gmail.com</a>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>App Name</span>
              <span className={styles.contactValue}>Vfresh</span>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Country</span>
              <span className={styles.contactValue}>Republic of Maldives</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}