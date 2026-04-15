"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  totalPrompts: number;
  totalExecutions: number;
  averageScore: number;
  totalTokens: number;
  averageLatency: number;
  topPerformingPrompts: Array<{
    id: string;
    title: string;
    averageScore: number;
    executionCount: number;
  }>;
  executionTrends: Array<{
    date: string;
    executions: number;
    averageScore: number;
  }>;
  modelPerformance: Array<{
    model: string;
    executions: number;
    averageScore: number;
    averageLatency: number;
  }>;
}

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/analytics?range=${timeRange}`);
      const data = await res.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="h-4 w-32 skeleton rounded-full" />
          <div className="h-16 w-80 skeleton rounded-2xl" />
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="h-96 skeleton rounded-2xl" />
        <div className="h-96 skeleton rounded-2xl" />
      </div>
    </div>
  );

  if (!analytics) return (
    <div className="flex flex-col items-center justify-center p-32 space-y-8 card-premium text-center">
      <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      </div>
      <h2 className="text-3xl font-black text-foreground font-display uppercase tracking-widest">No Analytics Data</h2>
      <p className="text-neural-400 font-medium italic">Execute some prompts to generate analytics insights.</p>
      <Link href="/" className="btn-premium">Start Creating Prompts</Link>
    </div>
  );

  return (
    <div className="space-y-20 lg:space-y-32 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-electric-500/10 border border-electric-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-electric-500 shadow-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-500"></span>
            </span>
            <span>Neural Analytics Engine</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-[0.9] font-display">
            Performance <span className="text-electric-500 text-glow">Insights</span>
          </h1>
          <p className="text-xl lg:text-2xl text-neural-400 leading-relaxed font-medium max-w-2xl">
            Deep analytics and performance metrics for your prompt engineering workflows.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-6 py-4 rounded-2xl font-bold bg-neural-100 dark:bg-neural-900 border border-border dark:border-white/5 hover:border-electric-500/30 transition-all cursor-pointer"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Prompts', value: analytics.totalPrompts, color: 'text-electric-500', bg: 'bg-electric-500/10', icon: '📝' },
          { label: 'Executions', value: analytics.totalExecutions.toLocaleString(), color: 'text-neon-500', bg: 'bg-neon-500/10', icon: '⚡' },
          { label: 'Avg Score', value: `${analytics.averageScore.toFixed(1)}/10`, color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: '🎯' },
          { label: 'Avg Latency', value: `${analytics.averageLatency}ms`, color: 'text-orange-500', bg: 'bg-orange-500/10', icon: '⏱️' }
        ].map((metric, i) => (
          <div key={i} className="card-premium group hover:border-electric-500/30">
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-2xl ${metric.bg} flex items-center justify-center text-2xl`}>
                {metric.icon}
              </div>
              <div className="text-right">
                <div className={`text-3xl font-black ${metric.color} tracking-tighter font-display`}>{metric.value}</div>
                <div className="text-[10px] font-black text-neural-400 uppercase tracking-widest mt-1">{metric.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Top Performing Prompts */}
        <div className="card-premium">
          <h3 className="text-2xl font-black text-foreground mb-8 font-display">Top Performing Prompts</h3>
          <div className="space-y-6">
            {analytics.topPerformingPrompts.map((prompt, i) => (
              <div key={prompt.id} className="flex items-center justify-between p-6 bg-neural-50/50 dark:bg-neural-950/50 rounded-2xl border border-border dark:border-white/5 hover:border-electric-500/20 transition-all group">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-xl bg-electric-500/10 flex items-center justify-center text-electric-500 font-black text-sm">
                    #{i + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground group-hover:text-electric-500 transition-colors">{prompt.title}</h4>
                    <p className="text-[10px] text-neural-400 uppercase tracking-widest">{prompt.executionCount} executions</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-electric-500 font-display">{prompt.averageScore.toFixed(1)}</div>
                  <div className="text-[10px] text-neural-400 uppercase tracking-widest">avg score</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Performance */}
        <div className="card-premium">
          <h3 className="text-2xl font-black text-foreground mb-8 font-display">Model Performance</h3>
          <div className="space-y-6">
            {analytics.modelPerformance.map((model, i) => (
              <div key={model.model} className="p-6 bg-neural-50/50 dark:bg-neural-950/50 rounded-2xl border border-border dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-foreground">{model.model.split('/')[1] || model.model}</h4>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-electric-500 font-bold">{model.averageScore.toFixed(1)}/10</span>
                    <span className="text-sm text-neural-400">{model.averageLatency}ms</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1 bg-neural-200 dark:bg-neural-800 rounded-full h-2">
                    <div
                      className="bg-electric-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(model.averageScore / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-neural-400 uppercase tracking-widest">{model.executions} runs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Execution Trends */}
      <div className="card-premium">
        <h3 className="text-2xl font-black text-foreground mb-8 font-display">Execution Trends</h3>
        <div className="grid grid-cols-7 gap-4 h-64">
          {analytics.executionTrends.map((trend, i) => {
            const maxExecutions = Math.max(...analytics.executionTrends.map(t => t.executions));
            const height = (trend.executions / maxExecutions) * 100;
            return (
              <div key={trend.date} className="flex flex-col items-center space-y-2">
                <div className="flex-1 flex items-end">
                  <div
                    className="w-full bg-electric-500/20 rounded-t-lg transition-all duration-1000 hover:bg-electric-500/40 cursor-pointer group relative"
                    style={{ height: `${height}%`, minHeight: '8px' }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neural-950 text-white px-2 py-1 rounded text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {trend.executions}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-neural-400 font-bold uppercase tracking-widest">
                  {new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}