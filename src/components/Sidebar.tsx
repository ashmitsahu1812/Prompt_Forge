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

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[80] lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[90]
        w-72 lg:w-80 h-screen flex flex-col 
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        transition-transform duration-300 ease-in-out shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center space-x-3" onClick={onClose}>
              <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                P
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                PromptForge
              </span>
            </Link>
            
            <button 
              onClick={onClose}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            <span className="block px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
              Workspace
            </span>
            
            <Link 
              href="/" 
              onClick={onClose} 
              className={`nav-link group/link ${isActive('/') ? 'nav-link-active' : ''}`}
            >
              <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('/') ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover/link:text-blue-600 group-hover/link:bg-blue-50 dark:group-hover/link:bg-blue-900/20'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              </div>
              <span>Dashboard</span>
            </Link>

            <Link href="/templates" onClick={onClose} className={`nav-link ${isActive('/templates') ? 'nav-link-active' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              <span>Templates</span>
            </Link>

            <Link href="/test-suites" onClick={onClose} className={`nav-link ${isActive('/test-suites') ? 'nav-link-active' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              <span>Input Forge</span>
            </Link>

            <div className="pt-8">
              <span className="block px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                Analysis
              </span>
              <Link 
                href="/compare" 
                onClick={onClose} 
                className={`nav-link group/link ${isActive('/compare') ? 'nav-link-active' : ''}`}
              >
                <div className={`p-2 rounded-lg transition-all duration-300 ${isActive('/compare') ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover/link:text-blue-600 group-hover/link:bg-blue-50 dark:group-hover/link:bg-blue-900/20'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <span>Neural Dual</span>
              </Link>
            </div>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold ring-2 ring-white dark:ring-slate-900">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">Archway Prime</div>
                <div className="text-xs text-slate-500 truncate">Professional Plan</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
