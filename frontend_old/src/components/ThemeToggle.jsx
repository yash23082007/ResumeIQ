import { Sun } from 'lucide-react';

export default function ThemeToggle({ className = '', size = 14 }) {
  return (
    <div
      className={`theme-badge-pill ${className}`}
      title="ResumeIQ Modern Light Experience"
    >
      <Sun size={size} className="text-amber-500" style={{ color: '#d97706' }} />
      <span>Light Mode</span>
    </div>
  );
}
