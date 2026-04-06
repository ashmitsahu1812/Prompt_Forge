"use client";

import { useState, useEffect } from 'react';
import { Prompt } from '@/lib/data';
import { AI_MODELS, DEFAULT_MODEL } from '@/lib/constants';

export default function Compare() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [testSuites, setTestSuites] = useState<any[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [alphaModel, setAlphaModel] = useState(DEFAULT_MODEL);
  const [betaModel, setBetaModel] = useState(DEFAULT_MODEL);
  const [selectedSuiteId, setSelectedSuiteId] = useState('');
  const [results, setResults] = useState<any>(null);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch('/api/prompts').then(res => res.json()),
      fetch('/api/test-suites').then(res => res.json())
    ]).then(([pData, sData]) => {
      setPrompts(pData);
      setTestSuites(sData);
      if (pData.length > 0) setSelectedPromptId(pData[0].prompt_id);
      if (sData.length > 0) setSelectedSuiteId(sData[0].suite_id);
    });
  }, []);

  const selectedPrompt = prompts.find(p => p.prompt_id === selectedPromptId);

  const handleTilt = (e: React.MouseEvent<HTMLDivElement>, card: HTMLDivElement) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height;
    const y = (e.clientX - rect.left) / rect.width;
    const rx = (x - 0.5) * -15;
    const ry = (y - 0.5) * 15;
    card.style.setProperty('--rx', `${rx}deg`);
    card.style.setProperty('--ry', `${ry}deg`);
  };

  const handleCompare = async () => {
    if (!v1 || !v2 || !selectedSuiteId) return alert('Selection required');
    setComparing(true);
    setError(null);
    try {
      const [res1, res2] = await Promise.all([
        fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt_id: selectedPromptId, 
            version_id: v1, 
            suite_id: selectedSuiteId,
            model: alphaModel 
          }),
        }),
        fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt_id: selectedPromptId, 
            version_id: v2, 
            suite_id: selectedSuiteId,
            model: betaModel 
          }),
        })
      ]);
      const data1 = await res1.json();
      const data2 = await res2.json();

      if (!res1.ok || !res2.ok) {
        throw new Error(data1.error || data2.error || 'Comparison failed');
      }

      setResults({ data1, data2 });
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setComparing(false);
    }
  };

  if (!mounted) return (
    <div className="flex flex-col h-full space-y-12 stagger-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="h-4 w-32 skeleton rounded-full" />
          <div className="h-16 w-80 skeleton rounded-2xl" />
          <div className="h-4 w-full max-w-xl skeleton rounded-full" />
        </div>
      </header>
      <div className="h-[400px] skeleton rounded-[2rem]" />
    </div>
  );

  return (
    <div className="space-y-20 lg:space-y-32 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5 mb-16">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-electric-500/10 border border-electric-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-electric-500 shadow-glow">
             <span>Phase 03: Dual Audit</span>
          </div>
          <h1 className="text-6xl lg:text-7xl font-black text-foreground tracking-tighter font-display leading-none">
            Neural <span className="text-electric-500 text-glow">Dual</span>
          </h1>
          <p className="text-xl text-neural-400 font-medium max-w-2xl leading-relaxed italic opacity-80">
            Compare architectural variations side-by-side using shared test vectors. Optimize for accuracy, latency, and logical flow.
          </p>
        </div>
      </header>

      <section className="card-premium !bg-neural-50/50 dark:!bg-neural-950/20 border-2 border-border dark:border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12 pb-12 border-b border-border dark:border-white/5">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Primary Blueprint</label>
            <select 
              value={selectedPromptId} 
              onChange={e => setSelectedPromptId(e.target.value)}
              className="input-forge !py-3.5 !px-5 !text-sm font-bold"
            >
              {prompts.map(p => <option key={p.prompt_id} value={p.prompt_id}>{p.title}</option>)}
            </select>
          </div>
          <div className="space-y-3 lg:col-span-2">
            <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Test Vector Suite</label>
            <select 
              value={selectedSuiteId} 
              onChange={e => setSelectedSuiteId(e.target.value)}
              className="input-forge !py-3.5 !px-5 !text-sm font-bold"
            >
              {testSuites.map(s => <option key={s.suite_id} value={s.suite_id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="p-8 rounded-[1.5rem] bg-electric-500/5 border border-electric-500/20 space-y-8 group hover:bg-electric-500/10 transition-colors">
            <div className="flex items-center justify-between">
               <div className="text-[10px] font-black text-electric-500 uppercase tracking-[0.2em]">Source Alpha</div>
               <div className="w-8 h-8 rounded-lg bg-electric-500 flex items-center justify-center text-white text-[10px] font-black">A</div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-widest pl-1">Ref ID</label>
                <select 
                  value={v1} 
                  onChange={e => setV1(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-neural-950 border border-border dark:border-white/5 text-[11px] font-black focus:ring-4 focus:ring-electric-500/10 outline-none"
                >
                  <option value="">Select NX</option>
                  {selectedPrompt?.versions.map((v: any) => <option key={v.version_id} value={v.version_id}>NX-{v.version_id.slice(-6).toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-widest pl-1">Neural Core</label>
                <select 
                  value={alphaModel} 
                  onChange={e => setAlphaModel(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-neural-950 border border-border dark:border-white/5 text-[11px] font-black focus:ring-4 focus:ring-electric-500/10 outline-none cursor-pointer"
                >
                  {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name.split(' ')[0]}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[1.5rem] bg-neon-500/5 border border-neon-500/20 space-y-8 group hover:bg-neon-500/10 transition-colors">
             <div className="flex items-center justify-between">
               <div className="text-[10px] font-black text-neon-500 uppercase tracking-[0.2em]">Source Beta</div>
               <div className="w-8 h-8 rounded-lg bg-neon-500 flex items-center justify-center text-white text-[10px] font-black">B</div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-widest pl-1">Ref ID</label>
                <select 
                  value={v2} 
                  onChange={e => setV2(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-neural-950 border border-border dark:border-white/5 text-[11px] font-black focus:ring-4 focus:ring-neon-500/10 outline-none"
                >
                  <option value="">Select NX</option>
                  {selectedPrompt?.versions.map((v: any) => <option key={v.version_id} value={v.version_id}>NX-{v.version_id.slice(-6).toUpperCase()}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-widest pl-1">Neural Core</label>
                <select 
                  value={betaModel} 
                  onChange={e => setBetaModel(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-neural-950 border border-border dark:border-white/5 text-[11px] font-black focus:ring-4 focus:ring-neon-500/10 outline-none cursor-pointer"
                >
                  {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.name.split(' ')[0]}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleCompare}
          disabled={comparing}
          className="btn-premium w-full mt-10 !py-5 shadow-2xl"
        >
          {comparing ? (
             <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Synchronizing Buffers...</span>
             </div>
          ) : (
            <>
              <span>Execute Parallel Audit</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </>
          )}
        </button>

        {error && (
          <div className="mt-10 p-8 glass-panel border border-red-500/20 rounded-3xl flex items-start space-x-6 animate-[fadeIn_0.5s_ease-out_forwards]">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-glow shadow-red-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-sm font-black text-red-500 uppercase tracking-[0.2em]">Audit Exception</h4>
              <p className="text-base text-neural-400 font-medium leading-relaxed">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-2 text-neural-400 hover:text-foreground transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
      </section>

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-12 relative overflow-visible">
          {/* VS Divider */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-border dark:bg-white/5 hidden lg:block" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full glass-panel border-2 border-border dark:border-white/5 hidden lg:flex items-center justify-center z-10 text-xs font-black text-neural-400 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
             VS
          </div>
          
          <div className="space-y-12">
            <div className="flex flex-col space-y-4">
               <div className="flex items-center space-x-4 px-6 py-3 bg-electric-500 text-white rounded-2xl shadow-xl w-fit">
                  <div className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/20 rounded">Alpha</div>
                  <span className="font-black font-display text-lg tracking-tight">Version {v1.slice(-6).toUpperCase()}</span>
               </div>
               <div className="px-4 text-[10px] font-black text-neural-400 uppercase tracking-[0.3em]">{alphaModel.split('/')[1] || alphaModel}</div>
            </div>

            <div className="space-y-8">
              {results.data1.results.map((r: any, i: number) => (
                <div 
                  key={i} 
                  className="card-premium !bg-electric-500/5 border-electric-500/10 group hover:border-electric-500/30 transition-all stagger-in"
                >
                  <div className="flex justify-between items-center mb-6">
                    <span className="px-2 py-0.5 bg-electric-500 text-white text-[9px] font-black rounded uppercase tracking-widest">Case {i + 1}</span>
                    {r.input && (
                      <div className="flex items-center space-x-2 text-[9px] font-black text-neural-400 uppercase tracking-widest max-w-[200px]">
                        <span className="opacity-50">Vector:</span>
                        <span className="truncate italic">{typeof r.input === 'object' ? JSON.stringify(r.input) : r.input}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-lg leading-relaxed text-foreground font-medium opacity-90">
                    {r.output}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-12">
            <div className="flex flex-col space-y-4 lg:items-end">
               <div className="flex items-center space-x-4 px-6 py-3 bg-neon-500 text-white rounded-2xl shadow-xl w-fit">
                  <span className="font-black font-display text-lg tracking-tight text-right">Version {v2.slice(-6).toUpperCase()}</span>
                  <div className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/20 rounded">Beta</div>
               </div>
               <div className="px-4 text-[10px] font-black text-neural-400 uppercase tracking-[0.3em]">{betaModel.split('/')[1] || betaModel}</div>
            </div>

            <div className="space-y-8">
              {results.data2.results.map((r: any, i: number) => (
                <div 
                  key={i} 
                  className="card-premium !bg-neon-500/5 border-neon-500/10 group hover:border-neon-500/30 transition-all stagger-in"
                >
                  <div className="flex justify-between items-center mb-6">
                    {r.input && (
                      <div className="flex items-center space-x-2 text-[9px] font-black text-neural-400 uppercase tracking-widest max-w-[200px]">
                        <span className="opacity-50">Vector:</span>
                        <span className="truncate italic">{typeof r.input === 'object' ? JSON.stringify(r.input) : r.input}</span>
                      </div>
                    )}
                    <span className="px-2 py-0.5 bg-neon-500 text-white text-[9px] font-black rounded uppercase tracking-widest">Case {i + 1}</span>
                  </div>
                  <div className="text-lg leading-relaxed text-foreground font-medium opacity-90">
                    {r.output}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
