"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: 'manual' | 'schedule' | 'webhook' | 'prompt_execution';
  actions: WorkflowAction[];
  status: 'active' | 'inactive' | 'draft';
  created_at: string;
  last_run?: string;
  run_count: number;
}

interface WorkflowAction {
  id: string;
  type: 'execute_prompt' | 'send_email' | 'webhook' | 'conditional' | 'delay';
  config: any;
  order: number;
}

export default function Workflows() {
  const { data: session } = useSession();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: 'manual' as const
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      // Mock data for now - in real implementation, this would be an API call
      const mockWorkflows: Workflow[] = [
        {
          id: 'wf_001',
          name: 'Daily Prompt Optimization',
          description: 'Automatically run and optimize prompts daily',
          trigger: 'schedule',
          actions: [
            { id: 'a1', type: 'execute_prompt', config: { prompt_id: 'prompt_001' }, order: 1 },
            { id: 'a2', type: 'send_email', config: { template: 'optimization_report' }, order: 2 }
          ],
          status: 'active',
          created_at: new Date().toISOString(),
          last_run: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          run_count: 15
        },
        {
          id: 'wf_002',
          name: 'Quality Assurance Pipeline',
          description: 'Run quality checks on new prompts',
          trigger: 'prompt_execution',
          actions: [
            { id: 'a3', type: 'conditional', config: { condition: 'score < 0.8' }, order: 1 },
            { id: 'a4', type: 'send_email', config: { template: 'quality_alert' }, order: 2 }
          ],
          status: 'active',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          run_count: 42
        }
      ];
      setWorkflows(mockWorkflows);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflow.name) return;

    const workflow: Workflow = {
      id: `wf_${Date.now()}`,
      ...newWorkflow,
      actions: [],
      status: 'draft',
      created_at: new Date().toISOString(),
      run_count: 0
    };

    setWorkflows([...workflows, workflow]);
    setShowCreateModal(false);
    setNewWorkflow({ name: '', description: '', trigger: 'manual' });
  };

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows(workflows.map(wf =>
      wf.id === id
        ? { ...wf, status: wf.status === 'active' ? 'inactive' : 'active' as const }
        : wf
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'inactive': return 'text-neural-500 bg-neural-500/10 border-neural-500/20';
      case 'draft': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-neural-400 bg-neural-400/10 border-neural-400/20';
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'manual': return '👆';
      case 'schedule': return '⏰';
      case 'webhook': return '🔗';
      case 'prompt_execution': return '⚡';
      default: return '📋';
    }
  };

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
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-electric-500/10 border border-electric-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-electric-500 shadow-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-electric-500"></span>
            </span>
            <span>Phase 3 • Automation</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-[0.9] font-display">
            Workflow <span className="text-electric-500 text-glow">Automation</span>
          </h1>
          <p className="text-xl lg:text-2xl text-neural-400 leading-relaxed font-medium max-w-2xl">
            Automate your prompt engineering workflows with intelligent triggers, actions, and monitoring.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-premium"
        >
          <span>Create Workflow</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {workflows.map(workflow => (
          <div key={workflow.id} className="card-premium group hover:border-electric-500/30">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getTriggerIcon(workflow.trigger)}</div>
                <div>
                  <h3 className="text-xl font-black text-foreground group-hover:text-electric-500 transition-colors">
                    {workflow.name}
                  </h3>
                  <p className="text-sm text-neural-400 capitalize">{workflow.trigger} trigger</p>
                </div>
              </div>

              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(workflow.status)}`}>
                {workflow.status}
              </div>
            </div>

            <p className="text-neural-400 mb-6 leading-relaxed">{workflow.description}</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neural-500">Actions</span>
                <span className="font-bold text-foreground">{workflow.actions.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neural-500">Total Runs</span>
                <span className="font-bold text-foreground">{workflow.run_count}</span>
              </div>
              {workflow.last_run && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neural-500">Last Run</span>
                  <span className="font-bold text-foreground">
                    {new Date(workflow.last_run).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => toggleWorkflowStatus(workflow.id)}
                className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all ${workflow.status === 'active'
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                    : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                  }`}
              >
                {workflow.status === 'active' ? 'Pause' : 'Activate'}
              </button>

              <button className="p-2 text-neural-400 hover:text-electric-500 transition-colors hover:bg-electric-500/10 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <button className="p-2 text-neural-400 hover:text-electric-500 transition-colors hover:bg-electric-500/10 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-neural-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out_forwards]" onClick={() => setShowCreateModal(false)}>
          <div className="card-premium w-full max-w-xl shadow-2xl animate-[zoomIn_0.3s_ease-out_forwards]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tight font-display">Create Workflow</h2>
                <p className="text-[10px] font-bold text-neural-400 uppercase tracking-[0.3em]">Automation Pipeline</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-neural-400 hover:text-foreground transition-colors hover:bg-neural-100 dark:hover:bg-white/5 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Workflow Name</label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={e => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  className="input-forge !py-4 !px-6"
                  placeholder="e.g. Daily Quality Check"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Description</label>
                <textarea
                  value={newWorkflow.description}
                  onChange={e => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                  className="input-forge !py-4 !px-6 min-h-[100px] resize-none"
                  placeholder="Describe what this workflow does..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Trigger Type</label>
                <select
                  value={newWorkflow.trigger}
                  onChange={e => setNewWorkflow({ ...newWorkflow, trigger: e.target.value as any })}
                  className="input-forge !py-4 !px-6"
                >
                  <option value="manual">Manual - Run on demand</option>
                  <option value="schedule">Schedule - Run on timer</option>
                  <option value="webhook">Webhook - External trigger</option>
                  <option value="prompt_execution">Prompt Execution - Auto trigger</option>
                </select>
              </div>

              <button type="submit" className="w-full btn-premium !py-5 shadow-2xl">
                <span>Create Workflow</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}