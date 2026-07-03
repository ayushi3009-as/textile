import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, MessageSquare, Zap, Globe, CheckCircle2, ArrowRight, X } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
          <a href="#pricing" className="nav-link">Pricing</a>
          <Link to="/login" className="nav-link" style={{ fontWeight: 600 }}>Login</Link>
          <Link to="/register" className="cta-button cta-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
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
          <button onClick={() => setShowDemoModal(true)} className="cta-button cta-secondary" style={{ cursor: 'pointer' }}>
            Request Demo
          </button>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Everything you need to scale sales</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
              <MessageSquare size={28} />
            </div>
            <h3 className="feature-title">Human-like Conversations</h3>
            <p className="feature-desc">Powered by advanced LLMs, our voice agent understands context, handles objections gracefully, and sounds completely natural.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'var(--color-lead-glow)', color: 'var(--color-lead)' }}>
              <Zap size={28} />
            </div>
            <h3 className="feature-title">Instant CRM Sync</h3>
            <p className="feature-desc">Every call is transcribed in real-time, categorized, and synced to your dashboard with actionable insights instantly.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'var(--color-vip-glow)', color: 'var(--color-vip)' }}>
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
          {/* Starter Plan */}
          <div className="pricing-card">
            <h3 className="pricing-plan">Starter</h3>
            <div className="pricing-price">
              $49<span className="pricing-period">/mo</span>
            </div>
            <p className="pricing-desc">Perfect for small businesses looking to automate basic calling.</p>
            <ul className="pricing-features">
              <li className="pricing-feature"><CheckCircle2 size={18} color="var(--color-primary)" /> 500 AI Call Minutes</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="var(--color-primary)" /> Basic CRM Dashboard</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="var(--color-primary)" /> Email Support</li>
            </ul>
            <Link to="/register" className="pricing-cta outline">Get Started</Link>
          </div>

          {/* Pro Plan */}
          <div className="pricing-card popular">
            <div className="popular-badge">Most Popular</div>
            <h3 className="pricing-plan">Professional</h3>
            <div className="pricing-price">
              $149<span className="pricing-period">/mo</span>
            </div>
            <p className="pricing-desc">For growing sales teams that need high volume and deep insights.</p>
            <ul className="pricing-features">
              <li className="pricing-feature"><CheckCircle2 size={18} color="var(--color-primary)" /> 2,000 AI Call Minutes</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="var(--color-primary)" /> Multi-language Support</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="var(--color-primary)" /> Priority Support</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="var(--color-primary)" /> Live Call Takeover</li>
            </ul>
            <Link to="/register" className="pricing-cta filled">Get Started</Link>
          </div>

          {/* Enterprise Plan */}
          <div className="pricing-card">
            <h3 className="pricing-plan">Enterprise</h3>
            <div className="pricing-price">
              $499<span className="pricing-period">/mo</span>
            </div>
            <p className="pricing-desc">Custom solutions for large organizations with complex needs.</p>
            <ul className="pricing-features">
              <li className="pricing-feature"><CheckCircle2 size={18} color="var(--color-primary)" /> Unlimited Minutes</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="var(--color-primary)" /> Custom LLM Training</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="var(--color-primary)" /> Dedicated Success Manager</li>
              <li className="pricing-feature"><CheckCircle2 size={18} color="var(--color-primary)" /> White-label Options</li>
            </ul>
            <a href="mailto:contact@texvibe.ai" className="pricing-cta outline">Contact Sales</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <Shield size={20} color="var(--color-primary)" />
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
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--color-lead)' }}>
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
