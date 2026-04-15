import { NextRequest, NextResponse } from 'next/server';
import { getUserByInviteToken } from '@/lib/team';

export async function GET(
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

    // Don't return sensitive information
    const safeUser = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      invite_expires: user.invite_expires,
      status: user.status
    };

    return NextResponse.json({
      data: safeUser,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    return NextResponse.json({ error: 'Failed to validate invitation' }, { status: 500 });
  }
}