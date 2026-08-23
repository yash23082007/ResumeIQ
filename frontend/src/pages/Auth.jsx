import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../App';
import { authAPI } from '../services/api';
import ThemeToggle from '../components/ThemeToggle';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = isLogin
        ? await authAPI.login(email, password)
        : await authAPI.register(email, password);

      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo.candidate@resumeiq.io');
    setPassword('DemoPassword123!');
    setError('');
    setLoading(true);

    try {
      // Try login first, if user doesn't exist, register demo user
      try {
        const { data } = await authAPI.login('demo.candidate@resumeiq.io', 'DemoPassword123!');
        login(data.user, data.token);
        navigate('/dashboard');
        return;
      } catch {
        const { data } = await authAPI.register('demo.candidate@resumeiq.io', 'DemoPassword123!');
        login(data.user, data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Top Bar with back to home & theme switcher */}
      <div style={{
        position: 'fixed',
        top: 'var(--space-lg)',
        left: 'var(--space-lg)',
        right: 'var(--space-lg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
          <ArrowLeft size={14} />
          Back to Home
        </button>
        <ThemeToggle />
      </div>

      <div className="auth-card animate-in">
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'inline-flex', marginBottom: 'var(--space-sm)' }}>
            <div className="logo-icon" style={{ width: 42, height: 42, fontSize: '1rem' }}>
              IQ
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>
            {isLogin ? 'Sign In to ResumeIQ' : 'Create your Account'}
          </h2>
          <p style={{ fontSize: '0.875rem' }}>
            {isLogin ? 'Access your resume reports and AI insights' : 'Start scoring your resume with AI semantic intelligence'}
          </p>
        </div>

        {/* Segmented Mode Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: 4,
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          marginBottom: 'var(--space-lg)',
        }}>
          <button
            type="button"
            className={`btn btn-sm ${isLogin ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${!isLogin ? 'btn-secondary' : 'btn-ghost'}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger)',
            fontSize: '0.825rem',
            marginBottom: 'var(--space-md)',
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
            <label className="form-label">Work or Personal Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                className="input"
                type="email"
                placeholder="alex.morgan@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: 38 }}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }} />
              <input
                className="input"
                type="password"
                placeholder={isLogin ? '••••••••' : 'Min 8 characters'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: 38 }}
                required
                minLength={8}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </div>
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', marginBottom: 'var(--space-md)' }}>
            {loading ? (
              <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Account Helper */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 'var(--space-md)',
          textAlign: 'center',
        }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            onClick={handleDemoLogin}
            disabled={loading}
          >
            <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
            Try Instant Demo Account
          </button>
        </div>
      </div>
    </div>
  );
}
