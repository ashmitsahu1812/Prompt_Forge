import { NextRequest, NextResponse } from 'next/server';
import { getUserByInviteToken, activateUser, logActivity } from '@/lib/team';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  try {
    const user = getUserByInviteToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token' },
        { status: 404 }
      );
    }

    // Activate the user
    activateUser(user.user_id);

    // Log activity
    logActivity({
      user_id: user.user_id,
      action: 'created',
      resource_type: 'execution',
      resource_id: user.user_id,
      details: `${user.name} accepted team invitation and joined as ${user.role}`
    });

    return NextResponse.json({
      message: 'Invitation accepted successfully',
      data: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: 'active'
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 });
  }
}