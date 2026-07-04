import React, { useState, useEffect } from 'react';
import { Shield, Building, Users, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [clients, setClients] = useState([]);
  const [demoRequests, setDemoRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('clients'); // 'clients' or 'requests'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'microtechnique2026') {
      setIsAuthenticated(true);
      fetchClients();
      fetchDemoRequests();
    } else {
      alert('Invalid super admin password');
    }
  };

  const fetchClients = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/superadmin/clients`);
      const data = await response.json();
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDemoRequests = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/superadmin/demo-requests`);
      const data = await response.json();
      setDemoRequests(data);
    } catch (err) {
      console.error(err);
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
        <div className="panel-header" style={{ marginBottom: '20px', display: 'flex', gap: '16px' }}>
          <button 
            onClick={() => setActiveTab('clients')}
            style={{ 
              background: activeTab === 'clients' ? 'var(--color-primary-glow)' : 'transparent',
              color: activeTab === 'clients' ? 'var(--color-primary)' : 'var(--text-secondary)',
              border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
            }}>
            <Building size={18} /> Registered SaaS Companies
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            style={{ 
              background: activeTab === 'requests' ? 'var(--color-lead-glow)' : 'transparent',
              color: activeTab === 'requests' ? 'var(--color-lead)' : 'var(--text-secondary)',
              border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
            }}>
            <Users size={18} /> Demo Requests ({demoRequests.length})
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading data...</div>
        ) : activeTab === 'clients' ? (
          <div className="logs-table-container">
            <table className="logs-table" style={{ fontSize: '15px' }}>
              <thead>
                <tr>
                  <th>Company Info</th>
                  <th>Exotel Virtual Number</th>
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
                          <input 
                            type="date"
                            style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px', fontSize: '11px', marginLeft: '10px' }}
                            onChange={async (e) => {
                              if (!e.target.value) return;
                              try {
                                const API_URL = import.meta.env.VITE_API_URL || '';
                                await fetch(`${API_URL}/api/superadmin/clients/${client.id}/plan`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ newDate: e.target.value })
                                });
                                fetchClients();
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                          />
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
        ) : (
          <div className="logs-table-container">
            <table className="logs-table" style={{ fontSize: '15px' }}>
              <thead>
                <tr>
                  <th>Request Details</th>
                  <th>Contact Info</th>
                  <th>Date Requested</th>
                </tr>
              </thead>
              <tbody>
                {demoRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <div className="caller-cell">
                        <span className="caller-name">{req.name}</span>
                        <span className="caller-company">{req.company}</span>
                      </div>
                    </td>
                    <td>
                      <div className="caller-cell">
                        <span className="caller-name">{req.email}</span>
                        <span className="caller-company">{req.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                        <Clock size={16} />
                        <span>{formatDate(req.created_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {demoRequests.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No demo requests yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
