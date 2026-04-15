import fs from 'fs';
import path from 'path';
import { DATA_DIR } from './data';

export interface Plugin {
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

export interface ScoringPlugin extends Plugin {
  type: 'scorer';
  scoreFunction: (output: string, criteria: any) => Promise<{ score: number; justification: string }>;
}

export interface IntegrationPlugin extends Plugin {
  type: 'integration';
  endpoints: {
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    path: string;
    handler: (req: any) => Promise<any>;
  }[];
}

export function getPluginsPath() {
  return path.join(DATA_DIR, 'plugins');
}

export function getPluginConfigPath() {
  return path.join(getPluginsPath(), 'config.json');
}

export function initializePlugins() {
  const pluginsDir = getPluginsPath();
  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true });
  }

  const configPath = getPluginConfigPath();
  if (!fs.existsSync(configPath)) {
    const defaultPlugins: Plugin[] = [
      {
        id: 'readability-scorer',
        name: 'Readability Scorer',
        version: '1.0.0',
        description: 'Scores text based on readability metrics',
        author: 'Prompt Forge Team',
        type: 'scorer',
        enabled: true,
        config: {
          metrics: ['flesch_kincaid', 'gunning_fog', 'coleman_liau'],
          weights: { flesch_kincaid: 0.4, gunning_fog: 0.3, coleman_liau: 0.3 }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'sentiment-scorer',
        name: 'Sentiment Scorer',
        version: '1.0.0',
        description: 'Analyzes sentiment and emotional tone',
        author: 'Prompt Forge Team',
        type: 'scorer',
        enabled: true,
        config: {
          positive_keywords: ['excellent', 'great', 'amazing', 'wonderful', 'fantastic'],
          negative_keywords: ['terrible', 'awful', 'horrible', 'bad', 'poor'],
          neutral_threshold: 0.1
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'slack-integration',
        name: 'Slack Integration',
        version: '1.0.0',
        description: 'Send notifications and results to Slack',
        author: 'Prompt Forge Team',
        type: 'integration',
        enabled: false,
        config: {
          webhook_url: '',
          channel: '#prompt-forge',
          notify_on: ['execution_complete', 'high_score', 'error']
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    fs.writeFileSync(configPath, JSON.stringify(defaultPlugins, null, 2));
  }
}

export function getAllPlugins(): Plugin[] {
  initializePlugins();
  const configPath = getPluginConfigPath();
  const content = fs.readFileSync(configPath, 'utf8');
  return JSON.parse(content);
}

export function getPlugin(pluginId: string): Plugin | null {
  const plugins = getAllPlugins();
  return plugins.find(p => p.id === pluginId) || null;
}

export function savePlugin(plugin: Plugin) {
  const plugins = getAllPlugins();
  const existingIndex = plugins.findIndex(p => p.id === plugin.id);

  plugin.updated_at = new Date().toISOString();

  if (existingIndex >= 0) {
    plugins[existingIndex] = plugin;
  } else {
    plugins.push(plugin);
  }

  const configPath = getPluginConfigPath();
  fs.writeFileSync(configPath, JSON.stringify(plugins, null, 2));
}

export function deletePlugin(pluginId: string) {
  const plugins = getAllPlugins();
  const filteredPlugins = plugins.filter(p => p.id !== pluginId);

  const configPath = getPluginConfigPath();
  fs.writeFileSync(configPath, JSON.stringify(filteredPlugins, null, 2));
}

export function togglePlugin(pluginId: string, enabled: boolean) {
  const plugin = getPlugin(pluginId);
  if (plugin) {
    plugin.enabled = enabled;
    savePlugin(plugin);
  }
}

// Built-in scoring plugins
export const builtInScorers = {
  'readability-scorer': async (output: string, criteria: any) => {
    const words = output.split(/\s+/).length;
    const sentences = output.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;

    // Simple readability score (lower is better, convert to 1-10 scale)
    let readabilityScore = Math.max(1, Math.min(10, 15 - avgWordsPerSentence));

    return {
      score: Math.round(readabilityScore),
      justification: `Readability analysis: ${words} words, ${sentences} sentences, ${avgWordsPerSentence.toFixed(1)} words per sentence`
    };
  },

  'sentiment-scorer': async (output: string, criteria: any) => {
    const config = criteria.config || {};
    const positiveWords = config.positive_keywords || [];
    const negativeWords = config.negative_keywords || [];

    const outputLower = output.toLowerCase();
    const positiveCount = positiveWords.filter((word: string) => outputLower.includes(word.toLowerCase())).length;
    const negativeCount = negativeWords.filter((word: string) => outputLower.includes(word.toLowerCase())).length;

    const sentimentScore = positiveCount - negativeCount;
    const normalizedScore = Math.max(1, Math.min(10, 5 + sentimentScore));

    return {
      score: Math.round(normalizedScore),
      justification: `Sentiment analysis: ${positiveCount} positive terms, ${negativeCount} negative terms`
    };
  }
};

export async function executePlugin(pluginId: string, output: string, criteria: any = {}) {
  const plugin = getPlugin(pluginId);
  if (!plugin || !plugin.enabled) {
    throw new Error(`Plugin ${pluginId} not found or disabled`);
  }

  if (plugin.type === 'scorer') {
    const scorer = builtInScorers[pluginId as keyof typeof builtInScorers];
    if (scorer) {
      return await scorer(output, { ...criteria, config: plugin.config });
    }
  }

  throw new Error(`Plugin ${pluginId} execution not implemented`);
}