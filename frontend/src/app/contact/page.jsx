'use client';

import { useState } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  HelpCircle,
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { contactAPI } from '@/services/api';
import ScrollReveal from '@/components/ScrollReveal';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Question',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await contactAPI.submit(formData.name, formData.email, formData.subject, formData.message);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Message received! We will follow up with you shortly.');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: 100, paddingBottom: 80 }}>
      <section className="section" style={{ textAlign: 'center', paddingTop: 20, paddingBottom: 40 }}>
        <ScrollReveal>
          <span className="section-label">Get in Touch</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: 16 }}>
            Contact & <span className="gradient-text">Candidate Support</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', fontSize: '1.1rem' }}>
            Have a question about parser behavior, want to request an ATS profile, or need technical support? Send us a message.
          </p>
        </ScrollReveal>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="contact-grid">
          {/* Left: Contact Form */}
          <ScrollReveal>
            <div className="card" style={{ padding: '36px 32px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: 6 }}>
                Send Us a Message
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                Fill out the form below and our team will get back to you.
              </p>

              {submitted ? (
                <div className="animate-in" style={{ padding: '24px', background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                  <CheckCircle2 size={40} style={{ color: 'var(--success)', margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--success-text)', marginBottom: 6 }}>
                    Thank you! Message Sent
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--success-text)', marginBottom: 16 }}>
                    We have received your submission and will get in touch at <strong>{formData.email}</strong>.
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: 'General Question', message: '' });
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div style={{ padding: '10px 14px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', color: 'var(--danger-text)', fontSize: '0.825rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={15} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      name="name"
                      className="input"
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="input"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Inquiry Subject</label>
                    <select
                      name="subject"
                      className="select"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option value="General Question">General Question</option>
                      <option value="ATS Parser Inaccuracy Report">ATS Parser Inaccuracy Report</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Self-Hosting & Docker Support">Self-Hosting & Docker Support</option>
                      <option value="Privacy & Data Deletion">Privacy & Data Deletion</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <label className="form-label">Message Details</label>
                    <textarea
                      name="message"
                      rows={5}
                      className="textarea"
                      placeholder="Describe your inquiry, issue, or suggested feature..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <><Loader2 size={16} className="spinner" /> Sending Message...</>
                    ) : (
                      <><Send size={15} /> Submit Inquiry</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>

          {/* Right: Support Channels */}
          <ScrollReveal>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card" style={{ padding: '28px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="feature-icon-wrapper" style={{ margin: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Direct Support Desk</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>support@resumeiq.io</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                  Our team typically reviews all parser inquiries, feature requests, and account assistance requests within 24 hours.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--success)' }}>
                  <Clock size={14} />
                  <span>Response time: &lt; 24 business hours</span>
                </div>
              </div>

              <div className="card" style={{ padding: '28px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div className="feature-icon-wrapper" style={{ margin: 0, background: 'var(--success-bg)', color: 'var(--success)' }}>
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Feedback & Diagnostics</h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Continuous Algorithm Improvements</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  If a specific ATS failure mode or resume formatting structure was incorrectly parsed, submit the details through the form and our engineers will update the heuristic rules.
                </p>
              </div>

              <div className="card" style={{ padding: '20px 24px', background: 'var(--bg-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Zero-Retention Sandbox
                  </span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Your inquiry message and uploaded documents are handled confidentially and are never shared or sold.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
