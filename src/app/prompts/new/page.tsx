"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPrompt() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [promptText, setPromptText] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, prompt_text: promptText }),
      });

      if (res.ok) {
        router.push('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Create New Prompt</h1>
          <p className="text-slate-500 mt-1">Define your initial prompt version</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
            Prompt Title
          </label>
          <input 
            type="text" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. BlogPost Summarizer"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
            Description
          </label>
          <textarea 
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this prompt do?"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
            Prompt Text
          </label>
          <div className="relative group">
            <textarea 
              required
              rows={10}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Enter your prompt here. Use {{input}} for placeholders."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm leading-relaxed"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
          <button 
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md disabled:bg-slate-300"
          >
            {saving ? 'Creating...' : 'Create Prompt (v1)'}
          </button>
        </div>
      </form>
    </div>
  );
}
