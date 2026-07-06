import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, MessageSquare, Zap, Globe, CheckCircle2, ArrowRight, X, BarChart3, Clock, Headphones, 
  UploadCloud, BrainCircuit, LineChart, Building2, ShoppingCart, Briefcase, Moon, Sun, Phone, Users, MessageCircle
} from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Handle theme switch
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Handle scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Pricing
  useEffect(() => {
    const fetchPricing = async () => {
      const fallbackPlans = [
        { id: 1, plan_name: 'Basic', price: '$29', description: 'Perfect for small boutiques.', features: ['100 AI Calls/mo', 'Email Support', 'Basic Analytics'] },
        { id: 2, plan_name: 'Premium', price: '$99', description: 'Ideal for growing wholesalers.', is_popular: true, features: ['500 AI Calls/mo', 'Priority Support', 'CRM Integration', 'Custom Voice'] },
        { id: 3, plan_name: 'Enterprise', price: 'Custom', description: 'For large textile mills.', features: ['Unlimited Calls', '24/7 Phone Support', 'Custom AI Training', 'Dedicated Account Manager'] }
      ];
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/pricing`);
        const data = await response.json();
        if (data && data.length > 0) {
          setPricingPlans(data);
        } else {
          setPricingPlans(fallbackPlans);
        }
      } catch (error) {
        console.error('Failed to fetch pricing plans:', error);
        setPricingPlans(fallbackPlans);
      }
    };
    fetchPricing();
  }, []);

  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://api.tivra.marketing';
      const response = await fetch(`${API_URL}/api/demo-request`, {
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
    <div className={`landing-page ${theme}-mode`}>
      {/* Background Elements */}
      <div className="bg-glow top-left"></div>
      <div className="bg-glow bottom-right"></div>
      <div className="noise-overlay"></div>

      {/* Navigation */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="nav-brand">
          <div className="logo-icon">T</div>
          <span className="brand-title">TexVibe <span>AI</span></span>
        </Link>
        <div className="nav-links">
          <a href="#how-it-works" className="nav-link">How it Works</a>
          <a href="#use-cases" className="nav-link">Use Cases</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/login" className="nav-link auth-login">Login</Link>
          <Link to="/register" className="cta-button cta-primary nav-cta">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="hero-badge fade-up">
            <span className="badge-dot"></span> AI VOICE AGENT FOR TEXTILE INDUSTRY
          </div>
          <h1 className="hero-title fade-up delay-1" style={{ textTransform: 'uppercase' }}>
            The AI Voice Agent <br/>
            That Closes <span className="hero-title-highlight">More Deals</span>
          </h1>
          <p className="hero-subtitle fade-up delay-2" style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px', fontSize: '24px' }}>
            Convert Every Inquiry Into a Business Opportunity
          </p>
          <p className="hero-subtitle fade-up delay-2">
            Never miss a buyer inquiry. Our AI Voice Agent answers calls instantly, qualifies buyers, shares product information, books meetings, and syncs every conversation with your CRM—24/7.
          </p>
          <div className="hero-actions fade-up delay-3">
            <Link to="/register" className="cta-button cta-primary glow-effect">
              Start Free Trial <ArrowRight size={18} />
            </Link>
            <button onClick={() => setShowDemoModal(true)} className="cta-button cta-secondary">
              Book a Demo
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Preview Section */}
      <section className="dashboard-preview-section">
        <div className="mock-dashboard-wrapper fade-up delay-4">
          <div className="mock-dashboard glass-panel">
            <div className="mock-header">
              <div className="window-controls">
                <div className="mock-dot r"></div>
                <div className="mock-dot y"></div>
                <div className="mock-dot g"></div>
              </div>
              <span className="mock-title">TexVibe CRM Live View</span>
            </div>
            
            <div className="mock-body">
              <div className="mock-stats">
                <div className="stat-box">
                  <span>Active AI Calls</span>
                  <strong>14</strong>
                </div>
                <div className="stat-box">
                  <span>Leads Qualified</span>
                  <strong style={{color: '#10b981'}}>1,204</strong>
                </div>
                <div className="stat-box">
                  <span>Conversion Rate</span>
                  <strong style={{color: '#6366f1'}}>24.8%</strong>
                </div>
              </div>

              <div className="mock-table-wrapper">
                <div className="mock-row header-row">
                  <span>Lead Name</span>
                  <span>Duration</span>
                  <span>AI Sentiment</span>
                  <span>Status</span>
                </div>
                <div className="mock-row">
                  <span>Ramesh Patel</span>
                  <span>02:14</span>
                  <span>Highly Interested</span>
                  <span className="mock-badge hot">HOT LEAD</span>
                </div>
                <div className="mock-row">
                  <span>Anita Sharma</span>
                  <span>05:30</span>
                  <span>Needs Follow-up</span>
                  <span className="mock-badge warm">WARM LEAD</span>
                </div>
                <div className="mock-row pulse-row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1' }}>
                    <Clock size={14} className="spin-icon"/> On Call (Speaking Hindi)...
                  </span>
                  <span>00:45</span>
                  <span>Analyzing...</span>
                  <span className="mock-badge pending">IN PROGRESS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="how-it-works-section">
        <div className="container">
          <h2 className="section-title" style={{ fontSize: '32px', textTransform: 'uppercase', marginBottom: '40px', color: 'var(--text-primary)' }}>
            Powerful. Features Built For Textile Businesses
          </h2>
          
          <div className="steps-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <div className="step-card feature-card" style={{ display: 'flex', gap: '16px', padding: '24px', alignItems: 'flex-start' }}>
              <div className="step-icon" style={{ marginBottom: 0, width: '48px', height: '48px', flexShrink: 0 }}><Phone size={24} /></div>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Instant Buyer Response</h3>
                <p style={{ fontSize: '14px' }}>Respond to wholesalers, retailers & distributors instantly.</p>
              </div>
            </div>
            
            <div className="step-card feature-card" style={{ display: 'flex', gap: '16px', padding: '24px', alignItems: 'flex-start' }}>
              <div className="step-icon" style={{ marginBottom: 0, width: '48px', height: '48px', flexShrink: 0 }}><Headphones size={24} /></div>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>AI Call Recording & Transcripts</h3>
                <p style={{ fontSize: '14px' }}>Every conversation is securely recorded and transcribed.</p>
              </div>
            </div>

            <div className="step-card feature-card" style={{ display: 'flex', gap: '16px', padding: '24px', alignItems: 'flex-start' }}>
              <div className="step-icon" style={{ marginBottom: 0, width: '48px', height: '48px', flexShrink: 0 }}><Clock size={24} /></div>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>24×7 AI Call Handling</h3>
                <p style={{ fontSize: '14px' }}>Never miss enquiries after office hours.</p>
              </div>
            </div>

            <div className="step-card feature-card" style={{ display: 'flex', gap: '16px', padding: '24px', alignItems: 'flex-start' }}>
              <div className="step-icon" style={{ marginBottom: 0, width: '48px', height: '48px', flexShrink: 0 }}><Building2 size={24} /></div>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>CRM Integration</h3>
                <p style={{ fontSize: '14px' }}>Automatically update customer details, follow-ups & sales pipeline.</p>
              </div>
            </div>

            <div className="step-card feature-card" style={{ display: 'flex', gap: '16px', padding: '24px', alignItems: 'flex-start' }}>
              <div className="step-icon" style={{ marginBottom: 0, width: '48px', height: '48px', flexShrink: 0 }}><CheckCircle2 size={24} /></div>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Lead Qualification</h3>
                <p style={{ fontSize: '14px' }}>Automatically identify genuine buyers and prioritize high-value leads.</p>
              </div>
            </div>

            <div className="step-card feature-card" style={{ display: 'flex', gap: '16px', padding: '24px', alignItems: 'flex-start' }}>
              <div className="step-icon" style={{ marginBottom: 0, width: '48px', height: '48px', flexShrink: 0 }}><BarChart3 size={24} /></div>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Real-Time Analytics Dashboard</h3>
                <p style={{ fontSize: '14px' }}>Track call volume, lead quality, conversions & team performance.</p>
              </div>
            </div>

            <div className="step-card feature-card" style={{ display: 'flex', gap: '16px', padding: '24px', alignItems: 'flex-start' }}>
              <div className="step-icon" style={{ marginBottom: 0, width: '48px', height: '48px', flexShrink: 0 }}><Zap size={24} /></div>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Smart Appointment Booking</h3>
                <p style={{ fontSize: '14px' }}>Schedule meetings with your sales team automatically.</p>
              </div>
            </div>

            <div className="step-card feature-card" style={{ display: 'flex', gap: '16px', padding: '24px', alignItems: 'flex-start' }}>
              <div className="step-icon" style={{ marginBottom: 0, width: '48px', height: '48px', flexShrink: 0 }}><MessageSquare size={24} /></div>
              <div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Automated Follow-Ups</h3>
                <p style={{ fontSize: '14px' }}>Reduce missed opportunities with AI-powered reminders.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section id="perfect-for" className="use-cases-section" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <h2 className="section-title" style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '40px', color: 'var(--color-primary)' }}>
            Perfect For
          </h2>
          
          <div className="use-cases-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
            <div className="use-case-card glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <Building2 size={32} className="use-case-icon" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', marginBottom: 0 }}>Textile Manufacturers</h3>
            </div>
            <div className="use-case-card glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <ShoppingCart size={32} className="use-case-icon" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', marginBottom: 0 }}>Fabric Suppliers</h3>
            </div>
            <div className="use-case-card glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <Zap size={32} className="use-case-icon" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', marginBottom: 0 }}>Yarn Manufacturers</h3>
            </div>
            <div className="use-case-card glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <Briefcase size={32} className="use-case-icon" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', marginBottom: 0 }}>Garment Manufacturers</h3>
            </div>
            <div className="use-case-card glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <Globe size={32} className="use-case-icon" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', marginBottom: 0 }}>Export Houses</h3>
            </div>
            <div className="use-case-card glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <Users size={32} className="use-case-icon" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', marginBottom: 0 }}>Textile Traders & Distributors</h3>
            </div>
            <div className="use-case-card glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <ShoppingCart size={32} className="use-case-icon" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', marginBottom: 0 }}>Wholesalers</h3>
            </div>
            <div className="use-case-card glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
              <ShoppingCart size={32} className="use-case-icon" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '16px', marginBottom: 0 }}>Retailers</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Banner CTA */}
      <section style={{ padding: '60px 24px', background: 'var(--premium-gradient)', textAlign: 'center', margin: '60px 0' }}>
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', margin: 0 }}>More Calls. More Qualified Leads. More Sales.</h2>
          <p style={{ fontSize: '20px', color: 'rgba(255,255,255,0.9)', margin: '0 0 20px 0', maxWidth: '600px' }}>
            Let AI Handle Your Calls While Your Sales Team Focuses on Closing More Orders.
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', width: '100%', marginBottom: '10px' }}>
              CLOSE MORE DEALS. RESPOND FASTER. GROW YOUR TEXTILE BUSINESS WITH AI.
            </p>
            <button onClick={() => setShowDemoModal(true)} className="cta-button" style={{ background: '#fff', color: 'var(--color-primary)', padding: '16px 32px', fontSize: '18px' }}>
              BOOK A FREE DEMO TODAY
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <h2 className="section-title">Simple, transparent pricing</h2>
          <div className="pricing-grid">
            {pricingPlans.length > 0 ? pricingPlans.map(plan => (
              <div key={plan.id} className={`pricing-card glass-panel ${plan.is_popular ? 'popular' : ''}`}>
                {plan.is_popular && <div className="popular-badge">Most Popular</div>}
                <h3 className="pricing-plan">{plan.plan_name}</h3>
                <div className="pricing-price">
                  {plan.price}<span className="pricing-period">/mo</span>
                </div>
                <p className="pricing-desc">{plan.description}</p>
                <ul className="pricing-features">
                  {Array.isArray(plan.features) ? plan.features.map((feature, i) => (
                    <li key={i} className="pricing-feature"><CheckCircle2 size={18} className="check-icon" /> {feature}</li>
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
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer glass-panel">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo-icon small">T</div>
            <span className="brand-title">TexVibe <span>AI</span></span>
          </div>
          <p>© 2026 Microtechnique IT and Communications Sol. All rights reserved.</p>
        </div>
      </footer>

      {/* Demo Request Modal */}
      {showDemoModal && (
        <div className="modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDemoModal(false)}>
              <X size={24} />
            </button>
            <h3 className="modal-title">Request a Demo</h3>
            <p className="modal-subtitle">Leave your details and our team will get back to you shortly to schedule a personalized walkthrough.</p>
            
            {submitSuccess ? (
              <div className="success-state">
                <CheckCircle2 size={48} className="success-icon" />
                <h4>Request Received!</h4>
                <p>We'll be in touch very soon.</p>
              </div>
            ) : (
              <form className="demo-form" onSubmit={handleDemoSubmit}>
                <input 
                  type="text" className="demo-input" placeholder="Full Name" required 
                  value={demoForm.name} onChange={e => setDemoForm({...demoForm, name: e.target.value})}
                />
                <input 
                  type="email" className="demo-input" placeholder="Work Email" required 
                  value={demoForm.email} onChange={e => setDemoForm({...demoForm, email: e.target.value})}
                />
                <input 
                  type="tel" className="demo-input" placeholder="Phone Number" required 
                  value={demoForm.phone} onChange={e => setDemoForm({...demoForm, phone: e.target.value})}
                />
                <input 
                  type="text" className="demo-input" placeholder="Company Name" required 
                  value={demoForm.company} onChange={e => setDemoForm({...demoForm, company: e.target.value})}
                />
                <button type="submit" className="demo-submit glow-effect" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
                
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '10px' }}>Or book instantly via WhatsApp</p>
                  <a 
                    href="https://wa.me/916355997080?text=Hi!%20I%20would%20like%20to%20book%20a%20demo%20for%20MicroTechnique%20AI." 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      background: '#25D366', 
                      color: 'white', 
                      padding: '10px 20px', 
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    <MessageCircle size={18} />
                    Chat on WhatsApp
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
