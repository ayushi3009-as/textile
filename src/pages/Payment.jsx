import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, Upload, ShieldCheck } from 'lucide-react';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const clientData = location.state?.client;
  const isRejected = location.state?.rejected;
  
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(clientData?.payment_status === 'verification_pending');
  const [error, setError] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_URL}/api/pricing`);
        const data = await res.json();
        setPlans(data);
        if (data.length > 0) {
          // Default to their previously selected plan, or the first one
          const defaultPlan = data.find(p => p.plan_name === clientData?.plan_name) || data[0];
          setSelectedPlanId(defaultPlan.id);
        }
      } catch (err) {
        console.error('Failed to load plans', err);
      }
    };
    fetchPlans();
  }, [clientData]);

  // If someone manually navigates here without a client context
  if (!clientData) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h2>No Pending Payment Found</h2>
          <button className="auth-button" onClick={() => navigate('/login')} style={{ marginTop: '20px' }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File is too large. Maximum size is 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!receiptImage) {
      setError("Please upload your payment receipt screenshot first.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/submit-payment-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: clientData.id, receiptBase64: receiptImage, planId: selectedPlanId })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setVerificationPending(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
        
        {verificationPending ? (
          <div style={{ padding: '20px 0' }}>
            <ShieldCheck size={64} color="#4f46e5" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ marginBottom: '15px' }}>Verification in Progress</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Thank you for your payment! Our team is currently reviewing your receipt. 
              This usually takes 1-2 hours during business hours.
            </p>
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', margin: '30px 0', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Account Access</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>LOCKED</span>
              </div>
            </div>
            <button className="auth-button" onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
              Return to Login
            </button>
          </div>
        ) : (
          <>
            {isRejected && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <strong>Payment Rejected:</strong> Your previous receipt was not accepted. Please ensure the transaction is successful and upload a clear screenshot.
              </div>
            )}

            <div className="auth-icon-wrapper" style={{ margin: '0 auto 20px', background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
              <CreditCard size={32} />
            </div>
            <h1 className="auth-title">Complete Your Subscription</h1>
            <p className="auth-subtitle">Scan the QR code below to pay securely via UPI.</p>
            
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', margin: '20px 0', textAlign: 'left' }}>
              <h4 style={{ marginBottom: '15px' }}>Select Your Plan</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <select 
                  value={selectedPlanId} 
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="auth-input"
                  style={{ width: '70%', marginBottom: 0, padding: '10px' }}
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.plan_name}</option>
                  ))}
                </select>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {plans.find(p => p.id.toString() === selectedPlanId.toString())?.price || '$0'}
                </span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '12px', margin: '20px 0' }}>
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=9712922340@barodampay&pn=MICROTECHNIQUE%20IT%20AND%20COMMUNICATIONS%20SOL" 
                alt="UPI QR Code" 
                style={{ width: '250px', height: '250px', margin: '0 auto', display: 'block', borderRadius: '8px', background: 'white', padding: '10px' }}
              />
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '20px', textAlign: 'center' }}>
                UPI ID: <strong style={{ color: 'var(--color-primary)' }}>9712922340@barodampay</strong>
                <br />
                <span style={{ fontSize: '12px', opacity: 0.8 }}>MICROTECHNIQUE IT AND COMMUNICATIONS SOL</span>
              </p>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label className="auth-label" style={{ marginBottom: '10px', display: 'block' }}>Upload Payment Screenshot</label>
              
              <div 
                style={{ 
                  border: '2px dashed rgba(255,255,255,0.2)', 
                  borderRadius: '12px', 
                  padding: '30px', 
                  textAlign: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  background: receiptImage ? 'rgba(79, 70, 229, 0.1)' : 'transparent'
                }}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                
                {receiptImage ? (
                  <div>
                    <CheckCircle2 size={32} color="#22c55e" style={{ margin: '0 auto 10px' }} />
                    <p style={{ color: '#22c55e', fontWeight: 600 }}>Screenshot Attached!</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>Click to change image</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Click or drag to upload receipt</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button 
              onClick={handleSubmitReceipt} 
              disabled={loading || !receiptImage}
              className="auth-button"
              style={{ padding: '15px', opacity: receiptImage ? 1 : 0.6 }}
            >
              {loading ? 'Submitting...' : 'Submit Receipt for Verification'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
