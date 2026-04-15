import { NextRequest, NextResponse } from 'next/server';
import { savePrompt, saveTestSuite, saveTemplates, Prompt, TestSuite, Template } from '@/lib/data';
import { saveUser, logActivity, User } from '@/lib/team';
import { savePlugin, Plugin } from '@/lib/plugins';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const content = await file.text();
    let importData: any;

    try {
      importData = JSON.parse(content);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON file' }, { status: 400 });
    }

    const results = {
      imported: {
        prompts: 0,
        test_suites: 0,
        templates: 0,
        users: 0,
        plugins: 0,
        results: 0
      },
      errors: [] as string[]
    };

    // Import prompts
    if (importData.prompts && Array.isArray(importData.prompts)) {
      for (const promptData of importData.prompts) {
        try {
          // Generate new ID to avoid conflicts
          const prompt: Prompt = {
            ...promptData,
            prompt_id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          savePrompt(prompt);
          results.imported.prompts++;
        } catch (e) {
          results.errors.push(`Failed to import prompt: ${promptData.title || 'Unknown'}`);
        }
      }
    }

    // Import test suites
    if (importData.test_suites && Array.isArray(importData.test_suites)) {
      for (const suiteData of importData.test_suites) {
        try {
          const suite: TestSuite = {
            ...suiteData,
            suite_id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          saveTestSuite(suite);
          results.imported.test_suites++;
        } catch (e) {
          results.errors.push(`Failed to import test suite: ${suiteData.name || 'Unknown'}`);
        }
      }
    }

    // Import templates
    if (importData.templates && Array.isArray(importData.templates)) {
      try {
        const templatesWithNewIds = importData.templates.map((template: Template) => ({
          ...template,
          template_id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));

        // Get existing templates and merge
        const existingTemplates = [];
        try {
          const existingRes = await fetch('/api/templates');
          const existingData = await existingRes.json();
          existingTemplates.push(...(Array.isArray(existingData) ? existingData : existingData.templates || []));
        } catch (e) {
          // No existing templates
        }

        const allTemplates = [...existingTemplates, ...templatesWithNewIds];
        saveTemplates(allTemplates);
        results.imported.templates = templatesWithNewIds.length;
      } catch (e) {
        results.errors.push('Failed to import templates');
      }
    }

    // Import team data
    if (importData.team) {
      if (importData.team.users && Array.isArray(importData.team.users)) {
        for (const userData of importData.team.users) {
          try {
            const user: User = {
              ...userData,
              user_id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
            saveUser(user);
            results.imported.users++;
          } catch (e) {
            results.errors.push(`Failed to import user: ${userData.name || 'Unknown'}`);
          }
        }
      }
    }

    // Import plugins
    if (importData.plugins && Array.isArray(importData.plugins)) {
      for (const pluginData of importData.plugins) {
        try {
          const plugin: Plugin = {
            ...pluginData,
            id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            enabled: false // Disable imported plugins by default for security
          };
          savePlugin(plugin);
          results.imported.plugins++;
        } catch (e) {
          results.errors.push(`Failed to import plugin: ${pluginData.name || 'Unknown'}`);
        }
      }
    }

    // Log import activity
    logActivity({
      user_id: 'system',
      action: 'created',
      resource_type: 'execution',
      resource_id: `import_${Date.now()}`,
      details: `Imported ${results.imported.prompts} prompts, ${results.imported.test_suites} test suites, ${results.imported.templates} templates`
    });

    return NextResponse.json({
      message: 'Import completed',
      results,
      meta: {
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 });
  }
}