"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  const navItem = (href: string, label: string, icon: React.ReactNode) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        onClick={onClose}
        className={`nav-link-premium ${active ? 'nav-link-active-premium' : ''}`}
      >
        <div style={{
          padding: '0.625rem',
          borderRadius: '0.75rem',
          background: active ? '#3b82f6' : 'rgba(255,255,255,0.06)',
          color: active ? '#fff' : '#94a3b8',
          transition: 'all 0.25s ease',
          flexShrink: 0,
          boxShadow: active ? '0 4px 16px rgba(59,130,246,0.35)' : 'none'
        }}>
          {icon}
        </div>
        <span style={{ color: active ? '#f1f5f9' : '#94a3b8', fontWeight: active ? 700 : 500 }}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[80] lg:hidden"
          style={{ background: 'rgba(2,6,23,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[90]
        w-72 lg:w-72 h-screen flex flex-col shrink-0
        glass-panel transition-transform duration-500 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-6">

          {/* Logo */}
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
              <div style={{
                width: 44, height: 44,
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 900, fontSize: 18,
                boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
                flexShrink: 0
              }}>
                P
              </div>
              <div>
                <div style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em', lineHeight: 1 }}>
                  Forge
                </div>
                <div style={{ color: '#3b82f6', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 3 }}>
                  Studio v2.0
                </div>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl transition-colors"
              style={{ color: '#94a3b8' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            <div style={{ padding: '0 0.75rem', marginBottom: '0.75rem', fontSize: 9, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
              Core Engine
            </div>

            {navItem('/', 'Dashboard',
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )}

            {navItem('/test-suites', 'Input Forge',
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}

            {navItem('/templates', 'Template Library',
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            )}

            <div style={{ paddingTop: '1.5rem' }}>
              <div style={{ padding: '0 0.75rem', marginBottom: '0.75rem', fontSize: 9, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
                Analysis & Optimization
              </div>

              {navItem('/compare', 'Neural Dual',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}

              {navItem('/analytics', 'Performance Insights',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
            </div>

            <div style={{ paddingTop: '1.5rem' }}>
              <div style={{ padding: '0 0.75rem', marginBottom: '0.75rem', fontSize: 9, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.25em' }}>
                Collaboration & Extensions
              </div>

              {navItem('/team', 'Team Management',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              )}

              {navItem('/plugins', 'Plugin Manager',
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1v-1a2 2 0 012-2z" />
                </svg>
              )}
            </div>
          </nav>

          {/* User profile */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', marginTop: '1rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '0.875rem 1rem',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 13, fontWeight: 900,
                flexShrink: 0, boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
              }}>
                AP
              </div>
              <div>
                <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 700 }}>Archway Prime</div>
                <div style={{ color: '#3b82f6', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Neural Pro</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
