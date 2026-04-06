"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Prompt, PromptVersion } from '@/lib/data';
import { AI_MODELS, DEFAULT_MODEL } from '@/lib/constants';

export default function PromptDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [currentText, setCurrentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [testSuites, setTestSuites] = useState<any[]>([]);
  const [selectedSuite, setSelectedSuite] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        const [pRes, sRes] = await Promise.all([
          fetch(`/api/prompts/${id}`),
          fetch(`/api/test-suites`)
        ]);
        
        if (!pRes.ok) throw new Error('Not found');
        const pData = await pRes.json();
        const sData = await sRes.json();
        
        setPrompt(pData);
        setTestSuites(sData);
        if (sData.length > 0) setSelectedSuite(sData[0].suite_id);

        const currentV = pData.versions.find((v: PromptVersion) => v.version_id === pData.current_version);
        setCurrentText(currentV?.prompt_text || '');
      } catch (err) {
        console.error(err);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  const handleCreateVersion = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'new_version', prompt_text: currentText }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPrompt(updated);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRunTests = async () => {
    if (!selectedSuite) return alert('Select a test suite first');
    setRunning(true);
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt_id: id, 
          version_id: prompt?.current_version, 
          suite_id: selectedSuite,
          model: selectedModel
        }),
      });
      if (res.ok) {
        const log = await res.json();
        router.push(`/results/${log.execution_id}`);
      }
    } catch (err) {
      console.error(err);
      alert('Execution failed');
    } finally {
      setRunning(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rollback', version_id: versionId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPrompt(updated);
        const currentV = updated.versions.find((v: PromptVersion) => v.version_id === updated.current_version);
        setCurrentText(currentV?.prompt_text || '');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blueprint? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
      if (res.ok) router.push('/');
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  if (!mounted) return null;

  if (loading || !prompt) return (
    <div className="flex flex-col h-full space-y-12 stagger-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6 flex-1">
          <div className="h-4 w-32 skeleton rounded-full" />
          <div className="flex items-center space-x-6">
            <div className="h-16 w-80 skeleton rounded-2xl" />
            <div className="h-8 w-24 skeleton rounded-full" />
          </div>
          <div className="h-4 w-full max-w-2xl skeleton rounded-full" />
        </div>
        <div className="flex space-x-4">
          <div className="h-14 w-32 skeleton rounded-2xl" />
          <div className="h-14 w-40 skeleton rounded-2xl" />
        </div>
      </header>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 h-[650px] skeleton rounded-[2rem]" />
        <div className="lg:col-span-4 space-y-10">
          <div className="h-64 skeleton rounded-[2rem]" />
          <div className="flex-1 h-[400px] skeleton rounded-[2rem]" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-border dark:border-white/5 mb-16">
        <div className="space-y-6">
          <nav className="flex items-center space-x-3 text-[10px] font-black text-neural-400 dark:text-neural-500 uppercase tracking-[0.3em]">
            <Link href="/" className="hover:text-electric-500 transition-colors">Registry</Link>
            <span>/</span>
            <span className="text-foreground">{prompt.title}</span>
          </nav>
          <div className="flex items-center space-x-6">
            <h1 className="text-5xl lg:text-7xl font-black text-foreground tracking-tighter font-display leading-none">
              {prompt.title}
            </h1>
            <div className="px-4 py-2 bg-neural-950 dark:bg-white rounded-xl text-white dark:text-neural-950 text-xs font-black shadow-2xl">
              NX-{(prompt.prompt_id || '').slice(-6).toUpperCase()}
            </div>
          </div>
          <p className="text-xl text-neural-400 font-medium max-w-3xl leading-relaxed italic opacity-80">
            {prompt.description}
          </p>
        </div>
        
        <div className="flex items-center space-x-5">
          <button 
            onClick={handleDelete}
            className="px-6 py-4 rounded-2xl font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            Terminal Shutdown
          </button>
          <button 
            onClick={handleCreateVersion}
            disabled={saving}
            className="btn-premium"
          >
            <span>{saving ? 'Syncing...' : 'Commit Version'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* EDITOR AREA */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[650px]">
          <div className="flex-1 flex flex-col card-premium !p-0 overflow-hidden relative border-2 border-border dark:border-white/5 hover:border-electric-500/20 group">
            <div className="bg-neural-50 dark:bg-neural-950 px-8 py-5 border-b border-border dark:border-white/5 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500/20 border border-red-500/40" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500/20 border border-green-500/40" />
                </div>
                <div className="w-px h-6 bg-border dark:bg-white/10" />
                <span className="text-[10px] font-black text-neural-400 uppercase tracking-[0.2em]">Neural Buffer v2.4</span>
              </div>
              <div className="flex items-center space-x-3">
                 <div className="w-2 h-2 rounded-full bg-electric-500 animate-pulse" />
                 <span className="text-[10px] font-black text-electric-500 uppercase tracking-widest">Active Link</span>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-neural-50/50 dark:bg-neural-950/20 border-r border-border dark:border-white/5 flex flex-col items-center py-10 space-y-4 opacity-40">
                 {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => <span key={n} className="text-[10px] font-mono font-bold leading-relaxed">{n}</span>)}
              </div>
              <textarea 
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                className="w-full h-full pl-24 pr-12 py-10 font-mono text-lg lg:text-xl leading-relaxed bg-transparent focus:outline-none text-foreground resize-none selection:bg-electric-500/20 placeholder:text-neural-400/30"
                placeholder="Initialize neural logic sequence..."
              />
            </div>
          </div>
        </div>

        {/* SIDEBAR AREA */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          <section className="card-premium !bg-electric-500/5 border-electric-500/10">
            <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] mb-8 flex items-center justify-between">
              Orchestration Control
              <svg className="w-5 h-5 text-electric-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </h3>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-500 uppercase tracking-[0.3em] pl-1">Target Model</label>
                <select 
                  value={selectedModel} 
                  onChange={e => setSelectedModel(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-white dark:bg-neural-950 border border-border dark:border-white/5 text-sm font-bold focus:ring-4 focus:ring-electric-500/10 outline-none transition-all cursor-pointer hover:border-electric-500/30"
                >
                  {AI_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-500 uppercase tracking-[0.3em] pl-1">Logic Source</label>
                <select 
                  value={selectedSuite} 
                  onChange={e => setSelectedSuite(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-white dark:bg-neural-950 border border-border dark:border-white/5 text-sm font-bold focus:ring-4 focus:ring-electric-500/10 outline-none transition-all hover:border-electric-500/30 cursor-pointer"
                >
                  <option value="">Select Suite</option>
                  {testSuites.map(s => (
                    <option key={s.suite_id} value={s.suite_id}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <button 
                onClick={handleRunTests}
                disabled={running}
                className="w-full btn-premium !py-5 mt-4"
              >
                {running ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing Logic...</span>
                  </div>
                ) : (
                  <>
                    <span>Begin Audit</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.131a1 1 0 000-1.664z" /></svg>
                  </>
                )}
              </button>
            </div>
          </section>

          <section className="flex-1 card-premium">
            <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em] mb-8 font-display">Artifact History</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {[...prompt.versions].reverse().map((version) => (
                <div 
                  key={version.version_id}
                  onClick={() => version.version_id === prompt.current_version ? null : handleRollback(version.version_id)}
                  className={`
                    p-6 rounded-2xl border-2 transition-all cursor-pointer group
                    ${version.version_id === prompt.current_version 
                      ? 'bg-electric-500/5 border-electric-500/20 cursor-default' 
                      : 'bg-neural-50 dark:bg-neural-950 border-transparent hover:border-neural-200 dark:hover:border-white/10'}
                  `}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${version.version_id === prompt.current_version ? 'text-electric-500' : 'text-neural-500'}`}>
                      Ref: NX-{version.version_id.slice(-6).toUpperCase()}
                    </span>
                    {version.version_id === prompt.current_version && (
                      <span className="flex h-2 w-2 rounded-full bg-electric-500 shadow-glow" />
                    )}
                  </div>
                  <div className="text-xs font-mono line-clamp-2 text-neural-400 group-hover:text-foreground transition-colors leading-relaxed">
                    {version.prompt_text}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
