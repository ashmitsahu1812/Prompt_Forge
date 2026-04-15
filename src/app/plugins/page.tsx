"use client";

import { useState, useEffect } from 'react';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  type: 'scorer' | 'integration' | 'ui' | 'workflow';
  enabled: boolean;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export default function Plugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPlugins();
  }, []);

  const fetchPlugins = async () => {
    try {
      const res = await fetch('/api/plugins');
      const data = await res.json();
      setPlugins(data.data || []);
    } catch (error) {
      console.error('Failed to fetch plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlugin = async (pluginId: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/plugins/${pluginId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      if (res.ok) {
        setPlugins(plugins.map(p => p.id === pluginId ? { ...p, enabled } : p));
      }
    } catch (error) {
      console.error('Failed to toggle plugin:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scorer': return 'text-electric-500 bg-electric-500/10 border-electric-500/20';
      case 'integration': return 'text-neon-500 bg-neon-500/10 border-neon-500/20';
      case 'ui': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'workflow': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      default: return 'text-neural-400 bg-neural-400/10 border-neural-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scorer': return '🎯';
      case 'integration': return '🔗';
      case 'ui': return '🎨';
      case 'workflow': return '⚡';
      default: return '🔧';
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 skeleton rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-20 lg:space-y-32 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 shadow-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Plugin Ecosystem</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-[0.9] font-display">
            Plugin <span className="text-emerald-500 text-glow">Manager</span>
          </h1>
          <p className="text-xl lg:text-2xl text-neural-400 leading-relaxed font-medium max-w-2xl">
            Extend Prompt Forge with custom scoring methods, integrations, and workflow automations.
          </p>
        </div>

        <button className="btn-premium !bg-emerald-500 hover:!bg-emerald-600">
          <span>Install Plugin</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
        </button>
      </header>

      {/* Plugin Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { type: 'scorer', count: plugins.filter(p => p.type === 'scorer').length, label: 'Scoring Plugins' },
          { type: 'integration', count: plugins.filter(p => p.type === 'integration').length, label: 'Integrations' },
          { type: 'ui', count: plugins.filter(p => p.type === 'ui').length, label: 'UI Extensions' },
          { type: 'workflow', count: plugins.filter(p => p.type === 'workflow').length, label: 'Workflows' }
        ].map((category, i) => (
          <div key={i} className="card-premium group hover:border-emerald-500/30">
            <div className="flex items-center justify-between mb-6">
              <div className="text-4xl">{getTypeIcon(category.type)}</div>
              <div className="text-right">
                <div className="text-3xl font-black text-emerald-500 tracking-tighter font-display">{category.count}</div>
                <div className="text-[10px] font-black text-neural-400 uppercase tracking-widest mt-1">Installed</div>
              </div>
            </div>
            <h3 className="text-lg font-black text-foreground uppercase tracking-tight">{category.label}</h3>
          </div>
        ))}
      </div>

      {/* Plugins Grid */}
      <div className="space-y-16">
        {['scorer', 'integration', 'ui', 'workflow'].map(type => {
          const typePlugins = plugins.filter(p => p.type === type);
          if (typePlugins.length === 0) return null;

          return (
            <div key={type} className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{getTypeIcon(type)}</div>
                <h2 className="text-3xl font-black text-foreground tracking-tight font-display capitalize">{type} Plugins</h2>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getTypeColor(type)}`}>
                  {typePlugins.length} installed
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {typePlugins.map(plugin => (
                  <div key={plugin.id} className="card-premium group hover:border-emerald-500/30">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${getTypeColor(plugin.type)}`}>
                        {plugin.type}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => togglePlugin(plugin.id, !plugin.enabled)}
                          className={`w-12 h-6 rounded-full transition-all duration-300 ${plugin.enabled ? 'bg-emerald-500' : 'bg-neural-300 dark:bg-neural-700'
                            }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${plugin.enabled ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-black text-foreground group-hover:text-emerald-500 transition-colors">{plugin.name}</h3>
                        <p className="text-sm text-neural-400 font-medium mt-1">v{plugin.version} by {plugin.author}</p>
                      </div>

                      <p className="text-sm text-neural-400 leading-relaxed line-clamp-3">{plugin.description}</p>

                      <div className="pt-4 border-t border-border dark:border-white/5 flex justify-between items-center">
                        <span className="text-[10px] text-neural-500 uppercase tracking-widest">
                          Updated {new Date(plugin.updated_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedPlugin(plugin);
                            setShowConfigModal(true);
                          }}
                          className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors"
                        >
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && selectedPlugin && (
        <div className="fixed inset-0 bg-neural-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out_forwards]" onClick={() => setShowConfigModal(false)}>
          <div className="card-premium w-full max-w-2xl shadow-2xl animate-[zoomIn_0.3s_ease-out_forwards] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tight font-display">{selectedPlugin.name}</h2>
                <p className="text-[10px] font-bold text-neural-400 uppercase tracking-[0.3em]">Plugin Configuration</p>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="p-2 text-neural-400 hover:text-foreground transition-colors hover:bg-neural-100 dark:hover:bg-white/5 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-8">
              <div className="p-6 bg-neural-50/50 dark:bg-neural-950/50 rounded-2xl border border-border dark:border-white/5">
                <h3 className="text-lg font-black text-foreground mb-4">Plugin Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-neural-400">Version:</span>
                    <span className="ml-2 font-bold text-foreground">{selectedPlugin.version}</span>
                  </div>
                  <div>
                    <span className="text-neural-400">Author:</span>
                    <span className="ml-2 font-bold text-foreground">{selectedPlugin.author}</span>
                  </div>
                  <div>
                    <span className="text-neural-400">Type:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-[10px] font-black uppercase ${getTypeColor(selectedPlugin.type)}`}>
                      {selectedPlugin.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-neural-400">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-[10px] font-black uppercase ${selectedPlugin.enabled ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'
                      }`}>
                      {selectedPlugin.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-neural-50/50 dark:bg-neural-950/50 rounded-2xl border border-border dark:border-white/5">
                <h3 className="text-lg font-black text-foreground mb-4">Configuration</h3>
                <pre className="text-sm text-neural-400 font-mono bg-neural-100 dark:bg-neural-900 p-4 rounded-xl overflow-x-auto">
                  {JSON.stringify(selectedPlugin.config, null, 2)}
                </pre>
              </div>

              <div className="flex space-x-4">
                <button className="flex-1 btn-premium !bg-emerald-500 hover:!bg-emerald-600">
                  <span>Save Configuration</span>
                </button>
                <button
                  onClick={() => togglePlugin(selectedPlugin.id, !selectedPlugin.enabled)}
                  className={`flex-1 px-6 py-4 rounded-2xl font-bold transition-all duration-300 ${selectedPlugin.enabled
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white'
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                    }`}
                >
                  {selectedPlugin.enabled ? 'Disable Plugin' : 'Enable Plugin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}