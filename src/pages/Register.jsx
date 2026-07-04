import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { UserPlus, PhoneCall } from 'lucide-react';

export default function Register() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twilioNumber, setTwilioNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan') || null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, email, password, twilioNumber, planId })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      if (data.paymentRequired || data.verificationPending) {
        navigate('/payment', { state: { client: data.client } });
      } else {
        localStorage.setItem('saas_token', data.token);
        localStorage.setItem('saas_client', JSON.stringify(data.client));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <p className="auth-subtitle">REGISTRATION DETAILS</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Company Name</label>
            <input 
              type="text" 
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="auth-input"
              placeholder="Acme Corp"
            />
          </div>
          
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

          <div className="auth-field">
            <label className="auth-label">Exotel Virtual Phone Number (For your AI)</label>
            <input 
              type="text" 
              required
              value={twilioNumber}
              onChange={(e) => setTwilioNumber(e.target.value)}
              className="auth-input"
              placeholder="+1234567890"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            <UserPlus size={18} />
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
