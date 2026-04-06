"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TestSuites() {
  const [suites, setSuites] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [inputs, setInputs] = useState('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/test-suites').then(res => res.json()).then(data => {
      setSuites(data);
      setLoading(false);
    });
  }, []);

  const handleTilt = (e: React.MouseEvent<HTMLDivElement>, card: HTMLDivElement) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height;
    const y = (e.clientX - rect.left) / rect.width;
    const rx = (x - 0.5) * -15;
    const ry = (y - 0.5) * 15;
    card.style.setProperty('--rx', `${rx}deg`);
    card.style.setProperty('--ry', `${ry}deg`);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawInputs = inputs.split('\n').filter(i => i.trim() !== '');
    
    // Attempt to parse each line as a JSON variable set
    const parsedInputs = rawInputs.map(line => {
      try {
        if (line.trim().startsWith('{')) {
          return JSON.parse(line);
        }
      } catch (e) {}
      return line; // Fallback to string
    });

    const res = await fetch('/api/test-suites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, inputs: parsedInputs }),
    });
    if (res.ok) {
      const newSuite = await res.json();
      setSuites([...suites, newSuite]);
      setName('');
      setInputs('');
    }
  };

  if (!mounted || loading) return (
    <div className="flex flex-col h-full space-y-12 stagger-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="h-4 w-32 skeleton rounded-full" />
          <div className="h-16 w-80 skeleton rounded-2xl" />
          <div className="h-4 w-full max-w-xl skeleton rounded-full" />
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-5 h-[600px] skeleton rounded-[2rem]" />
        <div className="lg:col-span-7 space-y-12">
          <div className="h-20 skeleton rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 skeleton rounded-[2rem]" />
            <div className="h-96 skeleton rounded-[2rem]" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-20 lg:space-y-32 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5 mb-16">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-neon-500/10 border border-neon-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-neon-500 shadow-glow shadow-neon-500/10">
             <span>Phase 02: Verification</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-foreground tracking-tighter font-display leading-none">
            Input <span className="text-neon-500 text-glow shadow-neon-500/20">Forge</span>
          </h1>
          <p className="text-xl text-neural-400 font-medium max-w-2xl leading-relaxed italic opacity-80">
            Define multi-variable test schemas for high-fidelity prompt auditing. Use strings for simple inputs or JSON for deep orchestration.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <section className="lg:col-span-5 flex flex-col">
          <div className="card-premium !bg-neural-50/50 dark:!bg-neural-950/20 sticky top-12 border-2 border-border dark:border-white/5">
            <h2 className="text-sm font-black text-foreground uppercase tracking-[0.3em] mb-12 flex items-center space-x-3">
              <span className="w-2.5 h-2.5 bg-neon-500 rounded-full animate-pulse shadow-glow shadow-neon-500/40" />
              <span>Initialize Suite</span>
            </h2>
            <form onSubmit={handleSave} className="space-y-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Protocol Identifier</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Edge Logic v1"
                  className="input-forge !py-4 !px-6"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em]">Test Vectors</label>
                  <span className="text-[10px] font-bold text-neon-500 italic uppercase">JSON Supported</span>
                </div>
                <textarea 
                  rows={8}
                  value={inputs} 
                  onChange={e => setInputs(e.target.value)}
                  placeholder='Enter test case per line...&#10;{"topic": "quantum", "tone": "pro"}'
                  className="input-forge !py-4 !px-6 !h-64 resize-none !text-sm leading-relaxed"
                />
              </div>
              <button className="w-full btn-premium !py-5 shadow-neon-500/10 active:shadow-none">
                <span>Deploy Test Suite</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-7 space-y-16">
          <div className="flex items-end justify-between border-b border-border dark:border-white/5 pb-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tight font-display">Active Suites</h2>
              <p className="text-sm text-neural-400 font-medium italic">Validated vector collections currently in buffer</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-foreground font-display">{suites.length}</span>
              <div className="text-[10px] font-black text-neural-400 uppercase tracking-widest mt-1">Loaded Vectors</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {suites.map(suite => (
              <div 
                key={suite.suite_id} 
                className="card-premium flex flex-col justify-between group h-full transition-all hover:bg-neural-50/50 dark:hover:bg-neural-900/40"
              >
                <div className="space-y-10">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                       <h3 className="text-2xl font-black text-foreground group-hover:text-neon-500 transition-colors tracking-tight font-display leading-tight">{suite.name}</h3>
                       <div className="px-2 py-0.5 bg-neural-50 dark:bg-neural-950 rounded border border-border dark:border-white/5 text-[9px] font-black text-neural-500 uppercase tracking-widest group-hover:border-neon-500/20 group-hover:text-neon-500 transition-all inline-block">ID-{suite.suite_id.slice(-6).toUpperCase()}</div>
                    </div>
                  </div>
                  <div className="bg-neural-50 dark:bg-neural-950/80 rounded-2xl border-2 border-border dark:border-white/5 group-hover:border-neon-500/10 transition-all">
                    <div className="px-5 py-3 border-b border-border dark:border-white/5 flex justify-between items-center">
                       <span className="text-[10px] font-black text-neural-400 uppercase tracking-widest">Buffer Content</span>
                       <span className="text-[10px] font-black text-neon-500 uppercase tracking-[0.2em]">{suite.inputs.length} Vectors</span>
                    </div>
                    <div className="p-6 h-48 overflow-y-auto custom-scrollbar space-y-4">
                      {suite.inputs.map((inp: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white/50 dark:bg-black/20 rounded-xl border border-border dark:border-white/5 group-hover:border-neon-500/10 transition-all">
                          {typeof inp === 'object' ? (
                            <div className="space-y-1">
                              {Object.entries(inp).map(([k, v]) => (
                                <div key={k} className="flex text-[11px] font-mono leading-tight">
                                  <span className="text-neon-500 font-bold w-16 shrink-0">{k}:</span>
                                  <span className="text-neural-500 dark:text-neural-400 truncate">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] font-mono font-medium text-neural-500 dark:text-neural-400 opacity-80">{String(inp)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-8 mt-10 border-t border-border dark:border-white/5 flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-neural-500 uppercase tracking-widest opacity-60">Verified {new Date().toLocaleDateString()}</span>
                  <button className="p-2 rounded-lg text-neural-400 hover:text-red-500 hover:bg-red-500/10 transition-all group/del">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
