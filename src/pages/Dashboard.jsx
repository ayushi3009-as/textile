import React, { useState, useEffect } from 'react';
import { 
  Phone, ShieldAlert, Users, 
  Clock, Activity, MessageSquare, 
  RefreshCw, Volume2, AlertCircle, FileText,
  Server, Zap, UploadCloud, Play, CheckCircle2, XCircle, Calendar, MessageCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Dashboard() {
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');
  const fileInputRef = React.useRef(null);
  const [campaignLeads, setCampaignLeads] = useState([]);
  const [selectedCampaignLead, setSelectedCampaignLead] = useState(null);
  const [appointments, setAppointments] = useState([]);
  
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
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/leads`, {
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
    
    const fetchAppointments = async () => {
      if (!token) return;
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setAppointments(data);
          } else {
            // Provide a dummy example if no appointments exist yet
            setAppointments([
              {
                id: 'demo-1',
                lead_name: 'Vikram Textiles',
                lead_phone: '+91 98765 43210',
                appointment_time: 'Tomorrow at 2:30 PM',
                description: 'User asked about premium cotton (500 meters). Very interested, wants a sample and requested a meeting to finalize bulk pricing.'
              }
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
      }
    };

    fetchLeads();
    fetchAppointments();
  }, []);

  // Connect to SSE Backend
  useEffect(() => {
    // We listen to the Express server running on port 3000
    const API_URL = import.meta.env.VITE_API_URL || '';
    const eventSource = new EventSource(`${API_URL}/api/events`);
    
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
        else if (payload.type === 'update_call') {
          setCalls(prev => prev.map(c => c.db_id === payload.data.db_id ? { ...c, lead_temperature: payload.data.lead_temperature } : c));
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

  const handleUpdateTemperature = async (e, dbId, temp) => {
    e.stopPropagation(); // prevent row click
    if (!dbId) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await fetch(`${API_URL}/api/leads/${dbId}/temperature`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ temperature: temp })
      });
      // Optimistic update
      setCalls(prev => prev.map(c => c.db_id === dbId ? { ...c, lead_temperature: temp } : c));
    } catch (err) {
      console.error("Failed to update temperature", err);
    }
  };

  const clearLogs = () => {
    setCalls([]);
    setFollowUpLogs([]);
    setSelectedCall(null);
    localStorage.removeItem('texvibe_cloud_calls');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a full implementation, we'd use XLSX or PapaParse here.
    // For now, we simulate parsing the uploaded Excel/CSV file into leads.
    setTimeout(() => {
      setCampaignLeads([
        { id: 101, name: 'Rahul Sharma', phone: '+919988776655', status: 'Pending' },
        { id: 102, name: 'Anjali Fabrics', phone: '+918877665544', status: 'Pending' },
        { id: 103, name: 'Vikas Textiles', phone: '+917766554433', status: 'Pending' },
      ]);
      alert(`Successfully loaded 3 leads from ${file.name}`);
    }, 500);
  };

  const startBulkDialing = async () => {
    if (campaignLeads.length === 0) {
      alert("Please upload an Excel file with leads first.");
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await fetch(`${API_URL}/api/bulk-dial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ leads: campaignLeads })
      });
      alert("Bulk dialing campaign started via Exotel!");
      
      // Update UI to show they are being called
      setCampaignLeads(prev => prev.map(lead => ({ ...lead, status: 'Calling...' })));
    } catch (err) {
      console.error("Failed to start bulk dialing:", err);
      alert("Error starting campaign.");
    }
  };

  const testWebhook = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      await fetch(`${API_URL}/api/test-event`);
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
            <h1 className="brand-title" style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {companyName}
            </h1>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div className="tabs" style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.05)', padding: '6px', borderRadius: '12px' }}>
            <button 
              onClick={() => setActiveTab('live')}
              style={{ 
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
                background: activeTab === 'live' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'live' ? '#fff' : 'var(--text-secondary)'
              }}>
              Live & Inbound Calls
            </button>
            <button 
              onClick={() => setActiveTab('campaigns')}
              style={{ 
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
                background: activeTab === 'campaigns' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'campaigns' ? '#fff' : 'var(--text-secondary)'
              }}>
              Outbound Bulk Campaigns
            </button>
            <button 
              onClick={() => setActiveTab('calendar')}
              style={{ 
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600',
                background: activeTab === 'calendar' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'calendar' ? '#fff' : 'var(--text-secondary)'
              }}>
              Calendar & Meetings
            </button>
          </div>
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
        
        {activeTab === 'live' && (
          <>
            {/* Metrics Grid */}
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <div className="glass-panel metric-card" style={{ borderTop: '3px solid var(--color-primary)' }}>
            <div className="metric-info">
              <span className="metric-label" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Incoming Calls</span>
              <span className="metric-value" style={{ fontSize: '32px' }}>{calls.length}</span>
            </div>
            <div className="metric-icon" style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
              <Phone size={24} />
            </div>
          </div>

          <div className="glass-panel metric-card" style={{ borderTop: '3px solid #FF9800' }}>
            <div className="metric-info">
              <span className="metric-label" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Warm Reply</span>
              <span className="metric-value" style={{ fontSize: '32px' }}>
                {calls.filter(c => c.lead_temperature === 'Warm').length}
              </span>
            </div>
            <div className="metric-icon" style={{ background: 'rgba(255,152,0,0.1)', color: '#FF9800' }}>
              <Activity size={24} />
            </div>
          </div>

          <div className="glass-panel metric-card" style={{ borderTop: '3px solid #2196F3' }}>
            <div className="metric-info">
              <span className="metric-label" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Cold Reply</span>
              <span className="metric-value" style={{ fontSize: '32px' }}>
                {calls.filter(c => c.lead_temperature === 'Cold').length}
              </span>
            </div>
            <div className="metric-icon" style={{ background: 'rgba(33,150,243,0.1)', color: '#2196F3' }}>
              <Users size={24} />
            </div>
          </div>

          <div className="glass-panel metric-card" style={{ borderTop: '3px solid var(--color-spam)' }}>
            <div className="metric-info">
              <span className="metric-label" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Spam Calls</span>
              <span className="metric-value" style={{ fontSize: '32px' }}>
                {calls.filter(c => c.status === 'Spam' || c.category === 'Spam').length}
              </span>
            </div>
            <div className="metric-icon" style={{ background: 'var(--color-spam-glow)', color: 'var(--color-spam)' }}>
              <ShieldAlert size={24} />
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div style={{ marginTop: '24px' }}>
          
          {/* Main CRM Table */}
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '500px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' }}>
            <div className="panel-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
              <span className="panel-title" style={{ fontSize: '18px', fontWeight: '600' }}>
                <FileText size={20} style={{ color: 'var(--color-primary)' }} /> 
                Recent Leads & Call Analytics
              </span>
            </div>

            <div className="logs-table-container">
              {calls.length === 0 ? (
                <div className="no-calls-placeholder" style={{ padding: '80px' }}>
                  <AlertCircle size={32} />
                  <span>No calls received yet.</span>
                </div>
              ) : (
                <table className="logs-table" style={{ fontSize: '14px', width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Caller Details</th>
                      <th>Product Wanted</th>
                      <th>Color & Qty</th>
                      <th>Recording</th>
                      <th>Temperature</th>
                      <th>Follow Up</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calls.map((c) => (
                      <tr 
                        key={c.id} 
                        onClick={() => {
                          setSelectedCall(c);
                          setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
                        }}
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: selectedCall?.id === c.id ? 'rgba(255,255,255,0.04)' : 'transparent' 
                        }}
                      >
                        <td>
                          <div className="caller-cell">
                            <span className="caller-name">{c.callerName || 'Unknown Caller'}</span>
                            <span className="caller-company">{c.caller_number || c.phone}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: '500' }}>{c.product_wanted || 'N/A'}</span>
                        </td>
                        <td>
                          <span>{c.color || '-'} / {c.quantity || '-'}</span>
                        </td>
                        <td>
                          {c.recording_url ? (
                            <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Volume2 size={12} /> Play
                            </button>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Processing...</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                              onClick={(e) => handleUpdateTemperature(e, c.db_id, 'Warm')}
                              style={{ 
                                background: c.lead_temperature === 'Warm' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255,255,255,0.05)', 
                                color: c.lead_temperature === 'Warm' ? '#FF9800' : 'var(--text-secondary)', 
                                border: c.lead_temperature === 'Warm' ? '1px solid rgba(255,152,0,0.5)' : '1px solid rgba(255,255,255,0.1)',
                                padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500'
                              }}>
                              🔥 Warm
                            </button>
                            <button 
                              onClick={(e) => handleUpdateTemperature(e, c.db_id, 'Cold')}
                              style={{ 
                                background: c.lead_temperature === 'Cold' ? 'rgba(33, 150, 243, 0.2)' : 'rgba(255,255,255,0.05)', 
                                color: c.lead_temperature === 'Cold' ? '#2196F3' : 'var(--text-secondary)', 
                                border: c.lead_temperature === 'Cold' ? '1px solid rgba(33,150,243,0.5)' : '1px solid rgba(255,255,255,0.1)',
                                padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500'
                              }}>
                              ❄️ Cold
                            </button>
                          </div>
                        </td>
                        <td>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const number = (c.phone || '').replace(/\D/g, '');
                              const msg = encodeURIComponent(`Hi ${c.callerName || ''},\nThanks for calling ${companyName} today about ${c.product_wanted || 'our products'}. How can we assist you further?`);
                              window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
                            }}
                            className="btn" 
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: '#25D366', color: '#fff', border: 'none' }}
                          >
                            <MessageCircle size={14} /> WhatsApp
                          </button>
                        </td>
                        <td>
                          <span className={`badge badge-${c.status?.toLowerCase().replace(' ', '')}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                
                {selectedCall.recording_url && (
                  <div style={{ marginBottom: '16px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Call Recording</span>
                    <audio src={`${API_URL}/api/play-recording?url=${encodeURIComponent(selectedCall.recording_url)}`} controls style={{ width: '100%', height: '32px' }} />
                  </div>
                )}

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
          </>
        )}

        {activeTab === 'campaigns' && (
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: '600px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>AI Bulk Dialing Campaign</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Upload an Excel or CSV file of leads and let Exotel + AI call them instantly.</p>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: 'none' }} 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileUpload}
                />
                <span 
                  onClick={() => fileInputRef.current.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600', padding: '8px' }}
                >
                  <UploadCloud size={18} /> Upload Excel
                </span>
                <button 
                  onClick={startBulkDialing}
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-secondary)' }}
                >
                  <Play size={18} /> Start Calling Leads from Excel
                </button>
              </div>
            </div>

            <div className="logs-table-container">
              <table className="logs-table" style={{ fontSize: '14px', width: '100%' }}>
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Phone Number</th>
                    <th>Exotel Call Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td style={{ fontWeight: '600' }}>{lead.name}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{lead.phone}</td>
                      <td>
                        {lead.status === 'Pending' && <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}><Clock size={12} style={{marginRight:'4px'}}/> Pending</span>}
                        {lead.status === 'Called' && <span className="badge badge-positive"><CheckCircle2 size={12} style={{marginRight:'4px'}}/> Called (See Transcript)</span>}
                        {lead.status === 'Failed' && <span className="badge badge-spam"><XCircle size={12} style={{marginRight:'4px'}}/> Failed</span>}
                      </td>
                      <td>
                        {lead.status === 'Called' ? (
                          <span 
                            onClick={() => setSelectedCampaignLead(lead)}
                            style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline', fontSize: '13px' }}
                          >
                            See Details
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>See Details</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Campaign Lead Details Modal/Panel */}
            {selectedCampaignLead && (
              <div className="glass-panel" style={{ padding: '24px', marginTop: '24px', borderLeft: '4px solid var(--color-primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'bold' }}>
                      Call Record: {selectedCampaignLead.name}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {selectedCampaignLead.phone}
                    </p>
                  </div>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setSelectedCampaignLead(null)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  {/* Extracted Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.015)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Extracted Lead Information</span>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Interested?</p>
                          <p style={{ fontWeight: 'bold', color: selectedCampaignLead.interested === 'Yes' ? 'var(--color-lead)' : 'var(--color-spam)' }}>
                            {selectedCampaignLead.interested}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Product</p>
                          <p style={{ fontWeight: '500' }}>{selectedCampaignLead.product || 'N/A'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Color Details</p>
                          <p style={{ fontWeight: '500' }}>{selectedCampaignLead.color || 'N/A'}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Quantity Required</p>
                          <p style={{ fontWeight: '500' }}>{selectedCampaignLead.quantity || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Audio */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.015)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>AI Call Summary</span>
                      <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '8px', lineHeight: '1.5' }}>
                        {selectedCampaignLead.summary}
                      </p>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Call Recording (Exotel)</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                        <div style={{ background: 'var(--color-primary)', borderRadius: '50%', padding: '8px' }}>
                          <Play size={16} color="#fff" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', width: '100%', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '30%', background: 'var(--color-primary)', borderRadius: '2px' }}></div>
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>0:45 / 2:10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="glass-panel" style={{ padding: '24px', minHeight: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={24} style={{ color: 'var(--color-primary)' }}/> AI Booked Meetings
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>These appointments were successfully booked by the AI Voice Agent during calls.</p>
              </div>
            </div>

            <div className="logs-table-container">
              {appointments.length === 0 ? (
                <div className="no-calls-placeholder" style={{ padding: '80px' }}>
                  <AlertCircle size={32} />
                  <span>No appointments booked yet. Let the AI take more calls!</span>
                </div>
              ) : (
                <table className="logs-table" style={{ fontSize: '14px', width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Phone</th>
                      <th>Meeting Date/Time</th>
                      <th>Call Highlights</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => (
                      <tr key={appt.id}>
                        <td style={{ fontWeight: '600' }}>{appt.lead_name || 'Unknown'}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{appt.lead_phone || '-'}</td>
                        <td style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{appt.appointment_time}</td>
                        <td style={{ maxWidth: '300px' }}>{appt.description}</td>
                        <td>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const number = (appt.lead_phone || '').replace(/\D/g, '');
                              const msg = encodeURIComponent(`Hi ${appt.lead_name || ''},\nConfirming your meeting with ${companyName} for ${appt.appointment_time}. Are we still good for this time?`);
                              window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
                            }}
                            className="btn" 
                            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: '#25D366', color: '#fff', border: 'none' }}
                          >
                            <MessageCircle size={14} /> Send Reminder
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
