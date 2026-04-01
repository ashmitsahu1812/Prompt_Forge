import { NextRequest, NextResponse } from 'next/server';
import { getAllTestSuites, saveTestSuite, TestSuite } from '@/lib/data';

export async function GET() {
  try {
    const suites = getAllTestSuites();
    return NextResponse.json(suites);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch test suites' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, inputs } = await req.json();
    if (!name || !inputs) return NextResponse.json({ error: 'Name and inputs required' }, { status: 400 });

    const newSuite: TestSuite = {
      suite_id: Date.now().toString(),
      name,
      inputs
    };

    saveTestSuite(newSuite);
    return NextResponse.json(newSuite, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save test suite' }, { status: 500 });
  }
}
