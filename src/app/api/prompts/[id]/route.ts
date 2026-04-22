import { NextRequest, NextResponse } from 'next/server';
import { getPrompt, savePrompt, createNewVersion, rollbackToVersion } from '@/lib/data';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const prompt = getPrompt(id);
  
  if (!prompt) {
    const { getPromptDataPath } = await import('@/lib/data');
    const path = getPromptDataPath(id);
    console.error(`[API] Prompt ID ${id} not found at ${path}`);
    return NextResponse.json({ 
      error: 'Prompt not found', 
      id,
      checked_path: path 
    }, { status: 404 });
  }
  
  return NextResponse.json(prompt);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { action, prompt_text, title, description, version_id } = body;

  let prompt = getPrompt(id);
  if (!prompt) {
    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
  }

  if (action === 'new_version') {
    if (!prompt_text) return NextResponse.json({ error: 'Prompt text required' }, { status: 400 });
    prompt = createNewVersion(id, prompt_text);
  } else if (action === 'rollback') {
    if (!version_id) return NextResponse.json({ error: 'Version ID required' }, { status: 400 });
    prompt = rollbackToVersion(id, version_id);
  } else if (action === 'update_metadata') {
    if (title) prompt.title = title;
    if (description) prompt.description = description;
    savePrompt(prompt);
  }

  return NextResponse.json(prompt);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { deletePrompt } = await import('@/lib/data');
  deletePrompt(id);
  return NextResponse.json({ success: true });
}
