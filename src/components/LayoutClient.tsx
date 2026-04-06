"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Link from "next/link";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div suppressHydrationWarning style={{ display: 'flex', height: '100vh', width: '100%', position: 'relative', overflow: 'hidden', background: 'var(--background)' }}>
      
      {/* Neural Atmosphere: Animated background glows */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="animate-float" style={{
          position: 'absolute', top: '-10%', left: '-10%',
          width: '40%', height: '40%', borderRadius: '9999px',
          background: 'rgba(59,130,246,0.08)', filter: 'blur(120px)'
        }} />
        <div className="animate-float" style={{
          position: 'absolute', top: '40%', right: '-10%',
          width: '35%', height: '35%', borderRadius: '9999px',
          background: 'rgba(99,102,241,0.07)', filter: 'blur(100px)',
          animationDelay: '2s'
        }} />
        <div className="animate-float" style={{
          position: 'absolute', bottom: '-10%', left: '20%',
          width: '30%', height: '30%', borderRadius: '9999px',
          background: 'rgba(59,130,246,0.05)', filter: 'blur(80px)',
          animationDelay: '4s'
        }} />
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0, position: 'relative', zIndex: 10 }}>
        {/* Mobile Header */}
        <header className="lg:hidden" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          position: 'sticky', top: 0, zIndex: 40
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 900, fontSize: 14
            }}>P</div>
            <span style={{ color: '#f1f5f9', fontWeight: 900, fontSize: 16 }}>PromptForge</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{ padding: '0.5rem', color: '#94a3b8' }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </header>

        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '3rem 2rem',
        }}>
          <div style={{ maxWidth: '88rem', margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
