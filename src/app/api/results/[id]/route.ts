import { NextRequest, NextResponse } from 'next/server';
import { getExecutionLog, saveExecutionLog } from '@/lib/data';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const log = getExecutionLog(id);
  
  if (!log) {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 });
  }
  
  return NextResponse.json(log);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { result_index, rating, ai_grade } = await req.json();

  const log = getExecutionLog(id);
  if (!log) {
    return NextResponse.json({ error: 'Log not found' }, { status: 404 });
  }

  if (log.results[result_index]) {
    if (rating !== undefined) log.results[result_index].rating = rating;
    if (ai_grade !== undefined) log.results[result_index].ai_grade = ai_grade;
    saveExecutionLog(log);
  }

  return NextResponse.json(log);
}
