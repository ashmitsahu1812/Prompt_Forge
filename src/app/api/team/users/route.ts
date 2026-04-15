import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, saveUser, User, logActivity, generateInviteToken } from '@/lib/team';
import { sendTeamInvitation } from '@/lib/email';

export async function GET() {
  try {
    const users = getAllUsers();
    return NextResponse.json({
      data: users,
      meta: {
        timestamp: new Date().toISOString(),
        total: users.length
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, role = 'editor' } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUsers = getAllUsers();
    if (existingUsers.some(u => u.email === email)) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate invitation token
    const inviteToken = generateInviteToken();
    const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const newUser: User = {
      user_id: `user_${Date.now()}`,
      name,
      email,
      role,
      status: 'pending',
      invite_token: inviteToken,
      invite_expires: inviteExpires,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    };

    saveUser(newUser);

    // Send invitation email
    try {
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/invite/${inviteToken}`;

      await sendTeamInvitation({
        recipientEmail: email,
        recipientName: name,
        inviterName: 'Prompt Forge Team', // You can get this from session/auth
        teamName: 'Prompt Forge Team',
        role,
        inviteToken,
        inviteUrl
      });

      // Log activity
      logActivity({
        user_id: 'system',
        action: 'created',
        resource_type: 'execution',
        resource_id: newUser.user_id,
        details: `Sent invitation to ${name} (${email}) as ${role}`
      });

      return NextResponse.json({
        data: newUser,
        message: 'Invitation sent successfully! Check your email.',
        meta: {
          timestamp: new Date().toISOString(),
          invite_expires: inviteExpires
        }
      }, { status: 201 });

    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);

      // Still return success but indicate email issue
      return NextResponse.json({
        data: newUser,
        message: 'User created but failed to send invitation email. Please check email configuration.',
        warning: 'Email delivery failed',
        meta: {
          timestamp: new Date().toISOString(),
          invite_expires: inviteExpires
        }
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}