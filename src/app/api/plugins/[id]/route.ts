import { NextRequest, NextResponse } from 'next/server';
import { getPlugin, savePlugin, deletePlugin, togglePlugin } from '@/lib/plugins';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const plugin = getPlugin(id);
    if (!plugin) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: plugin,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching plugin:', error);
    return NextResponse.json({ error: 'Failed to fetch plugin' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const updates = await req.json();
    const plugin = getPlugin(id);

    if (!plugin) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }

    // Handle enable/disable toggle
    if ('enabled' in updates) {
      togglePlugin(id, updates.enabled);
    }

    // Handle other updates
    const updatedPlugin = { ...plugin, ...updates };
    savePlugin(updatedPlugin);

    return NextResponse.json({
      data: updatedPlugin,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating plugin:', error);
    return NextResponse.json({ error: 'Failed to update plugin' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const plugin = getPlugin(id);
    if (!plugin) {
      return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
    }

    deletePlugin(id);

    return NextResponse.json({
      message: 'Plugin deleted successfully',
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error deleting plugin:', error);
    return NextResponse.json({ error: 'Failed to delete plugin' }, { status: 500 });
  }
}