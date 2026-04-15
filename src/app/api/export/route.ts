import { NextRequest, NextResponse } from 'next/server';
import { getAllPrompts, getAllTestSuites, getAllTemplates, DATA_DIR } from '@/lib/data';
import { getAllUsers, getAllActivities, getTeamSettings } from '@/lib/team';
import { getAllPlugins } from '@/lib/plugins';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';
    const include = searchParams.get('include')?.split(',') || ['prompts', 'test_suites', 'templates'];

    const exportData: any = {
      metadata: {
        exported_at: new Date().toISOString(),
        version: '2.0.0',
        format,
        includes: include
      }
    };

    // Export prompts
    if (include.includes('prompts')) {
      exportData.prompts = getAllPrompts();
    }

    // Export test suites
    if (include.includes('test_suites')) {
      exportData.test_suites = getAllTestSuites();
    }

    // Export templates
    if (include.includes('templates')) {
      exportData.templates = getAllTemplates();
    }

    // Export team data
    if (include.includes('team')) {
      exportData.team = {
        users: getAllUsers(),
        activities: getAllActivities(1000),
        settings: getTeamSettings()
      };
    }

    // Export plugins
    if (include.includes('plugins')) {
      exportData.plugins = getAllPlugins();
    }

    // Export execution results
    if (include.includes('results')) {
      const resultsDir = path.join(DATA_DIR, 'results');
      const results: any[] = [];

      if (fs.existsSync(resultsDir)) {
        const logFiles = fs.readdirSync(resultsDir).filter(file => file.startsWith('log_') && file.endsWith('.json'));
        logFiles.forEach(file => {
          try {
            const content = fs.readFileSync(path.join(resultsDir, file), 'utf8');
            results.push(JSON.parse(content));
          } catch (e) {
            console.error(`Failed to read log file ${file}:`, e);
          }
        });
      }

      exportData.results = results;
    }

    if (format === 'zip') {
      // Create ZIP file with separate JSON files
      const zip = new JSZip();

      Object.keys(exportData).forEach(key => {
        if (key !== 'metadata') {
          zip.file(`${key}.json`, JSON.stringify(exportData[key], null, 2));
        }
      });

      zip.file('metadata.json', JSON.stringify(exportData.metadata, null, 2));

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      return new NextResponse(zipBuffer as any, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="prompt-forge-export-${Date.now()}.zip"`
        }
      });
    }

    // Return JSON format
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="prompt-forge-export-${Date.now()}.json"`
      }
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}