import { NextRequest, NextResponse } from 'next/server';
import { getAllTemplates, saveTemplates, Template } from '@/lib/data';

export async function GET() {
  const templates = getAllTemplates();
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const { category, title, text } = await req.json();
  const templates = getAllTemplates();
  const newTemplate: Template = {
    template_id: Date.now().toString(),
    category,
    title,
    text
  };
  templates.push(newTemplate);
  saveTemplates(templates);
  return NextResponse.json(newTemplate);
}
