"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Prompt } from "@/lib/data";

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPromptData, setNewPromptData] = useState({ title: '', description: '' });

  useEffect(() => {
    setMounted(true);
    fetch("/api/prompts")
      .then((res) => res.json())
      .then((data) => {
        setPrompts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch prompts:", err);
        setLoading(false);
      });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptData.title) return;
    
    const res = await fetch("/api/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title: newPromptData.title, 
        description: newPromptData.description || "Neural Blueprint Phase 1" 
      }),
    });
    
    if (res.ok) {
      const data = await res.json();
      setPrompts([...prompts, data]);
      setIsModalOpen(false);
      setNewPromptData({ title: '', description: '' });
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-16 lg:space-y-24 opacity-0 animate-[fadeIn_0.7s_ease-out_forwards]">
      
      {/* HERO SECTION */}
      <section className="relative py-12 lg:py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl space-y-8 stagger-in">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
             System Status: Operational
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Next-Gen <span className="text-gradient">Prompt Orchestration</span>
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            Streamline your prompt engineering workflow with high-fidelity logic auditing and neural blueprinting. Professional tools for modern AI orchestration.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <span>Create Blueprint</span>
            </button>
            <button className="btn-secondary">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-40 skeleton" />)
        ) : (
          [
            { label: 'Blueprints', val: prompts.length, color: 'text-blue-600 dark:text-blue-400', sub: 'Deployment Ready' },
            { label: 'Versions', val: prompts.reduce((acc, p) => acc + p.versions.length, 0), color: 'text-indigo-600 dark:text-indigo-400', sub: 'Version Controllable' },
            { label: 'Latency', val: '~1.1s', color: 'text-emerald-600 dark:text-emerald-400', sub: 'Optimized Routing' }
          ].map((stat, i) => (
            <div key={i} className="card-clean group">
              <div className="flex flex-col space-y-4">
                <span className="badge w-fit">{stat.label}</span>
                <div className={`text-5xl font-bold ${stat.color} tracking-tight`}>{stat.val}</div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{stat.sub}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* REGISTRY */}
      <section className="space-y-10 pb-20">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Active Registry</h2>
          <span className="text-sm font-medium text-slate-500">{loading ? '...' : prompts.length} Blueprints Active</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 skeleton" />)
          ) : (
            <>
              {prompts.length === 0 ? (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Registry Empty</h3>
                  <p className="text-slate-500 max-w-sm">No active blueprints found in your workspace. Initialize your first architecture to begin orchestration.</p>
                </div>
              ) : (
                prompts.map((prompt) => (
                  <Link key={prompt.prompt_id} href={`/prompts/${prompt.prompt_id}`} className="group">
                    <div className="card-clean h-full flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            ID-{prompt.prompt_id.slice(-4).toUpperCase()}
                          </span>
                          <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{prompt.title}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{prompt.description}</p>
                        </div>
                      </div>
                      <div className="pt-8 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800">{prompt.current_version}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{prompt.versions.length} Artifacts</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="group card-clean border-dashed border-2 flex flex-col items-center justify-center space-y-4 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-blue-200 min-h-[280px]"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-widest">Add Blueprint</span>
              </button>
            </>
          )}
        </div>
      </section>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">New Blueprint</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Architecture Title</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newPromptData.title}
                  onChange={e => setNewPromptData({...newPromptData, title: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                  placeholder="e.g. Technical Documentation Engine"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Description</label>
                <textarea 
                  value={newPromptData.description}
                  onChange={e => setNewPromptData({...newPromptData, description: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium h-32 resize-none"
                  placeholder="Brief summary of this prompt's objective..."
                />
              </div>
              <button type="submit" className="w-full btn-primary !py-4 shadow-blue-500/20 shadow-lg">Initialize Architecture</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
