import fs from 'fs';
import path from 'path';

const isServerless = process.env.VERCEL || process.env.NODE_ENV === 'production';
export const DATA_DIR = isServerless ? '/tmp/data' : path.join(process.cwd(), 'data');

if (isServerless && !fs.existsSync('/tmp/data')) {
  try {
    fs.mkdirSync('/tmp', { recursive: true });
    fs.cpSync(path.join(process.cwd(), 'data'), '/tmp/data', { recursive: true });
  } catch(e) {
    console.error("Error seeding Vercel /tmp/data", e);
  }
}

export type PromptVersion = {
  version_id: string;
  prompt_text: string;
  created_at: string;
};

export type Prompt = {
  prompt_id: string;
  title: string;
  description: string;
  versions: PromptVersion[];
  current_version: string;
};

export function getPromptDataPath(promptId: string) {
  return path.join(DATA_DIR, 'prompts', "prompt_" + promptId + ".json");
}

export function getAllPrompts(): Prompt[] {
  const promptsDir = path.join(DATA_DIR, 'prompts');
  if (!fs.existsSync(promptsDir)) return [];
  
  const files = fs.readdirSync(promptsDir);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const content = fs.readFileSync(path.join(promptsDir, file), 'utf8');
      return JSON.parse(content);
    });
}

export function getPrompt(promptId: string): Prompt | null {
  const filePath = getPromptDataPath(promptId);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

export function savePrompt(prompt: Prompt) {
  const promptsDir = path.join(DATA_DIR, 'prompts');
  if (!fs.existsSync(promptsDir)) {
    fs.mkdirSync(promptsDir, { recursive: true });
  }
  const filePath = getPromptDataPath(prompt.prompt_id);
  fs.writeFileSync(filePath, JSON.stringify(prompt, null, 2));
}

export function createNewVersion(promptId: string, promptText: string): Prompt | null {
  const prompt = getPrompt(promptId);
  if (!prompt) return null;

  const nextVersionNum = prompt.versions.length + 1;
  const newVersionId = "v" + nextVersionNum;

  const newVersion: PromptVersion = {
    version_id: newVersionId,
    prompt_text: promptText,
    created_at: new Date().toISOString(),
  };

  prompt.versions.push(newVersion);
  prompt.current_version = newVersionId;
  savePrompt(prompt);
  return prompt;
}

export function rollbackToVersion(promptId: string, versionId: string): Prompt | null {
  const prompt = getPrompt(promptId);
  if (!prompt) return null;

  const versionExists = prompt.versions.some(v => v.version_id === versionId);
  if (!versionExists) return null;

  prompt.current_version = versionId;
  savePrompt(prompt);
  return prompt;
}

export function deletePrompt(promptId: string) {
  const filePath = getPromptDataPath(promptId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export type TestCase = Record<string, string>;

export type TestSuite = {
  suite_id: string;
  name: string;
  inputs: (string | TestCase)[];
};

export function getAllTestSuites(): TestSuite[] {
  const suitesDir = path.join(DATA_DIR, 'test_suites');
  if (!fs.existsSync(suitesDir)) return [];
  
  const files = fs.readdirSync(suitesDir);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => {
      const content = fs.readFileSync(path.join(suitesDir, file), 'utf8');
      const data = JSON.parse(content);
      
      // Migration logic: Ensure all inputs are parsed correctly
      if (Array.isArray(data.inputs)) {
        data.inputs = data.inputs.map((input: any) => {
          if (typeof input === 'string') {
            // String found, convert to Record if it looks like JSON or leave as string for backward compatibility
            try {
              if (input.trim().startsWith('{') && input.trim().endsWith('}')) {
                return JSON.parse(input);
              }
            } catch (e) {}
          }
          return input;
        });
      }
      
      return data;
    });
}

export function saveTestSuite(suite: TestSuite) {
  const suitesDir = path.join(DATA_DIR, 'test_suites');
  if (!fs.existsSync(suitesDir)) {
    fs.mkdirSync(suitesDir, { recursive: true });
  }
  const filePath = path.join(suitesDir, "suite_" + suite.suite_id + ".json");
  fs.writeFileSync(filePath, JSON.stringify(suite, null, 2));
}

export function getExecutionLog(executionId: string) {
  const logPath = path.join(DATA_DIR, 'results', `log_${executionId}.json`);
  if (!fs.existsSync(logPath)) return null;
  return JSON.parse(fs.readFileSync(logPath, 'utf8'));
}

export function saveExecutionLog(log: any) {
  const logPath = path.join(DATA_DIR, 'results', `log_${log.execution_id}.json`);
  const logsDir = path.join(DATA_DIR, 'results');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
}

export type Template = {
  template_id: string;
  category: string;
  title: string;
  text: string;
};

export function getAllTemplates(): Template[] {
  const templatesPath = path.join(DATA_DIR, 'templates', 'template_library.json');
  if (!fs.existsSync(templatesPath)) return [];
  const content = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
  // Support both direct array and { templates: [] } formats
  return Array.isArray(content) ? content : (content.templates || []);
}

export function saveTemplates(templates: Template[]) {
  const templatesDir = path.join(DATA_DIR, 'templates');
  if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir, { recursive: true });
  const templatesPath = path.join(templatesDir, 'template_library.json');
  fs.writeFileSync(templatesPath, JSON.stringify({
    categories: Array.from(new Set(templates.map(t => t.category))),
    templates
  }, null, 2));
}
