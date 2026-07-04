import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, MessageSquare, Zap, Globe, CheckCircle2, ArrowRight, X, BarChart3, Clock, Headphones } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [pricingPlans, setPricingPlans] = useState([]);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/pricing`);
        const data = await response.json();
        if (data && data.length > 0) setPricingPlans(data);
      } catch (error) {
        console.error('Failed to fetch pricing plans:', error);
      }
    };
    fetchPricing();
  }, []);

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/demo-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoForm)
      });
      if (response.ok) {
        setSubmitSuccess(true);
        setTimeout(() => {
          setShowDemoModal(false);
          setSubmitSuccess(false);
          setDemoForm({ name: '', email: '', phone: '', company: '' });
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to submit demo request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <Link to="/" className="nav-brand">
          <div className="logo-icon" style={{ width: 36, height: 36, fontSize: 18 }}>T</div>
          <span className="brand-title" style={{ fontSize: 20 }}>TexVibe <span>AI</span></span>
        </Link>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <a href="#benefits" className="nav-link">Dashboard</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <Link to="/login" className="nav-link" style={{ fontWeight: 600 }}>Login</Link>
          <Link to="/register" className="cta-button cta-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-badge">✨ New: Ultra-low latency voice streaming</div>
        <h1 className="hero-title">
          The AI Voice Agent That <br/>
          <span className="hero-title-highlight">Closes Deals For You</span>
        </h1>
        <p className="hero-subtitle">
          Automate your sales calls, instantly qualify leads, and seamlessly sync with your CRM. TexVibe AI sounds completely human and works 24/7 without taking a break.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="cta-button cta-primary">
            Start Free Trial <ArrowRight size={18} />
          </Link>
          <button onClick={() => setShowDemoModal(true)} className="cta-button cta-secondary">
            Request Demo
          </button>
        </div>
      </header>

      {/* Dashboard Benefits Section */}
      <section id="benefits" className="benefits-section">
        <div className="benefits-container">
          <div className="benefits-content">
            <span className="benefits-subtitle">Your AI Command Center</span>
            <h2 className="benefits-title">Everything you need to manage leads instantly.</h2>
            
            <div className="benefit-item">
              <div className="benefit-icon" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
                <Zap size={24} />
              </div>
              <div className="benefit-text">
                <h4>Real-Time Lead Scoring</h4>
                <p>Watch your AI instantly categorize callers as Warm or Cold based on their intent, saving you hours of manual sorting.</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                <Headphones size={24} />
              </div>
              <div className="benefit-text">
                <h4>Instant Audio & Transcripts</h4>
                <p>Read word-for-word transcripts or listen to the raw audio recording of the AI negotiating with your customer immediately after the call drops.</p>
              </div>
            </div>
            
            <div className="benefit-item">
              <div className="benefit-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
                <BarChart3 size={24} />
              </div>
              <div className="benefit-text">
                <h4>Actionable Metrics</h4>
                <p>Track total leads generated, average call durations, and conversion rates at a glance on your beautiful analytics dashboard.</p>
              </div>
            </div>
          </div>
          
          <div className="mock-dashboard">
            <div className="mock-header">
              <div className="mock-dot r"></div>
              <div className="mock-dot y"></div>
              <div className="mock-dot g"></div>
              <span style={{ marginLeft: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>TexVibe CRM Dashboard</span>
            </div>
            <div className="mock-table">
              <div className="mock-row">
                <span>Ramesh (Premium Cotton)</span>
                <span className="mock-badge hot">HOT LEAD</span>
              </div>
              <div className="mock-row">
                <span>Anita (Silk Sarees)</span>
                <span className="mock-badge warm">WARM LEAD</span>
              </div>
              <div className="mock-row">
                <span>Unknown Caller</span>
                <span className="mock-badge cold">NOT INTERESTED</span>
              </div>
              <div className="mock-row">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}><Clock size={14}/> Generating Transcript...</span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Built for modern sales teams</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
              <MessageSquare size={28} />
            </div>
            <h3 className="feature-title">Human-like Conversations</h3>
            <p className="feature-desc">Powered by advanced LLMs, our voice agent understands context, handles objections gracefully, and sounds completely natural.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
              <Zap size={28} />
            </div>
            <h3 className="feature-title">Instant CRM Sync</h3>
            <p className="feature-desc">Every call is transcribed in real-time, categorized, and synced to your dashboard with actionable insights instantly.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
              <Globe size={28} />
            </div>
            <h3 className="feature-title">Multi-Language Support</h3>
            <p className="feature-desc">Speak to your customers in their preferred language. Seamlessly switch between English, Hindi, and Gujarati dynamically.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <h2 className="section-title">Simple, transparent pricing</h2>
        <div className="pricing-grid">
          {pricingPlans.length > 0 ? pricingPlans.map(plan => (
            <div key={plan.id} className={`pricing-card ${plan.is_popular ? 'popular' : ''}`}>
              {plan.is_popular && <div className="popular-badge">Most Popular</div>}
              <h3 className="pricing-plan">{plan.plan_name}</h3>
              <div className="pricing-price">
                {plan.price}<span className="pricing-period">/mo</span>
              </div>
              <p className="pricing-desc">{plan.description}</p>
              <ul className="pricing-features">
                {Array.isArray(plan.features) ? plan.features.map((feature, i) => (
                  <li key={i} className="pricing-feature"><CheckCircle2 size={18} color="#4f46e5" /> {feature}</li>
                )) : null}
              </ul>
              {plan.plan_name === 'Enterprise' ? (
                <a href="mailto:contact@texvibe.ai" className="pricing-cta outline">Contact Sales</a>
              ) : (
                <Link to={`/register?plan=${plan.id}`} className={`pricing-cta ${plan.is_popular ? 'filled' : 'outline'}`}>Get Started</Link>
              )}
            </div>
          )) : (
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', color: 'var(--text-muted)' }}>
              Loading pricing plans...
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <Shield size={20} color="#4f46e5" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>TexVibe AI</span>
        </div>
        <p>© 2026 Microtechnique. All rights reserved.</p>
      </footer>

      {/* Demo Request Modal */}
      {showDemoModal && (
        <div className="modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDemoModal(false)}>
              <X size={24} />
            </button>
            <h3 className="modal-title">Request a Demo</h3>
            <p className="modal-subtitle">Leave your details and our team will get back to you shortly to schedule a personalized walkthrough.</p>
            
            {submitSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#0ea5e9' }}>
                <CheckCircle2 size={48} style={{ margin: '0 auto 16px' }} />
                <h4>Request Received!</h4>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '14px' }}>We'll be in touch very soon.</p>
              </div>
            ) : (
              <form className="demo-form" onSubmit={handleDemoSubmit}>
                <input 
                  type="text" 
                  className="demo-input" 
                  placeholder="Full Name" 
                  required 
                  value={demoForm.name}
                  onChange={e => setDemoForm({...demoForm, name: e.target.value})}
                />
                <input 
                  type="email" 
                  className="demo-input" 
                  placeholder="Work Email" 
                  required 
                  value={demoForm.email}
                  onChange={e => setDemoForm({...demoForm, email: e.target.value})}
                />
                <input 
                  type="tel" 
                  className="demo-input" 
                  placeholder="Phone Number" 
                  required 
                  value={demoForm.phone}
                  onChange={e => setDemoForm({...demoForm, phone: e.target.value})}
                />
                <input 
                  type="text" 
                  className="demo-input" 
                  placeholder="Company Name" 
                  required 
                  value={demoForm.company}
                  onChange={e => setDemoForm({...demoForm, company: e.target.value})}
                />
                <button type="submit" className="demo-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
