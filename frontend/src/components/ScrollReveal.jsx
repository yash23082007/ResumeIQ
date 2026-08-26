'use client';
import { useEffect, useRef } from 'react';

/**
 * ScrollReveal — Wraps children and adds .visible class when element enters viewport.
 * Uses IntersectionObserver for performance. Supports stagger delays for children.
 */
export default function ScrollReveal({ children, className = '', threshold = 0.15, stagger = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}
