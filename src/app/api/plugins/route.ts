import { NextRequest, NextResponse } from 'next/server';
import { getAllPlugins, savePlugin, Plugin } from '@/lib/plugins';

export async function GET() {
  try {
    const plugins = getAllPlugins();
    return NextResponse.json({
      data: plugins,
      meta: {
        timestamp: new Date().toISOString(),
        total: plugins.length
      }
    });
  } catch (error) {
    console.error('Error fetching plugins:', error);
    return NextResponse.json({ error: 'Failed to fetch plugins' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const pluginData = await req.json();

    const newPlugin: Plugin = {
      id: pluginData.id || `plugin_${Date.now()}`,
      name: pluginData.name,
      version: pluginData.version || '1.0.0',
      description: pluginData.description,
      author: pluginData.author || 'Unknown',
      type: pluginData.type,
      enabled: pluginData.enabled || false,
      config: pluginData.config || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    savePlugin(newPlugin);

    return NextResponse.json({
      data: newPlugin,
      meta: {
        timestamp: new Date().toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating plugin:', error);
    return NextResponse.json({ error: 'Failed to create plugin' }, { status: 500 });
  }
}