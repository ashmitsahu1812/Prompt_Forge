"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResultsDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    fetch(`/api/results/${id}`).then(res => res.json()).then(data => {
      setLog(data);
      setLoading(false);
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

  if (!mounted || loading) return (
    <div className="flex-1 flex flex-col items-center justify-center p-12">
      <div className="w-10 h-10 border-2 border-green-600 border-t-transparent rounded-full animate-spin mb-4" />
      <div className="text-slate-500 font-medium animate-pulse">Loading Audit...</div>
    </div>
  );
  if (!log) return <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest">Execution Log Not Found</div>;

  return (
    <div className="space-y-16 lg:space-y-24 opacity-0 animate-[fadeIn_0.7s_ease-out_forwards]">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-10 border-b border-slate-200 dark:border-slate-800 mb-12">
        <div className="space-y-4">
          <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <Link href="/" className="hover:text-blue-600 transition-colors">Registry</Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">LOG-{log.execution_id.slice(-8).toUpperCase()}</span>
          </nav>
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Execution <span className="text-green-600">Audit</span>
          </h1>
          <div className="flex flex-wrap gap-4 pt-4">
            {[ 
              { label: 'Model', val: log.model, color: 'text-blue-600' },
              { label: 'Version', val: log.version_id, color: 'text-purple-600' },
              { label: 'Latency', val: `${log.total_latency}ms`, color: 'text-green-600' }
            ].map((stat, i) => (
              <div key={i} className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2 shadow-sm">
                <span className="text-slate-400">{stat.label}:</span>
                <span className={stat.color}>{stat.val}</span>
              </div>
            ))}
          </div>
        </div>
        <button 
          onClick={() => router.push(`/prompts/${log.prompt_id}`)}
          className="btn-primary !bg-slate-900 dark:!bg-white dark:!text-slate-950"
        >
          Return to Prompt
        </button>
      </header>

      <div className="card-clean !p-0 overflow-hidden border-2 border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Input</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Output</th>
                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-64 text-center">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {log.results.map((res: any, idx: number) => (
                <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                  <td className="px-8 py-10 align-top max-w-xs">
                    <div className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      "{res.input}"
                    </div>
                  </td>
                  <td className="px-8 py-10 align-top">
                    <div className="text-base leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                      {res.output}
                    </div>
                  </td>
                  <td className="px-8 py-10 align-top text-center">
                    <div className="flex items-center justify-center space-x-1 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star}
                          onClick={() => handleRate(idx, star)}
                          className={`transition-all duration-300 transform hover:scale-125 ${
                            star <= (res.rating || 0) 
                              ? 'text-blue-600' 
                              : 'text-slate-200 dark:text-slate-800'
                          }`}
                        >
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    {res.rating && (
                      <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                         Score: {res.rating}.0
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
