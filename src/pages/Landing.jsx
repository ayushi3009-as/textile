import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, MessageSquare, Zap, Globe, CheckCircle2, ArrowRight, X, BarChart3, Clock, Headphones, 
  UploadCloud, BrainCircuit, LineChart, Building2, ShoppingCart, Briefcase, Moon, Sun
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
            <span className="badge-dot"></span> Next-Gen Voice Intelligence
          </div>
          <h1 className="hero-title fade-up delay-1">
            The AI Voice Agent That <br/>
            <span className="hero-title-highlight">Closes Deals For You.</span>
          </h1>
          <p className="hero-subtitle fade-up delay-2">
            Automate your textile business with hyper-realistic AI. Our agent instantly calls your wholesale buyers, pushes new catalogs, negotiates fabric rates, and updates your CRM automatically—24/7, in English, Hindi, or Gujarati.
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

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How TexVibe Works</h2>
          <p className="section-subtitle">A seamless 3-step process to put your sales on autopilot.</p>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon"><UploadCloud size={32} /></div>
              <h3>Upload & Connect</h3>
              <p>Connect your existing CRM or upload a simple Excel sheet of leads. Our system instantly maps your data and prepares the campaign.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon"><BrainCircuit size={32} /></div>
              <h3>AI Autopilot Calls</h3>
              <p>TexVibe AI initiates outbound calls. It converses smoothly in English, Hindi, or Gujarati, handling complex objections like a seasoned human agent.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon"><LineChart size={32} /></div>
              <h3>Instant Insights</h3>
              <p>The moment the call ends, you receive a full transcript, an audio recording, and a definitive Hot/Cold lead score directly in your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="use-cases-section">
        <div className="container">
          <h2 className="section-title">Built exclusively for the Textile Industry</h2>
          
          <div className="use-cases-grid">
            <div className="use-case-card glass-panel">
              <Building2 size={40} className="use-case-icon" />
              <h3>Wholesalers & Distributors</h3>
              <p>Automate calls to retail shops to push new catalog arrivals, clear dead stock, and gracefully remind them about pending payments without tying up your staff.</p>
            </div>
            <div className="use-case-card glass-panel">
              <Briefcase size={40} className="use-case-icon" />
              <h3>Mills & Manufacturers</h3>
              <p>Handle inbound inquiries from traders instantly. The AI negotiates bulk fabric rates, checks live inventory, and books large manufacturing orders 24/7.</p>
            </div>
            <div className="use-case-card glass-panel">
              <ShoppingCart size={40} className="use-case-icon" />
              <h3>Retail Brands & Boutiques</h3>
              <p>Engage directly with end-consumers. Automatically call customers with updates on custom stitching, abandoned carts, or exclusive festive saree offers.</p>
            </div>
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
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
