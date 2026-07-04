import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, PhoneCall } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.verificationPending) {
          setError(data.error);
          return;
        }
        if (data.paymentRequired) {
          navigate('/payment', { state: { client: data.client } });
          return;
        }
        throw new Error(data.error);
      }
      
      localStorage.setItem('saas_token', data.token);
      localStorage.setItem('saas_client', JSON.stringify(data.client));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <PhoneCall size={28} className="auth-icon" />
          </div>
          <h1 className="auth-title">Micro Technique AI</h1>
          <p className="auth-subtitle">SECURE LOGIN</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="you@company.com"
            />
          </div>
          
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="auth-button"
          >
            <LogIn size={18} />
            Sign In
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </p>
        <p style={{ marginTop: '10px', fontSize: '11px', textAlign: 'center' }}>
          <a href="/superadmin" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Microtechnique Admin Login</a>
        </p>
      </div>
    </div>
  );
}
