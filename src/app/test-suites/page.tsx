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
    const inputList = inputs.split('\n').filter(i => i.trim() !== '');
    const res = await fetch('/api/test-suites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, inputs: inputList }),
    });
    if (res.ok) {
      const newSuite = await res.json();
      setSuites([...suites, newSuite]);
      setName('');
      setInputs('');
    }
  };

  if (!mounted || loading) return (
    <div className="flex-1 flex flex-col items-center justify-center p-12">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <div className="text-slate-500 font-medium animate-pulse">Loading Test Suites...</div>
    </div>
  );

  return (
    <div className="space-y-16 lg:space-y-24 opacity-0 animate-[fadeIn_0.7s_ease-out_forwards]">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-10 border-b border-slate-200 dark:border-slate-800 mb-12">
        <div className="space-y-4">
          <div className="badge">Quality Assurance</div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Test <span className="text-gradient">Suites</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            Define and manage collections of test inputs for systematic prompt validation.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <section className="lg:col-span-5 flex flex-col gap-12">
          <div className="card-clean bg-slate-50/50 dark:bg-slate-900/20">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-8 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              <span>New Test Suite</span>
            </h2>
            <form onSubmit={handleSave} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Suite Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Edge Cases 01"
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Test Inputs (Line-Separated)</label>
                <textarea 
                  rows={10}
                  value={inputs} 
                  onChange={e => setInputs(e.target.value)}
                  placeholder="Enter one test case per line..."
                  className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                />
              </div>
              <button className="w-full btn-primary">
                Create Test Suite
              </button>
            </form>
          </div>
        </section>

        <section className="lg:col-span-7 space-y-12">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Active Suites</h2>
            <span className="text-sm font-medium text-slate-500">{suites.length} Suites Loaded</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {suites.map(suite => (
              <div 
                key={suite.suite_id} 
                className="card-clean flex flex-col justify-between group h-full transition-all stagger-in"
              >
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors tracking-tight">{suite.name}</h3>
                    <div className="badge">SYSC</div>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed group-hover:border-blue-500/20 transition-all h-[200px] overflow-hidden">
                    <div className="mb-4 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-[9px]">Inputs: {suite.inputs.length}</div>
                    <div className="line-clamp-6 font-mono opacity-80 group-hover:opacity-100 transition-opacity">
                      {suite.inputs.join('\n')}
                    </div>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString()}</span>
                  <button className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
