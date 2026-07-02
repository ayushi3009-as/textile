import React, { useState, useEffect } from 'react';
import { Shield, Building, Users, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'microtechnique2026') {
      setIsAuthenticated(true);
      fetchClients();
    } else {
      alert('Invalid super admin password');
    }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/superadmin/clients');
      const data = await response.json();
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '400px' }}>
          <div className="auth-header">
            <div className="auth-logo">
              <Shield size={32} color="#00f2fe" />
            </div>
            <h2>Super Admin</h2>
            <p>Microtechnique Head Login</p>
          </div>
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Master Password</label>
              <div className="input-wrapper">
                <Shield className="input-icon" size={18} />
                <input
                  type="password"
                  placeholder="Enter super admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="auth-button">
              Access Dashboard
            </button>
            <button type="button" className="auth-button" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', marginTop: '10px' }} onClick={() => navigate('/login')}>
              Back to Client Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: '40px', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header className="app-header" style={{ marginBottom: '30px' }}>
        <div className="brand">
          <Shield className="logo-icon" size={28} color="#00f2fe" />
          <h1 className="logo-text">
            Microtechnique <span className="logo-highlight">Super Admin</span>
          </h1>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={logout} title="Logout" style={{ color: 'var(--color-spam)' }}>
            <LogOut size={20} />
            <span style={{ marginLeft: '8px' }}>Exit Admin</span>
          </button>
        </div>
      </header>

      <div className="glass-panel" style={{ padding: '20px' }}>
        <div className="panel-header" style={{ marginBottom: '20px' }}>
          <span className="panel-title">
            <Building size={18} style={{ color: 'var(--color-primary)' }} /> 
            Registered SaaS Companies
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading client data...</div>
        ) : (
          <div className="logs-table-container">
            <table className="logs-table" style={{ fontSize: '15px' }}>
              <thead>
                <tr>
                  <th>Company Info</th>
                  <th>Twilio Number</th>
                  <th>Total Leads Generated</th>
                  <th>Plan Expiration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const expiryDate = new Date(client.plan_expires_at);
                  const isExpired = expiryDate < new Date();
                  
                  return (
                    <tr key={client.id}>
                      <td>
                        <div className="caller-cell">
                          <span className="caller-name">{client.company_name}</span>
                          <span className="caller-company">{client.email}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: '500', fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                          {client.twilio_number || 'No number linked'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={16} color="var(--text-muted)" />
                          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{client.total_leads}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isExpired ? 'var(--color-spam)' : 'var(--text-secondary)' }}>
                          <Clock size={16} />
                          <span>{formatDate(client.plan_expires_at)}</span>
                        </div>
                      </td>
                      <td>
                        {isExpired ? (
                          <span className="badge badge-spam">Expired</span>
                        ) : (
                          <span className="badge badge-vip">Active</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
