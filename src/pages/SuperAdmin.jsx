import React, { useState, useEffect } from 'react';
import { Shield, Building, Users, Clock, LogOut, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuperAdmin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [clients, setClients] = useState([]);
  const [demoRequests, setDemoRequests] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('clients'); // 'clients', 'requests', 'pricing'
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [reviewingClient, setReviewingClient] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'microtechnique2026') {
      setIsAuthenticated(true);
      fetchClients();
      fetchDemoRequests();
      fetchPricingPlans();
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

  const fetchPricingPlans = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/pricing`);
      const data = await response.json();
      setPricingPlans(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewPayment = async (status) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/superadmin/clients/${reviewingClient}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReviewingClient(null);
        setSelectedReceipt(null);
        fetchClients();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePlan = async (id, updatedPlan) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/superadmin/pricing/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}` // assuming token logic or bypass for local
        },
        body: JSON.stringify(updatedPlan)
      });
      if (response.ok) {
        alert('Plan updated successfully!');
        fetchPricingPlans();
      }
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
          <button 
            onClick={() => setActiveTab('pricing')}
            style={{ 
              background: activeTab === 'pricing' ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
              color: activeTab === 'pricing' ? '#a855f7' : 'var(--text-secondary)',
              border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
            }}>
            <Shield size={18} /> Pricing Settings
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
                  <th>Plan Selected</th>
                  <th>Payment Status</th>
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
                        <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                          {client.plan_name || 'No Plan'}
                        </span>
                      </td>
                      <td>
                        {client.payment_status === 'paid' ? (
                          <span className="badge badge-vip">Paid</span>
                        ) : client.payment_status === 'verification_pending' ? (
                          <div>
                            <span className="badge badge-warm" style={{ marginBottom: '5px', display: 'inline-block' }}>Under Review</span>
                            <br />
                            <button 
                              onClick={() => {
                                setReviewingClient(client.id);
                                setSelectedReceipt(client.payment_receipt);
                              }}
                              style={{ background: 'var(--color-primary)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                            >
                              Review Payment
                            </button>
                          </div>
                        ) : (
                          <span className="badge badge-spam">Pending</span>
                        )}
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
        ) : activeTab === 'requests' ? (
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
        ) : (
          <div className="pricing-settings-container" style={{ padding: '20px' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>Manage Landing Page Pricing</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {pricingPlans.length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>Loading pricing plans or no plans found. Make sure backend is running!</div>
              ) : pricingPlans.map((plan, index) => (
                <div key={plan.id} style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ color: 'var(--color-primary)', marginBottom: '16px' }}>{plan.plan_name} Tier</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Plan Name</label>
                      <input 
                        type="text" 
                        value={plan.plan_name}
                        onChange={(e) => {
                          const newPlans = [...pricingPlans];
                          newPlans[index].plan_name = e.target.value;
                          setPricingPlans(newPlans);
                        }}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Price (e.g. $49)</label>
                      <input 
                        type="text" 
                        value={plan.price}
                        onChange={(e) => {
                          const newPlans = [...pricingPlans];
                          newPlans[index].price = e.target.value;
                          setPricingPlans(newPlans);
                        }}
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Description</label>
                      <textarea 
                        value={plan.description}
                        onChange={(e) => {
                          const newPlans = [...pricingPlans];
                          newPlans[index].description = e.target.value;
                          setPricingPlans(newPlans);
                        }}
                        rows="2"
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '4px' }}>Features (One per line)</label>
                      <textarea 
                        value={Array.isArray(plan.features) ? plan.features.join('\n') : plan.features}
                        onChange={(e) => {
                          const newPlans = [...pricingPlans];
                          // Convert multiline text back into an array of strings
                          newPlans[index].features = e.target.value.split('\n').filter(f => f.trim() !== '');
                          setPricingPlans(newPlans);
                        }}
                        rows="5"
                        style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={plan.is_popular}
                        onChange={(e) => {
                          const newPlans = [...pricingPlans];
                          newPlans[index].is_popular = e.target.checked;
                          setPricingPlans(newPlans);
                        }}
                        id={`popular-${plan.id}`}
                      />
                      <label htmlFor={`popular-${plan.id}`} style={{ color: 'var(--text-primary)', fontSize: '14px' }}>Highlight as "Most Popular"</label>
                    </div>

                    <button 
                      onClick={() => handleUpdatePlan(plan.id, plan)}
                      style={{ marginTop: '16px', background: 'var(--color-primary)', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Payment Receipt Review Modal */}
      {reviewingClient && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '12px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Review Payment Receipt</h2>
            
            {selectedReceipt ? (
              <img src={selectedReceipt} alt="Payment Receipt" style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }} />
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '20px' }}>
                No receipt image provided.
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setReviewingClient(null); setSelectedReceipt(null); }}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => handleReviewPayment('pending')}
                style={{ background: 'var(--color-spam)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Reject
              </button>
              <button 
                onClick={() => handleReviewPayment('paid')}
                style={{ background: 'var(--color-primary)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
              >
                Approve Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
