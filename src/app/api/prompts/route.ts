import { NextRequest, NextResponse } from 'next/server';
import { getAllPrompts, savePrompt, Prompt } from '@/lib/data';

export async function GET() {
  try {
    const prompts = getAllPrompts();
    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, prompt_text = "Act as a professional assistant and response to: {{input}}" } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const newPrompt: Prompt = {
      prompt_id: Date.now().toString(),
      title,
      description,
      versions: [
        {
          version_id: 'v1',
          prompt_text,
          created_at: new Date().toISOString(),
        },
      ],
      current_version: 'v1',
    };

    savePrompt(newPrompt);
    return NextResponse.json(newPrompt, { status: 201 });
  } catch (error) {
    console.error('Error saving prompt:', error);
    return NextResponse.json({ error: 'Failed to save prompt' }, { status: 500 });
  }
}
