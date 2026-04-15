import { NextRequest, NextResponse } from 'next/server';
import { getAllPrompts, savePrompt, Prompt } from '@/lib/data';

// GET /api/v1/prompts - List all prompts with pagination and filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    let prompts = getAllPrompts();

    // Apply filters
    if (search) {
      prompts = prompts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      prompts = prompts.filter(p =>
        p.description.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPrompts = prompts.slice(startIndex, endIndex);

    const response = {
      data: paginatedPrompts,
      pagination: {
        page,
        limit,
        total: prompts.length,
        totalPages: Math.ceil(prompts.length / limit),
        hasNext: endIndex < prompts.length,
        hasPrev: page > 1
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to fetch prompts',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/v1/prompts - Create a new prompt
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    const { title, description, prompt_text } = body;
    if (!title || !description || !prompt_text) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'Missing required fields: title, description, prompt_text',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
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

    return NextResponse.json({
      data: newPrompt,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to create prompt',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}