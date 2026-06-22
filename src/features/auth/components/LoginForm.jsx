// src/features/auth/components/LoginForm.jsx

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './LoginForm.css';

export default function LoginForm() {
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="lf-logo">
        <img src="/src/assets/vfresh.png" alt="VFresh" className="lf-logo-img" />
      </div>

      <h1 className="lf-title">Admin Login</h1>
      <p className="lf-sub">Sign in to manage your store</p>

      {error && <div className="lf-error">{error}</div>}

      <div className="lf-field">
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="admin@vfresh.shop"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
      </div>

      <div className="lf-field">
        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />
      </div>

      <button className="lf-btn" type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}