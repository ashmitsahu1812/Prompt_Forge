"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    browser: boolean;
    execution_complete: boolean;
    team_invites: boolean;
    system_alerts: boolean;
  };
  editor: {
    auto_save: boolean;
    syntax_highlighting: boolean;
    line_numbers: boolean;
    word_wrap: boolean;
    font_size: number;
  };
  execution: {
    auto_run_tests: boolean;
    save_results: boolean;
    timeout: number;
    max_retries: number;
  };
  privacy: {
    analytics: boolean;
    error_reporting: boolean;
    usage_data: boolean;
  };
}

export default function Preferences() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'dark',
    notifications: {
      email: true,
      browser: true,
      execution_complete: true,
      team_invites: true,
      system_alerts: false
    },
    editor: {
      auto_save: true,
      syntax_highlighting: true,
      line_numbers: true,
      word_wrap: false,
      font_size: 14
    },
    execution: {
      auto_run_tests: false,
      save_results: true,
      timeout: 30,
      max_retries: 3
    },
    privacy: {
      analytics: true,
      error_reporting: true,
      usage_data: false
    }
  });

  const handleSavePreferences = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Mock API call - in real implementation, this would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage('Preferences saved successfully!');
    } catch (error) {
      setMessage('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (section: keyof UserPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value
      }
    }));
  };

  const PreferenceSection = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
    <div className="card-premium">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-foreground mb-2">{title}</h3>
        <p className="text-neural-400">{description}</p>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  const ToggleSwitch = ({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (checked: boolean) => void }) => (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <label className="text-foreground font-bold cursor-pointer">{label}</label>
        {description && <p className="text-sm text-neural-400 mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-purple-500' : 'bg-neural-600'
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </button>
    </div>
  );

  const NumberInput = ({ label, value, onChange, min, max, unit }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number; unit?: string }) => (
    <div className="flex items-center justify-between">
      <label className="text-foreground font-bold">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          min={min}
          max={max}
          className="w-20 px-3 py-2 bg-neural-900 border border-white/10 rounded-lg text-foreground text-center"
        />
        {unit && <span className="text-neural-400 text-sm">{unit}</span>}
      </div>
    </div>
  );

  const SelectInput = ({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) => (
    <div className="flex items-center justify-between">
      <label className="text-foreground font-bold">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-4 py-2 bg-neural-900 border border-white/10 rounded-lg text-foreground"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-20 lg:space-y-32 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 shadow-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>User Settings</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-[0.9] font-display">
            User <span className="text-indigo-500 text-glow">Preferences</span>
          </h1>
          <p className="text-xl lg:text-2xl text-neural-400 leading-relaxed font-medium max-w-2xl">
            Customize your Prompt Forge experience with personalized settings and configurations.
          </p>
        </div>

        <button
          onClick={handleSavePreferences}
          disabled={loading}
          className="btn-premium disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>Save Preferences</span>
          )}
        </button>
      </header>

      {message && (
        <div className={`p-4 rounded-xl border ${message.includes('successfully')
          ? 'bg-green-500/10 border-green-500/20 text-green-400'
          : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Appearance */}
        <PreferenceSection
          title="Appearance"
          description="Customize the visual appearance and theme"
        >
          <SelectInput
            label="Theme"
            value={preferences.theme}
            onChange={(value) => updatePreference('theme', 'theme', value)}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'auto', label: 'Auto (System)' }
            ]}
          />
        </PreferenceSection>

        {/* Notifications */}
        <PreferenceSection
          title="Notifications"
          description="Control how and when you receive notifications"
        >
          <ToggleSwitch
            label="Email Notifications"
            description="Receive notifications via email"
            checked={preferences.notifications.email}
            onChange={(checked) => updatePreference('notifications', 'email', checked)}
          />
          <ToggleSwitch
            label="Browser Notifications"
            description="Show browser push notifications"
            checked={preferences.notifications.browser}
            onChange={(checked) => updatePreference('notifications', 'browser', checked)}
          />
          <ToggleSwitch
            label="Execution Complete"
            description="Notify when prompt execution finishes"
            checked={preferences.notifications.execution_complete}
            onChange={(checked) => updatePreference('notifications', 'execution_complete', checked)}
          />
          <ToggleSwitch
            label="Team Invites"
            description="Notify about team invitations"
            checked={preferences.notifications.team_invites}
            onChange={(checked) => updatePreference('notifications', 'team_invites', checked)}
          />
          <ToggleSwitch
            label="System Alerts"
            description="Receive system maintenance and update alerts"
            checked={preferences.notifications.system_alerts}
            onChange={(checked) => updatePreference('notifications', 'system_alerts', checked)}
          />
        </PreferenceSection>

        {/* Editor Settings */}
        <PreferenceSection
          title="Editor Settings"
          description="Configure the prompt editor behavior"
        >
          <ToggleSwitch
            label="Auto Save"
            description="Automatically save changes while typing"
            checked={preferences.editor.auto_save}
            onChange={(checked) => updatePreference('editor', 'auto_save', checked)}
          />
          <ToggleSwitch
            label="Syntax Highlighting"
            description="Enable syntax highlighting in the editor"
            checked={preferences.editor.syntax_highlighting}
            onChange={(checked) => updatePreference('editor', 'syntax_highlighting', checked)}
          />
          <ToggleSwitch
            label="Line Numbers"
            description="Show line numbers in the editor"
            checked={preferences.editor.line_numbers}
            onChange={(checked) => updatePreference('editor', 'line_numbers', checked)}
          />
          <ToggleSwitch
            label="Word Wrap"
            description="Wrap long lines in the editor"
            checked={preferences.editor.word_wrap}
            onChange={(checked) => updatePreference('editor', 'word_wrap', checked)}
          />
          <NumberInput
            label="Font Size"
            value={preferences.editor.font_size}
            onChange={(value) => updatePreference('editor', 'font_size', value)}
            min={10}
            max={24}
            unit="px"
          />
        </PreferenceSection>

        {/* Execution Settings */}
        <PreferenceSection
          title="Execution Settings"
          description="Configure prompt execution behavior"
        >
          <ToggleSwitch
            label="Auto Run Tests"
            description="Automatically run test suites after prompt changes"
            checked={preferences.execution.auto_run_tests}
            onChange={(checked) => updatePreference('execution', 'auto_run_tests', checked)}
          />
          <ToggleSwitch
            label="Save Results"
            description="Automatically save execution results"
            checked={preferences.execution.save_results}
            onChange={(checked) => updatePreference('execution', 'save_results', checked)}
          />
          <NumberInput
            label="Timeout"
            value={preferences.execution.timeout}
            onChange={(value) => updatePreference('execution', 'timeout', value)}
            min={5}
            max={300}
            unit="seconds"
          />
          <NumberInput
            label="Max Retries"
            value={preferences.execution.max_retries}
            onChange={(value) => updatePreference('execution', 'max_retries', value)}
            min={0}
            max={10}
          />
        </PreferenceSection>

        {/* Privacy Settings */}
        <PreferenceSection
          title="Privacy & Data"
          description="Control data collection and privacy settings"
        >
          <ToggleSwitch
            label="Analytics"
            description="Help improve Prompt Forge by sharing anonymous usage analytics"
            checked={preferences.privacy.analytics}
            onChange={(checked) => updatePreference('privacy', 'analytics', checked)}
          />
          <ToggleSwitch
            label="Error Reporting"
            description="Automatically send error reports to help fix issues"
            checked={preferences.privacy.error_reporting}
            onChange={(checked) => updatePreference('privacy', 'error_reporting', checked)}
          />
          <ToggleSwitch
            label="Usage Data"
            description="Share usage patterns to improve features"
            checked={preferences.privacy.usage_data}
            onChange={(checked) => updatePreference('privacy', 'usage_data', checked)}
          />
        </PreferenceSection>

        {/* Export/Import */}
        <PreferenceSection
          title="Data Management"
          description="Export or import your preferences and data"
        >
          <div className="space-y-4">
            <button className="w-full py-3 px-4 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl font-bold hover:bg-blue-500/20 transition-colors">
              Export Preferences
            </button>
            <button className="w-full py-3 px-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-xl font-bold hover:bg-green-500/20 transition-colors">
              Import Preferences
            </button>
            <button className="w-full py-3 px-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold hover:bg-red-500/20 transition-colors">
              Reset to Defaults
            </button>
          </div>
        </PreferenceSection>
      </div>
    </div>
  );
}