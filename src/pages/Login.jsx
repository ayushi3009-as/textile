import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, PhoneCall, Eye, EyeOff, KeyRound } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassMode, setForgotPassMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
          navigate('/payment', { state: { client: data.client, rejected: data.rejected } });
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address first to reset password.");
      return;
    }
    setError('');
    setIsLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setOtpSent(true);
      alert(`A 6-digit OTP has been sent to ${email}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setError("Please enter both OTP and a new password.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      
      alert("Password reset successful! You can now login with your new password.");
      setForgotPassMode(false);
      setOtpSent(false);
      setPassword('');
      setNewPassword('');
      setOtp('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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

        {!forgotPassMode ? (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="auth-label">Password</label>
                <span 
                  onClick={() => setForgotPassMode(true)}
                  style={{ fontSize: '12px', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '500' }}
                >
                  Forgot Password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  placeholder="••••••••"
                  style={{ paddingRight: '40px' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ 
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-button">
              <LogIn size={18} />
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleVerifyOtp : handleForgotPassword} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email to send OTP</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="you@company.com"
                disabled={otpSent}
              />
            </div>

            {otpSent && (
              <>
                <div className="auth-field">
                  <label className="auth-label">Enter 6-Digit OTP</label>
                  <input 
                    type="text" 
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="auth-input"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
                <div className="auth-field">
                  <label className="auth-label">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="auth-input"
                    placeholder="Enter new password"
                    minLength={8}
                  />
                </div>
              </>
            )}

            <button type="submit" className="auth-button" disabled={isLoading}>
              <KeyRound size={18} />
              {isLoading ? 'Processing...' : (otpSent ? 'Verify OTP & Reset' : 'Send OTP via Email')}
            </button>
            <button 
              type="button" 
              onClick={() => { setForgotPassMode(false); setOtpSent(false); setError(''); }}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '12px', background: 'transparent' }}
            >
              Back to Login
            </button>
          </form>
        )}

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
