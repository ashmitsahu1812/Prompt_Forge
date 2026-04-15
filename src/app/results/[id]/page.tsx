"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResultsDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [scoringMethod, setScoringMethod] = useState<'ai' | 'manual' | 'keyword' | 'length' | string>('ai');
  const [keywords, setKeywords] = useState<string>('');
  const [lengthThreshold, setLengthThreshold] = useState({ min: 50, max: 500 });
  const [showScoringModal, setShowScoringModal] = useState<number | null>(null);
  const [availablePlugins, setAvailablePlugins] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetch(`/api/results/${id}`).then(res => res.json()).then(data => {
      setLog(data);
      setLoading(false);
    });

    // Fetch available scoring plugins
    fetch('/api/plugins').then(res => res.json()).then(data => {
      const scoringPlugins = (data.data || []).filter((p: any) => p.type === 'scorer' && p.enabled);
      setAvailablePlugins(scoringPlugins);
    });
  }, [id]);

  const handleRate = async (index: number, rating: number) => {
    const res = await fetch(`/api/results/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result_index: index, rating }),
    });
    if (res.ok) {
      const updated = await res.json();
      setLog(updated);
    }
  };

  const handleAiGrade = async (index: number, customMethod?: string, customData?: any) => {
    const method = customMethod || scoringMethod;
    let requestBody: any = {
      output: log.results[index].output,
      scoringMethod: method
    };

    // Add method-specific data
    switch (method) {
      case 'keyword':
        requestBody.keywords = keywords.split(',').map(k => k.trim()).filter(k => k);
        break;
      case 'length':
        requestBody.lengthThreshold = lengthThreshold;
        break;
      case 'manual':
        requestBody.manualScore = customData?.manualScore;
        break;
    }

    const res = await fetch('/api/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (res.ok) {
      const grade = await res.json();
      // Save the grade to the log
      const saveRes = await fetch(`/api/results/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result_index: index, ai_grade: grade }),
      });
      if (saveRes.ok) {
        const updated = await saveRes.json();
        setLog(updated);
        setShowScoringModal(null);
      }
    }
  };

  if (!mounted || loading) return (
    <div className="flex flex-col h-full space-y-12 stagger-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="h-4 w-32 skeleton rounded-full" />
          <div className="h-16 w-80 skeleton rounded-2xl" />
          <div className="h-8 w-full max-w-xl skeleton rounded-full" />
        </div>
      </header>
      <div className="h-[600px] skeleton rounded-[2rem]" />
    </div>
  );
  if (!log) return (
    <div className="flex flex-col items-center justify-center p-32 space-y-8 card-premium text-center">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      </div>
      <h2 className="text-3xl font-black text-foreground font-display uppercase tracking-widest">Buffer Empty</h2>
      <p className="text-neural-400 font-medium italic">The requested execution log (LOG-{id.slice(-8).toUpperCase()}) does not exist in the neural registry.</p>
      <Link href="/" className="btn-premium">Return to Registry</Link>
    </div>
  );

  return (
    <div className="space-y-20 lg:space-y-32 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5 mb-16 px-2">
        <div className="space-y-6">
          <nav className="flex items-center space-x-3 text-[10px] font-black text-neural-400 uppercase tracking-[0.3em]">
            <Link href="/" className="hover:text-electric-500 transition-colors">Registry</Link>
            <span>/</span>
            <span className="text-foreground tracking-widest">LOG-{log.execution_id.slice(-8).toUpperCase()}</span>
          </nav>
          <h1 className="text-6xl lg:text-7xl font-black text-foreground tracking-tighter font-display leading-none">
            Execution <span className="text-electric-500 text-glow">Audit</span>
          </h1>
          <div className="flex flex-wrap gap-6 pt-6">
            {[
              { label: 'Core', val: log.model.split('/')[1] || log.model, color: 'text-electric-500', bg: 'bg-electric-500/10' },
              { label: 'Ref', val: `NX-${log.version_id.slice(-6).toUpperCase()}`, color: 'text-neon-500', bg: 'bg-neon-500/10' },
              { label: 'Latency', val: `${log.total_latency}ms`, color: 'text-green-500', bg: 'bg-green-500/10' }
            ].map((stat, i) => (
              <div key={i} className={`px-5 py-2.5 ${stat.bg} border border-border dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-3 shadow-sm`}>
                <span className="text-neural-400">{stat.label}:</span>
                <span className={stat.color}>{stat.val}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => router.push(`/prompts/${log.prompt_id}`)}
          className="btn-premium !bg-neural-950 dark:!bg-white dark:!text-neural-950 shadow-2xl"
        >
          <span>Return to Source</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 0118 0z" /></svg>
        </button>
      </header>

      <div className="card-premium !p-0 overflow-hidden border-2 border-border dark:border-white/5 shadow-2xl relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-neural-50/50 dark:bg-neural-950/80 border-b border-border dark:border-white/5">
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-neural-400">Input Vectors</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-neural-400">Response Architecture</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-neural-400 w-56 text-center">Quality Log</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-neural-400 w-72 text-center">Neural Scorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-white/5">
              {log.results.map((res: any, idx: number) => (
                <tr key={idx} className="group hover:bg-neural-50/30 dark:hover:bg-neural-900/10 transition-colors">
                  <td className="px-10 py-12 align-top max-w-xs">
                    <div className="text-[11px] font-mono font-bold text-neural-500 bg-neural-50 dark:bg-black/40 p-6 rounded-2xl border border-border dark:border-white/5 space-y-3 group-hover:border-electric-500/20 transition-all">
                      {typeof res.input === 'object' ? (
                        Object.entries(res.input).map(([k, v]) => (
                          <div key={k} className="flex space-x-3 leading-tight">
                            <span className="text-electric-500 w-16 shrink-0">{k}:</span>
                            <span className="opacity-80 dark:text-neural-300">{String(v)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="italic opacity-80 dark:text-neural-300">"{res.input}"</div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-12 align-top">
                    <div className="text-lg border-l-4 border-electric-500/20 dark:border-electric-500/10 group-hover:border-electric-500/40 pl-8 py-2 leading-relaxed text-foreground font-medium transition-all">
                      {res.output}
                    </div>
                  </td>
                  <td className="px-10 py-12 align-top text-center border-x border-border dark:border-white/5">
                    <div className="flex items-center justify-center space-x-1.5 mb-5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => handleRate(idx, star)}
                          className={`transition-all duration-300 transform hover:scale-125 focus:scale-110 active:scale-95 ${star <= (res.rating || 0)
                            ? 'text-electric-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                            : 'text-neural-200 dark:text-neural-800'
                            }`}
                        >
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    {res.rating && (
                      <div className="inline-flex px-3 py-1 bg-electric-500 text-white text-[9px] font-black rounded uppercase tracking-[0.2em] shadow-glow">
                        Score: {res.rating}.0
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-12 align-top text-center">
                    {res.ai_grade ? (
                      <div className="space-y-4 stagger-in">
                        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-neon-500/10 border border-neon-500/20 text-[10px] font-black text-neon-500 shadow-glow shadow-neon-500/5 uppercase tracking-widest">
                          <span>Grade: {res.ai_grade.score}/10</span>
                          {res.ai_grade.method && (
                            <span className="px-2 py-0.5 bg-neon-500/20 rounded text-[8px]">{res.ai_grade.method}</span>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-neural-400 line-clamp-4 leading-relaxed italic px-2">
                          "{res.ai_grade.justification}"
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowScoringModal(idx)}
                        className="text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 rounded-xl bg-neural-950 dark:bg-white text-white dark:text-neural-950 hover:bg-neon-500 hover:text-white dark:hover:bg-neon-500 dark:hover:text-white transition-all duration-500 flex items-center space-x-3 mx-auto shadow-xl group/audit"
                      >
                        <svg className="w-4 h-4 group-hover/audit:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span>Initiate Scorer</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring Modal */}
      {showScoringModal !== null && (
        <div className="fixed inset-0 bg-neural-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out_forwards]" onClick={() => setShowScoringModal(null)}>
          <div className="card-premium w-full max-w-2xl shadow-2xl animate-[zoomIn_0.3s_ease-out_forwards]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tight font-display">Neural Scorer</h2>
                <p className="text-[10px] font-bold text-neural-400 uppercase tracking-[0.3em]">Output #{showScoringModal + 1} Evaluation</p>
              </div>
              <button onClick={() => setShowScoringModal(null)} className="p-2 text-neural-400 hover:text-foreground transition-colors hover:bg-neural-100 dark:hover:bg-white/5 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Scoring Method</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'ai', label: 'AI Evaluator', desc: 'Neural assessment' },
                    { id: 'manual', label: 'Manual Score', desc: 'Human rating' },
                    { id: 'keyword', label: 'Keyword Match', desc: 'Content analysis' },
                    { id: 'length', label: 'Length Check', desc: 'Size validation' }
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setScoringMethod(method.id as any)}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${scoringMethod === method.id
                        ? 'border-electric-500/40 bg-electric-500/5 text-electric-500'
                        : 'border-border dark:border-white/5 hover:border-electric-500/20'
                        }`}
                    >
                      <div className="text-sm font-black uppercase tracking-tight">{method.label}</div>
                      <div className="text-[10px] text-neural-400 uppercase tracking-widest mt-1">{method.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {scoringMethod === 'keyword' && (
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={e => setKeywords(e.target.value)}
                    className="input-forge !py-4 !px-6"
                    placeholder="e.g. accuracy, detailed, comprehensive"
                  />
                </div>
              )}

              {scoringMethod === 'length' && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Min Length</label>
                    <input
                      type="number"
                      value={lengthThreshold.min}
                      onChange={e => setLengthThreshold({ ...lengthThreshold, min: parseInt(e.target.value) || 0 })}
                      className="input-forge !py-4 !px-6"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Max Length</label>
                    <input
                      type="number"
                      value={lengthThreshold.max}
                      onChange={e => setLengthThreshold({ ...lengthThreshold, max: parseInt(e.target.value) || 1000 })}
                      className="input-forge !py-4 !px-6"
                    />
                  </div>
                </div>
              )}

              {scoringMethod === 'manual' && (
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Manual Score (1-10)</label>
                  <div className="flex items-center justify-center space-x-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                      <button
                        key={score}
                        onClick={() => handleAiGrade(showScoringModal, 'manual', { manualScore: score })}
                        className="w-12 h-12 rounded-xl border-2 border-border dark:border-white/5 hover:border-electric-500/40 hover:bg-electric-500/10 transition-all font-black text-lg"
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {scoringMethod !== 'manual' && (
                <button
                  onClick={() => handleAiGrade(showScoringModal)}
                  className="w-full btn-premium !py-5 shadow-2xl"
                >
                  <span>Execute {scoringMethod.toUpperCase()} Scoring</span>
                  <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
