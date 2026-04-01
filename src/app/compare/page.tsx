"use client";

import { useState, useEffect } from 'react';
import { Prompt } from '@/lib/data';

export default function Compare() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [testSuites, setTestSuites] = useState<any[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState('');
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
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
    try {
      const [res1, res2] = await Promise.all([
        fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt_id: selectedPromptId, version_id: v1, suite_id: selectedSuiteId }),
        }),
        fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt_id: selectedPromptId, version_id: v2, suite_id: selectedSuiteId }),
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
    <div className="flex-1 flex flex-col items-center justify-center p-12">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <div className="text-slate-500 font-medium animate-pulse">Initializing Comparison...</div>
    </div>
  );

  return (
    <div className="space-y-16 lg:space-y-24 opacity-0 animate-[fadeIn_0.7s_ease-out_forwards]">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-10 border-b border-slate-200 dark:border-slate-800 mb-12">
        <div className="space-y-4">
          <div className="badge">Analytics</div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            A/B <span className="text-gradient">Testing</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            Compare two prompt versions side-by-side across a shared test suite for performance analysis.
          </p>
        </div>
      </header>

      <section className="card-clean bg-slate-50/50 dark:bg-slate-900/20 border-2 border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Target Prompt</label>
            <select 
              value={selectedPromptId} 
              onChange={e => setSelectedPromptId(e.target.value)}
              className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            >
              {prompts.map(p => <option key={p.prompt_id} value={p.prompt_id}>{p.title}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-blue-600 uppercase tracking-widest pl-1">Alpha Version</label>
            <select 
              value={v1} 
              onChange={e => setV1(e.target.value)}
              className="w-full p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm font-bold text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            >
              <option value="">Select Version A</option>
              {selectedPrompt?.versions.map(v => <option key={v.version_id} value={v.version_id}>{v.version_id}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-purple-600 uppercase tracking-widest pl-1">Beta Version</label>
            <select 
              value={v2} 
              onChange={e => setV2(e.target.value)}
              className="w-full p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-sm font-bold text-purple-700 dark:text-purple-400 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            >
              <option value="">Select Version B</option>
              {selectedPrompt?.versions.map(v => <option key={v.version_id} value={v.version_id}>{v.version_id}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Test Suite</label>
            <select 
              value={selectedSuiteId} 
              onChange={e => setSelectedSuiteId(e.target.value)}
              className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            >
              {testSuites.map(s => <option key={s.suite_id} value={s.suite_id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <button 
          onClick={handleCompare}
          disabled={comparing}
          className="btn-primary w-full mt-8 !py-4 lg:text-lg"
        >
          {comparing ? 'Processing...' : 'Execute Comparison'}
        </button>

        {error && (
          <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center space-x-4 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-900 dark:text-red-400 uppercase tracking-wider">Execution Error</h4>
              <p className="text-sm text-red-600/80 font-medium">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}
      </section>

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hidden lg:flex items-center justify-center z-10 text-[10px] font-extrabold text-slate-400 shadow-xl">
             VS
          </div>
          
          <div className="space-y-10 stagger-in">
            <div className="flex items-center space-x-4 px-8 py-4 bg-blue-600 text-white rounded-2xl shadow-xl">
               <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-xs font-bold">A</div>
               <span className="text-lg font-bold tracking-tight">Version {v1}</span>
            </div>
            {results.data1.results.map((r: any, i: number) => (
              <div 
                key={i} 
                className="card-clean bg-blue-50/30 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30"
              >
                <div className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mb-4">Output {i + 1}</div>
                <div className="text-base leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                  {r.output}
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-10 stagger-in">
            <div className="flex items-center space-x-4 px-8 py-4 bg-purple-600 text-white rounded-2xl shadow-xl">
               <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center text-xs font-bold">B</div>
               <span className="text-lg font-bold tracking-tight">Version {v2}</span>
            </div>
            {results.data2.results.map((r: any, i: number) => (
              <div 
                key={i} 
                className="card-clean bg-purple-50/30 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30"
              >
                <div className="text-[9px] font-bold text-purple-500 uppercase tracking-widest mb-4">Output {i + 1}</div>
                <div className="text-base leading-relaxed text-slate-800 dark:text-slate-200 font-medium">
                  {r.output}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
