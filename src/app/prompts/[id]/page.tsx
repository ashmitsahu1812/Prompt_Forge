"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Prompt, PromptVersion } from '@/lib/data';

export default function PromptDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [currentText, setCurrentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [testSuites, setTestSuites] = useState<any[]>([]);
  const [selectedSuite, setSelectedSuite] = useState('');
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
          suite_id: selectedSuite 
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
    <div className="flex flex-col h-full space-y-12 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-slate-200 dark:border-slate-800 mb-12">
        <div className="space-y-4 flex-1">
          <div className="h-4 w-32 skeleton" />
          <div className="flex items-center space-x-4">
            <div className="h-12 w-64 skeleton" />
            <div className="h-6 w-20 skeleton rounded-full" />
          </div>
          <div className="h-4 w-full max-w-2xl skeleton" />
        </div>
        <div className="h-12 w-32 skeleton rounded-xl" />
      </header>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 h-[600px] skeleton rounded-2xl" />
        <div className="lg:col-span-4 space-y-8">
          <div className="h-48 skeleton rounded-2xl" />
          <div className="flex-1 h-[300px] skeleton rounded-2xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full opacity-0 animate-[fadeIn_0.7s_ease-out_forwards]">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-slate-200 dark:border-slate-800 mb-12">
        <div className="space-y-4">
          <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <Link href="/" className="hover:text-blue-600 transition-colors">Registry</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">{prompt.title}</span>
          </nav>
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {prompt.title}
            </h1>
            <span className="badge">ID-{prompt.prompt_id.slice(-6).toUpperCase()}</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
            {prompt.description}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleDelete}
            className="btn-secondary !bg-red-50 dark:!bg-red-900/10 !text-red-600 dark:!text-red-400 hover:!bg-red-100 dark:hover:!bg-red-900/20 border-red-100 dark:border-red-900/30"
          >
            <span>Delete</span>
          </button>
          <button 
            onClick={handleCreateVersion}
            disabled={saving}
            className="btn-primary"
          >
            <span>{saving ? 'Saving...' : 'Save Version'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* EDITOR AREA */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
          <div className="flex-1 flex flex-col card-clean p-0 overflow-hidden relative border-2 border-slate-100 dark:border-slate-800 focus-within:border-blue-500/20">
            <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Neural Buffer v1.0</span>
              </div>
              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Editing Mode</div>
            </div>
            
            <textarea 
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              className="flex-1 w-full p-8 lg:p-12 font-mono text-base lg:text-lg leading-relaxed bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 resize-none selection:bg-blue-500/10 placeholder:text-slate-300"
              placeholder="Enter your prompt logic here..."
            />
          </div>
        </div>

        {/* SIDEBAR AREA */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <section className="card-clean bg-blue-50/30 dark:bg-blue-900/5 border-blue-100 dark:border-blue-900/20">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center justify-between">
              Execution Control
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Test Suite</label>
                <select 
                  value={selectedSuite} 
                  onChange={e => setSelectedSuite(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
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
                className="w-full btn-primary !py-4 text-sm"
              >
                {running ? 'Executing...' : 'Run Analysis'}
              </button>
            </div>
          </section>

          <section className="flex-1 card-clean flex flex-col h-full min-h-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-8">
              Version History
            </h3>
            <div className="flex-1 overflow-auto space-y-4 pr-2">
              {[...prompt.versions].reverse().map((v) => (
                <div 
                  key={v.version_id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                    v.version_id === prompt.current_version 
                      ? 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-900/10' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                  onClick={() => v.version_id !== prompt.current_version && handleRollback(v.version_id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      v.version_id === prompt.current_version 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {v.version_id}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">{new Date(v.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 font-mono">
                    {v.prompt_text}
                  </p>
                  {v.version_id !== prompt.current_version && (
                    <div className="mt-2 text-[9px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-wider">
                      Click to restore
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
