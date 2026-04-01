"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Link from "next/link";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full relative bg-white dark:bg-slate-950 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex-1 flex flex-col h-screen min-w-0">
        {/* Simplified Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">P</div>
            <span className="font-bold text-slate-900 dark:text-white tracking-tight">PromptForge</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950/20 px-6 py-8 md:px-12 md:py-16">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
