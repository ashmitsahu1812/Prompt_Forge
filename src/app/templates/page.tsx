"use client";

import { useState, useEffect } from 'react';
import { Template } from '@/lib/data';

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [newT, setNewT] = useState({ category: 'General', title: '', text: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        const templateList = Array.isArray(data) ? data : (data.templates || []);
        setTemplates(templateList);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleTilt = (e: React.MouseEvent<HTMLDivElement>, card: HTMLDivElement) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientY - rect.top) / rect.height;
    const y = (e.clientX - rect.left) / rect.width;
    const rx = (x - 0.5) * -20;
    const ry = (y - 0.5) * 20;
    card.style.setProperty('--rx', `${rx}deg`);
    card.style.setProperty('--ry', `${ry}deg`);
  };

  const handleCreate = async () => {
    if (!newT.title || !newT.text) return alert('Details required');
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newT),
    });
    if (res.ok) {
      const saved = await res.json();
      setTemplates([...templates, saved]);
      setNewT({ ...newT, title: '', text: '' });
    }
  };

  const categories = Array.from(new Set(templates.map(t => t.category)));

  if (!mounted || loading) return (
    <div className="flex-1 flex flex-col items-center justify-center p-12">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <div className="text-slate-500 font-medium animate-pulse">Loading Templates...</div>
    </div>
  );

  return (
    <div className="space-y-16 lg:space-y-24 opacity-0 animate-[fadeIn_0.7s_ease-out_forwards]">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-10 border-b border-slate-200 dark:border-slate-800 mb-12">
        <div className="space-y-4">
          <div className="badge">Knowledge Base</div>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Blueprint <span className="text-gradient">Library</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            Store and manage reusable prompt fragments for consistent neural orchestration.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 flex flex-col gap-10">
          <div className="card-clean bg-slate-50/50 dark:bg-slate-900/20">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-8 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              <span>Create Template</span>
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Category</label>
                <input 
                  placeholder="e.g. Synthesis" 
                  value={newT.category} 
                  onChange={e => setNewT({...newT, category: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Title</label>
                <input 
                  placeholder="e.g. Logic Core" 
                  value={newT.title} 
                  onChange={e => setNewT({...newT, title: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Logic Content</label>
                <textarea 
                  placeholder="Enter logic fragment..." 
                  rows={6}
                  value={newT.text} 
                  onChange={e => setNewT({...newT, text: e.target.value})}
                  className="w-full p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                />
              </div>
              <button 
                onClick={handleCreate}
                className="w-full btn-primary"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-16">
          {templates.length === 0 ? (
            <div className="py-20 text-center card-clean border-dashed border-2 flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Library Empty</p>
            </div>
          ) : categories.map(cat => (
            <div key={cat} className="space-y-8 stagger-in">
              <h2 className="text-xs font-extrabold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 w-fit rounded-lg border border-blue-100 dark:border-blue-800 uppercase tracking-widest">
                {cat}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {templates.filter(t => t.category === cat).map(t => (
                  <div 
                    key={t.template_id} 
                    className="card-clean group flex flex-col justify-between"
                  >
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase tracking-tight">{t.title}</h3>
                      <div className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed line-clamp-6">
                        {t.text}
                      </div>
                    </div>
                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">Copy Fragment</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
