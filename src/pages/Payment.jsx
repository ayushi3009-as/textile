import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle2, Upload, FileImage, ShieldCheck } from 'lucide-react';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const clientData = location.state?.client;
  
  const [loading, setLoading] = useState(false);
  const [verificationPending, setVerificationPending] = useState(clientData?.payment_status === 'verification_pending');
  const [error, setError] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);

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
        body: JSON.stringify({ clientId: clientData.id, receiptBase64: receiptImage })
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
            <div className="auth-icon-wrapper" style={{ margin: '0 auto 20px', background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
              <CreditCard size={32} />
            </div>
            <h1 className="auth-title">Complete Your Subscription</h1>
            <p className="auth-subtitle">Scan the QR code below to pay securely via UPI.</p>
            
            <div style={{ background: 'var(--bg-secondary)', padding: '30px', borderRadius: '12px', margin: '20px 0' }}>
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=admin@texvibe&pn=MicroTechnique" 
                alt="UPI QR Code" 
                style={{ width: '200px', height: '200px', margin: '0 auto', display: 'block', borderRadius: '8px', background: 'white', padding: '10px' }}
              />
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '20px', textAlign: 'center' }}>
                UPI ID: <strong>admin@texvibe</strong>
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
