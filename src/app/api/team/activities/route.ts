import { NextRequest, NextResponse } from 'next/server';
import { getAllActivities } from '@/lib/team';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const activities = getAllActivities(limit);

    return NextResponse.json({
      data: activities,
      meta: {
        timestamp: new Date().toISOString(),
        total: activities.length,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}