"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Integration {
  id: string;
  name: string;
  description: string;
  type: 'ai_model' | 'webhook' | 'database' | 'api' | 'storage';
  status: 'connected' | 'disconnected' | 'error';
  config: any;
  created_at: string;
  last_used?: string;
  usage_count: number;
}

export default function Integrations() {
  const { data: session } = useSession();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      // Mock data for now
      const mockIntegrations: Integration[] = [
        {
          id: 'int_001',
          name: 'OpenAI GPT-4',
          description: 'Primary AI model for prompt execution',
          type: 'ai_model',
          status: 'connected',
          config: { model: 'gpt-4', max_tokens: 2048 },
          created_at: new Date().toISOString(),
          last_used: new Date().toISOString(),
          usage_count: 1247
        },
        {
          id: 'int_002',
          name: 'Slack Notifications',
          description: 'Send alerts and reports to Slack channels',
          type: 'webhook',
          status: 'connected',
          config: { webhook_url: 'https://hooks.slack.com/...' },
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          usage_count: 89
        },
        {
          id: 'int_003',
          name: 'PostgreSQL Database',
          description: 'Store execution results and analytics',
          type: 'database',
          status: 'error',
          config: { host: 'localhost', database: 'promptforge' },
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          usage_count: 0
        }
      ];
      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'disconnected': return 'text-neural-500 bg-neural-500/10 border-neural-500/20';
      case 'error': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-neural-400 bg-neural-400/10 border-neural-400/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai_model': return '🤖';
      case 'webhook': return '🔗';
      case 'database': return '🗄️';
      case 'api': return '⚡';
      case 'storage': return '💾';
      default: return '🔌';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ai_model': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'webhook': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'database': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'api': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'storage': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-neural-400 bg-neural-400/10 border-neural-400/20';
    }
  };

  const toggleIntegrationStatus = (id: string) => {
    setIntegrations(integrations.map(int =>
      int.id === id
        ? { ...int, status: int.status === 'connected' ? 'disconnected' : 'connected' as const }
        : int
    ));
  };

  const availableIntegrations = [
    { type: 'ai_model', name: 'AI Models', description: 'OpenAI, Anthropic, Hugging Face', icon: '🤖' },
    { type: 'webhook', name: 'Webhooks', description: 'Slack, Discord, Teams, Custom', icon: '🔗' },
    { type: 'database', name: 'Databases', description: 'PostgreSQL, MongoDB, MySQL', icon: '🗄️' },
    { type: 'api', name: 'REST APIs', description: 'Custom API endpoints', icon: '⚡' },
    { type: 'storage', name: 'Cloud Storage', description: 'AWS S3, Google Cloud, Azure', icon: '💾' }
  ];

  if (loading) return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="h-4 w-32 skeleton rounded-full" />
          <div className="h-16 w-80 skeleton rounded-2xl" />
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="h-96 skeleton rounded-2xl" />
        <div className="h-96 skeleton rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-20 lg:space-y-32 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 shadow-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span>Phase 3 • Connectivity</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-[0.9] font-display">
            API <span className="text-blue-500 text-glow">Integrations</span>
          </h1>
          <p className="text-xl lg:text-2xl text-neural-400 leading-relaxed font-medium max-w-2xl">
            Connect Prompt Forge with external services, AI models, databases, and custom APIs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-premium"
        >
          <span>Add Integration</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </header>

      {/* Active Integrations */}
      <div className="space-y-12">
        <div className="flex items-end justify-between border-b border-border dark:border-white/5 pb-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tight font-display">Active Integrations</h2>
            <p className="text-sm text-neural-400 font-medium italic">Connected services and APIs</p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-foreground font-display">{integrations.length}</span>
            <div className="text-[10px] font-black text-neural-400 uppercase tracking-widest mt-1">Total Integrations</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {integrations.map(integration => (
            <div key={integration.id} className="card-premium group hover:border-blue-500/30">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getTypeIcon(integration.type)}</div>
                  <div>
                    <h3 className="text-xl font-black text-foreground group-hover:text-blue-500 transition-colors">
                      {integration.name}
                    </h3>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mt-1 ${getTypeColor(integration.type)}`}>
                      {integration.type.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(integration.status)}`}>
                  {integration.status}
                </div>
              </div>

              <p className="text-neural-400 mb-6 leading-relaxed">{integration.description}</p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neural-500">Usage Count</span>
                  <span className="font-bold text-foreground">{integration.usage_count.toLocaleString()}</span>
                </div>
                {integration.last_used && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neural-500">Last Used</span>
                    <span className="font-bold text-foreground">
                      {new Date(integration.last_used).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neural-500">Created</span>
                  <span className="font-bold text-foreground">
                    {new Date(integration.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleIntegrationStatus(integration.id)}
                  className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all ${integration.status === 'connected'
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                      : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                    }`}
                >
                  {integration.status === 'connected' ? 'Disconnect' : 'Connect'}
                </button>

                <button className="p-2 text-neural-400 hover:text-blue-500 transition-colors hover:bg-blue-500/10 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                <button className="p-2 text-neural-400 hover:text-blue-500 transition-colors hover:bg-blue-500/10 rounded-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-neural-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out_forwards]" onClick={() => setShowAddModal(false)}>
          <div className="card-premium w-full max-w-4xl shadow-2xl animate-[zoomIn_0.3s_ease-out_forwards]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tight font-display">Add Integration</h2>
                <p className="text-[10px] font-bold text-neural-400 uppercase tracking-[0.3em]">Connect External Service</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-neural-400 hover:text-foreground transition-colors hover:bg-neural-100 dark:hover:bg-white/5 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableIntegrations.map(integration => (
                <button
                  key={integration.type}
                  onClick={() => setSelectedType(integration.type)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left hover:border-blue-500/50 ${selectedType === integration.type
                      ? 'border-blue-500 bg-blue-500/5'
                      : 'border-white/10 bg-white/5'
                    }`}
                >
                  <div className="text-3xl mb-4">{integration.icon}</div>
                  <h3 className="text-xl font-black text-foreground mb-2">{integration.name}</h3>
                  <p className="text-sm text-neural-400">{integration.description}</p>
                </button>
              ))}
            </div>

            {selectedType && (
              <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                <h3 className="text-lg font-black text-blue-500 mb-4">Configure {availableIntegrations.find(i => i.type === selectedType)?.name}</h3>
                <p className="text-neural-400 mb-4">Integration setup will be available in the next update. This feature allows you to connect external services to automate your prompt engineering workflows.</p>
                <button className="btn-premium">
                  <span>Coming Soon</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}