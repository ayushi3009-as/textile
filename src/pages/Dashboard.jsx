import React, { useState, useEffect } from 'react';
import { 
  Phone, ShieldAlert, Users, 
  Clock, Activity, MessageSquare, 
  RefreshCw, Volume2, AlertCircle, FileText,
  Server, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCall, setSelectedCall] = useState(null);
  const [followUpLogs, setFollowUpLogs] = useState([]);
  const [serverStatus, setServerStatus] = useState('connecting'); // connecting, connected, error
  const navigate = useNavigate();
  
  const token = localStorage.getItem('saas_token');
  const clientDataString = localStorage.getItem('saas_client');
  const clientData = clientDataString ? JSON.parse(clientDataString) : null;

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Fetch initial leads from database
  useEffect(() => {
    const fetchLeads = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://localhost:3000/api/leads', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('saas_token');
          navigate('/login');
          return;
        }
        const data = await response.json();
        if (data && data.length > 0) {
          setCalls(data);
        } else {
          setCalls([]); // Ensure empty array for new clients instead of fallback data
        }
      } catch (err) {
        console.error("Failed to fetch leads from DB:", err);
        setCalls([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeads();
  }, []);

  // Connect to SSE Backend
  useEffect(() => {
    // We listen to the Express server running on port 3000
    const eventSource = new EventSource('http://localhost:3000/api/events');
    
    eventSource.onopen = () => {
      setServerStatus('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        if (payload.type === 'connected') {
          console.log("SSE Connected to Telecom Webhook Receiver.");
        } 
        else if (payload.type === 'new_call') {
          setCalls(prev => [payload.data, ...prev]);
        }
        else if (payload.type === 'follow_up') {
          setFollowUpLogs(prev => [payload.data, ...prev]);
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error", err);
      setServerStatus('error');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const clearLogs = () => {
    setCalls([]);
    setFollowUpLogs([]);
    setSelectedCall(null);
    localStorage.removeItem('texvibe_cloud_calls');
  };

  const testWebhook = async () => {
    try {
      await fetch('http://localhost:3000/api/test-event');
    } catch (e) {
      alert("Failed to reach backend. Make sure server.js is running on port 3000.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_client');
    navigate('/login');
  };

  const companyName = clientData ? (clientData.companyName || clientData.company_name || 'Company') : 'Company';

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="logo-icon">{companyName.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className="brand-title">{companyName} <span>Voice SaaS Dashboard</span></h1>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Live monitoring — Twilio + Deepgram + Llama-3 Voice Agent
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn btn-primary" 
            onClick={testWebhook}
            style={{ padding: '8px 12px' }}
          >
            <Zap size={14} /> Send Test Call
          </button>
          
          <button 
            className="btn btn-secondary" 
            onClick={handleLogout}
            style={{ padding: '8px 12px', borderColor: 'rgba(239,68,68,0.2)', color: 'var(--color-spam)' }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Full-Width Dashboard */}
      <div className="dashboard-container" style={{ width: '100%', marginTop: '10px' }}>
        
        {/* Metrics Grid */}
        <div className="metrics-grid">
          <div className="glass-panel metric-card">
            <div className="metric-info">
              <span className="metric-label">Total Cloud Calls Handled</span>
              <span className="metric-value">{calls.length}</span>
            </div>
            <div className="metric-icon" style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
              <Phone size={24} />
            </div>
          </div>

          <div className="glass-panel metric-card">
            <div className="metric-info">
              <span className="metric-label">VIP Clients Routed</span>
              <span className="metric-value">
                {calls.filter(c => c.category === 'VIP Lead').length}
              </span>
            </div>
            <div className="metric-icon" style={{ background: 'var(--color-vip-glow)', color: 'var(--color-vip)' }}>
              <Users size={24} />
            </div>
          </div>

          <div className="glass-panel metric-card">
            <div className="metric-info">
              <span className="metric-label">Spam Blocked</span>
              <span className="metric-value">
                {calls.filter(c => c.category === 'Spam').length}
              </span>
            </div>
            <div className="metric-icon" style={{ background: 'var(--color-spam-glow)', color: 'var(--color-spam)' }}>
              <ShieldAlert size={24} />
            </div>
          </div>

          <div className="glass-panel metric-card">
            <div className="metric-info">
              <span className="metric-label">System Health</span>
              <span className="metric-value" style={{ fontSize: '18px', marginTop: '8px' }}>
                <div className="status-indicator">
                  <span className={`status-dot dot-active`} />
                  All Systems Operational
                </div>
              </span>
            </div>
            <div className="metric-icon" style={{ background: 'var(--color-lead-glow)', color: 'var(--color-lead)' }}>
              <Activity size={24} />
            </div>
          </div>
        </div>

        {/* Tables & Logs Row */}
        <div className="detail-panels-grid">
          
          {/* Main CRM Table */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
            <div className="panel-header">
              <span className="panel-title">
                <FileText size={18} style={{ color: 'var(--color-primary)' }} /> 
                Cloud Call History & Analytics
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Listening for incoming webhooks on port 3000...
              </span>
            </div>

            <div className="logs-table-container">
              {calls.length === 0 ? (
                <div className="no-calls-placeholder" style={{ padding: '80px' }}>
                  <AlertCircle size={32} />
                  <span>No calls received yet. Waiting for telecom webhooks.</span>
                </div>
              ) : (
                <table className="logs-table" style={{ fontSize: '14px' }}>
                  <thead>
                    <tr>
                      <th>Caller Details</th>
                      <th>Product Wanted</th>
                      <th>Color & Qty</th>
                      <th>Sample?</th>
                      <th>Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calls.map((c) => (
                      <tr 
                        key={c.id} 
                        onClick={() => setSelectedCall(c)}
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: selectedCall?.id === c.id ? 'rgba(255,255,255,0.04)' : 'transparent' 
                        }}
                      >
                        <td>
                          <div className="caller-cell">
                            <span className="caller-name">{c.callerName}</span>
                            <span className="caller-company">{c.company} • {c.phone}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '500' }}>{c.product_wanted}</span>
                        </td>
                        <td>
                          <span>{c.color} / {c.quantity}</span>
                        </td>
                        <td>
                          <span className={`badge ${c.wants_sample === 'Yes' ? 'badge-interested' : 'badge-notinterested'}`}>
                            {c.wants_sample}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${c.category.toLowerCase().replace(' ', '')}`}>
                            {c.category}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="glass-panel live-feed-panel">
            <div className="panel-header">
              <span className="panel-title">
                <MessageSquare size={18} style={{ color: 'var(--color-lead)' }} /> 
                Cloud Auto-Follow-Ups
              </span>
            </div>
            <div className="live-feed-content">
              {followUpLogs.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No automated actions dispatched yet. When VIP leads are detected via webhook, escalation notices will appear here.
                </div>
              ) : (
                followUpLogs.map((log) => (
                  <div key={log.id} className="feed-item" style={{ padding: '16px' }}>
                    <div className="feed-item-icon">
                      {log.type === 'WhatsApp' ? (
                        <MessageSquare size={18} style={{ color: 'var(--color-lead)' }} />
                      ) : log.type === 'Email' ? (
                        <Volume2 size={18} style={{ color: 'var(--color-support)' }} />
                      ) : (
                        <RefreshCw size={18} style={{ color: 'var(--color-vip)' }} />
                      )}
                    </div>
                    <div className="feed-item-body">
                      <strong style={{ fontSize: '13px' }}>{log.type} Dispatched</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>{log.message}</p>
                      <span className="feed-item-time" style={{ fontSize: '11px', marginTop: '4px' }}>{log.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Expanded Transcript details */}
        {selectedCall && (
          <div className="glass-panel" style={{ padding: '24px', marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'bold' }}>
                  Call Record: {selectedCall.callerName} ({selectedCall.id})
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {selectedCall.company} • {selectedCall.phone}
                </p>
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={() => setSelectedCall(null)}
              >
                Close Details
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* Summary and Sentiment */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.015)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>AI Call Summary (Generated by Telecom)</span>
                  <p style={{ fontSize: '15px', color: 'var(--text-primary)', marginTop: '8px', lineHeight: '1.5' }}>
                    {selectedCall.summary}
                  </p>
                </div>
                
                <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.015)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Lead Sentiment Analysis</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', textTransform: 'capitalize', fontWeight: 'bold', fontSize: '16px' }}>
                    <Activity size={18} style={{ color: selectedCall.sentiment === 'positive' ? 'var(--color-lead)' : selectedCall.sentiment === 'negative' ? 'var(--color-spam)' : 'var(--text-muted)' }} />
                    {selectedCall.sentiment}
                  </div>
                </div>
              </div>

              {/* Transcripts (if provided by webhook) */}
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Cloud Transcript</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', maxHeight: '280px', overflowY: 'auto' }}>
                  {selectedCall.transcript && selectedCall.transcript.length > 0 ? (
                    selectedCall.transcript.map((t, idx) => (
                      <div key={idx} style={{ fontSize: '14px', lineHeight: '1.4' }}>
                        <strong style={{ color: t.speaker === 'AI Agent' ? 'var(--color-primary)' : 'var(--color-lead)' }}>
                          {t.speaker}:
                        </strong>{' '}
                        <span style={{ color: 'var(--text-primary)' }}>{t.text}</span>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No detailed transcript provided in the webhook payload. Only summary is available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
