'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  Eye 
} from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import BrandLogo from '@/components/BrandLogo';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = isLogin
        ? await authAPI.login(email, password)
        : await authAPI.register(email, password);

      login(data.user, data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    const demoEmail = 'demo.candidate@resumeiq.io';
    const demoPassword = 'DemoPassword123!';
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      try {
        const { data } = await authAPI.login(demoEmail, demoPassword);
        login(data.user, data.token);
        router.push('/dashboard');
        return;
      } catch {
        const { data } = await authAPI.register(demoEmail, demoPassword);
        login(data.user, data.token);
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Top Bar with back to home */}
      <div style={{
        position: 'fixed',
        top: 24,
        left: 32,
        right: 32,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 20,
      }}>
        <Link href="/" className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} />
          Back to Home
        </Link>
      </div>

      <div className="auth-card animate-in">
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', marginBottom: 12 }}>
            <BrandLogo size="lg" badgeText="100% Free" />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: 4 }}>
            {isLogin ? 'Sign In to Workspace' : 'Create Free Account'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isLogin ? 'Access your parsed resumes, STAR rewrites, and interview diagnostics' : 'Join the free open-source career intelligence platform'}
          </p>
        </div>

        {/* Segmented Mode Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: 4,
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          marginBottom: 18,
        }}>
          <button
            type="button"
            className={`btn btn-sm ${isLogin ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              borderRadius: 'var(--radius-sm)',
              boxShadow: isLogin ? 'var(--shadow-xs)' : 'none',
              fontWeight: isLogin ? 750 : 550,
            }}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${!isLogin ? 'btn-secondary' : 'btn-ghost'}`}
            style={{
              borderRadius: 'var(--radius-sm)',
              boxShadow: !isLogin ? 'var(--shadow-xs)' : 'none',
              fontWeight: !isLogin ? 750 : 550,
            }}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Register
          </button>
        </div>

        {/* 1-Click Instant Demo Login CTA */}
        <div style={{ marginBottom: 18 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDemoLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1.5px solid rgba(67, 56, 202, 0.25)',
              background: 'rgba(67, 56, 202, 0.04)',
              color: 'var(--accent-primary)',
              fontWeight: 700,
            }}
          >
            <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
            Instant 1-Click Demo Candidate Login
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0 12px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 650 }}>
              or continue with email
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger-text)',
            fontSize: '0.825rem',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                type="email"
                className="input"
                style={{ paddingLeft: 38 }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                type="password"
                className="input"
                style={{ paddingLeft: 38 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={16} className="spinner" /> Authenticating...</>
            ) : (
              <>
                {isLogin ? 'Sign In to Workspace' : 'Create Free Account'}
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
            <span>256-bit encrypted • Zero-retention candidate sandbox</span>
          </div>
        </div>
      </div>
    </div>
  );
}
