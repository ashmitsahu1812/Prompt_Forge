import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, saveUser, User, logActivity } from '@/lib/team';

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

    const newUser: User = {
      user_id: `user_${Date.now()}`,
      name,
      email,
      role,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    };

    saveUser(newUser);

    // Log activity
    logActivity({
      user_id: 'system',
      action: 'created',
      resource_type: 'execution',
      resource_id: newUser.user_id,
      details: `Invited ${name} (${email}) as ${role}`
    });

    return NextResponse.json({
      data: newUser,
      meta: {
        timestamp: new Date().toISOString()
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}