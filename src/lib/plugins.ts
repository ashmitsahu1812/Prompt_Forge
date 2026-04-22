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

function getPluginsFilePath() {
  return path.join(DATA_DIR, 'plugins', 'plugins.json');
}

// Initialize with default plugins
function initializePlugins() {
  const pluginsDir = path.join(DATA_DIR, 'plugins');
  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true });
  }

  const filePath = getPluginsFilePath();
  if (!fs.existsSync(filePath)) {
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
        id: 'length-scorer',
        name: 'Length Scorer',
        version: '1.0.0',
        description: 'Scores based on response length criteria',
        author: 'Prompt Forge Team',
        type: 'scorer',
        enabled: true,
        config: {
          min_length: 50,
          max_length: 500,
          optimal_length: 200
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'keyword-scorer',
        name: 'Keyword Scorer',
        version: '1.0.0',
        description: 'Scores based on keyword presence and density',
        author: 'Prompt Forge Team',
        type: 'scorer',
        enabled: true,
        config: {
          required_keywords: [],
          bonus_keywords: [],
          penalty_keywords: []
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
    fs.writeFileSync(filePath, JSON.stringify(defaultPlugins, null, 2), 'utf8');
  }
}

export function getAllPlugins(): Plugin[] {
  initializePlugins();
  const filePath = getPluginsFilePath();
  const content = fs.readFileSync(filePath, 'utf8');
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

  const filePath = getPluginsFilePath();
  fs.writeFileSync(filePath, JSON.stringify(plugins, null, 2), 'utf8');
}

export function deletePlugin(pluginId: string) {
  const plugins = getAllPlugins();
  const newPlugins = plugins.filter(p => p.id !== pluginId);
  
  const filePath = getPluginsFilePath();
  fs.writeFileSync(filePath, JSON.stringify(newPlugins, null, 2), 'utf8');
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
    const sentences = output.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = sentences > 0 ? words / sentences : words;

    // Simple readability score (lower is better, convert to 1-10 scale)
    let readabilityScore = Math.max(1, Math.min(10, 15 - avgWordsPerSentence));

    return {
      score: Math.round(readabilityScore * 10) / 10,
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
      score: Math.round(normalizedScore * 10) / 10,
      justification: `Sentiment analysis: ${positiveCount} positive terms, ${negativeCount} negative terms`
    };
  },

  'length-scorer': async (output: string, criteria: any) => {
    const config = criteria.config || {};
    const minLength = config.min_length || 50;
    const maxLength = config.max_length || 500;
    const optimalLength = config.optimal_length || 200;

    const length = output.length;
    let score = 10;

    if (length < minLength) {
      score = Math.max(1, (length / minLength) * 5);
    } else if (length > maxLength) {
      score = Math.max(1, 10 - ((length - maxLength) / maxLength) * 5);
    } else {
      // Score based on distance from optimal length
      const distance = Math.abs(length - optimalLength);
      const maxDistance = Math.max(optimalLength - minLength, maxLength - optimalLength);
      score = Math.max(5, 10 - (distance / maxDistance) * 5);
    }

    return {
      score: Math.round(score * 10) / 10,
      justification: `Length analysis: ${length} characters (optimal: ${optimalLength}, range: ${minLength}-${maxLength})`
    };
  },

  'keyword-scorer': async (output: string, criteria: any) => {
    const config = criteria.config || {};
    const requiredKeywords = config.required_keywords || [];
    const bonusKeywords = config.bonus_keywords || [];
    const penaltyKeywords = config.penalty_keywords || [];

    const outputLower = output.toLowerCase();

    let score = 5; // Base score
    let justification = [];

    // Check required keywords
    const foundRequired = requiredKeywords.filter((keyword: string) =>
      outputLower.includes(keyword.toLowerCase())
    );
    const requiredScore = requiredKeywords.length > 0 ?
      (foundRequired.length / requiredKeywords.length) * 5 : 0;
    score += requiredScore;

    if (requiredKeywords.length > 0) {
      justification.push(`Required keywords: ${foundRequired.length}/${requiredKeywords.length}`);
    }

    // Check bonus keywords
    const foundBonus = bonusKeywords.filter((keyword: string) =>
      outputLower.includes(keyword.toLowerCase())
    );
    const bonusScore = Math.min(2, foundBonus.length * 0.5);
    score += bonusScore;

    if (bonusKeywords.length > 0) {
      justification.push(`Bonus keywords: ${foundBonus.length}`);
    }

    // Check penalty keywords
    const foundPenalty = penaltyKeywords.filter((keyword: string) =>
      outputLower.includes(keyword.toLowerCase())
    );
    const penaltyScore = foundPenalty.length * 1;
    score -= penaltyScore;

    if (foundPenalty.length > 0) {
      justification.push(`Penalty keywords: ${foundPenalty.length}`);
    }

    score = Math.max(1, Math.min(10, score));

    return {
      score: Math.round(score * 10) / 10,
      justification: `Keyword analysis: ${justification.join(', ')}`
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