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
    <div className="space-y-20 lg:space-y-32 fade-in">

      {/* HERO SECTION */}
      <section className="relative py-16 lg:py-28 overflow-hidden">
        <div className="max-w-4xl space-y-10 stagger-in relative z-10">
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-electric-500/10 border border-electric-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-electric-500 shadow-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-500"></span>
            </span>
            <span>Neural Engine: Online</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-[0.9] font-display">
            The Digital <span className="text-electric-500 text-glow">Loom</span> <br />
            for AI Logic
          </h1>
          <p className="text-xl lg:text-2xl text-neural-400 leading-relaxed font-medium max-w-2xl">
            Architect, audit, and orchestrate high-fidelity prompt structures. Professional-grade tools for the next generation of AI engineers.
          </p>
          <div className="flex flex-wrap gap-6 pt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-premium"
            >
              <span>Initialize Blueprint</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </button>
            <button
              onClick={() => window.open('/api/export?format=json&include=prompts,test_suites,templates,results', '_blank')}
              className="px-8 py-4 rounded-2xl font-bold bg-neural-100 dark:bg-neural-900 border border-border dark:border-white/5 hover:border-electric-500/30 transition-all"
            >
              Export Data
            </button>
            <button className="px-8 py-4 rounded-2xl font-bold bg-neural-100 dark:bg-neural-900 border border-border dark:border-white/5 hover:border-electric-500/30 transition-all">
              Documentation
            </button>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-44 card-premium skeleton" />)
        ) : (
          [
            { label: 'Neural Blueprints', val: prompts.length, color: 'text-electric-500', sub: 'Deployment Ready' },
            { label: 'Total Artifacts', val: prompts.reduce((acc, p) => acc + p.versions.length, 0), color: 'text-neon-500', sub: 'Versioned Assets' },
            { label: 'System Latency', val: '1.2ms', color: 'text-emerald-500', sub: 'Optimized Logic' }
          ].map((stat, i) => (
            <div key={i} className="card-premium group hover:border-electric-500/30">
              <div className="flex flex-col space-y-6">
                <span className="text-[10px] font-black text-neural-400 uppercase tracking-[0.2em]">{stat.label}</span>
                <div className={`text-6xl font-black ${stat.color} tracking-tighter font-display text-glow`}>{stat.val}</div>
                <div className="text-[10px] font-bold text-neural-400 uppercase tracking-widest opacity-60 italic">{stat.sub}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* REGISTRY */}
      <section className="space-y-12 pb-32">
        <div className="flex items-end justify-between border-b border-border dark:border-white/5 pb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tight font-display">Active Registry</h2>
            <p className="text-sm text-neural-400 font-medium italic">Validated architectures currently in workspace</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-foreground font-display">{loading ? '...' : prompts.length}</span>
            <div className="text-[10px] font-black text-neural-400 uppercase tracking-widest mt-1">Found Instances</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-72 card-premium skeleton" />)
          ) : (
            <>
              {prompts.length === 0 ? (
                <div className="col-span-full py-32 card-premium border-dashed border-2 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 rounded-3xl bg-neural-50 dark:bg-neural-900 flex items-center justify-center text-neural-200 mb-2">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-foreground tracking-tight font-display">Registry Depleted</h3>
                    <p className="text-neural-400 max-w-sm font-medium">No active architectures detected. Initialize a logic loom to begin your workflow.</p>
                  </div>
                </div>
              ) : (
                prompts.map((prompt) => (
                  <Link key={prompt.prompt_id} href={`/prompts/${prompt.prompt_id}`} className="group">
                    <div className="card-premium h-full flex flex-col justify-between hover:bg-neural-50/50 dark:hover:bg-neural-900/50">
                      <div className="space-y-8">
                        <div className="flex justify-between items-center">
                          <div className="px-3 py-1 bg-neural-50 dark:bg-neural-950/50 rounded-lg border border-border dark:border-white/5 text-[9px] font-black text-neural-400 uppercase tracking-widest group-hover:border-electric-500/30 group-hover:text-electric-500 transition-colors">
                            ID-{prompt.prompt_id.slice(-6).toUpperCase()}
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-neural-50 dark:bg-neural-950 flex items-center justify-center text-neural-300 group-hover:text-electric-500 group-hover:bg-electric-500/10 group-hover:scale-110 transition-all duration-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-2xl font-black text-foreground group-hover:text-electric-500 transition-colors font-display tracking-tight leading-[1.1]">{prompt.title}</h3>
                          <p className="text-base text-neural-400 leading-relaxed line-clamp-3 font-medium opacity-80">{prompt.description}</p>
                        </div>
                      </div>
                      <div className="pt-8 mt-10 border-t border-border dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-neural-500 uppercase tracking-widest">Version</span>
                            <span className="text-sm font-black text-electric-500 font-display">{prompt.current_version}</span>
                          </div>
                          <div className="w-px h-8 bg-border dark:bg-white/5 mx-2" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-neural-500 uppercase tracking-widest">Artifacts</span>
                            <span className="text-sm font-black text-foreground font-display">{prompt.versions.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}

              <button
                onClick={() => setIsModalOpen(true)}
                className="group card-premium border-dashed border-2 flex flex-col items-center justify-center space-y-6 hover:bg-neural-50/50 dark:hover:bg-neural-900/50 hover:border-electric-500/40 min-h-[320px] transition-all duration-500"
              >
                <div className="w-16 h-16 rounded-2xl bg-neural-50 dark:bg-neural-950 flex items-center justify-center text-neural-400 group-hover:text-electric-500 group-hover:scale-110 transition-all duration-500 shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-sm font-black text-foreground uppercase tracking-[0.2em]">New Thread</div>
                  <div className="text-[10px] font-bold text-neural-400 uppercase tracking-widest opacity-60">Initialize Architecture</div>
                </div>
              </button>
            </>
          )}
        </div>
      </section>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neural-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out_forwards]" onClick={() => setIsModalOpen(false)}>
          <div className="card-premium w-full max-w-xl shadow-2xl animate-[zoomIn_0.3s_ease-out_forwards]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tight font-display">New Blueprint</h2>
                <p className="text-[10px] font-bold text-neural-400 uppercase tracking-[0.3em]">Phase 01: Initialization</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-neural-400 hover:text-foreground transition-colors hover:bg-neural-100 dark:hover:bg-white/5 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Architecture Title</label>
                <input
                  autoFocus
                  type="text"
                  value={newPromptData.title}
                  onChange={e => setNewPromptData({ ...newPromptData, title: e.target.value })}
                  className="input-forge !py-5 !px-6 !text-lg"
                  placeholder="e.g. Technical Nexus v1.0"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Objective Summary</label>
                <textarea
                  value={newPromptData.description}
                  onChange={e => setNewPromptData({ ...newPromptData, description: e.target.value })}
                  className="input-forge !h-40 !py-5 !px-6 !text-lg resize-none"
                  placeholder="Define the primary logic of this blueprint..."
                />
              </div>
              <button type="submit" className="w-full btn-premium !py-5 shadow-2xl">
                <span>Deploy Blueprint</span>
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
