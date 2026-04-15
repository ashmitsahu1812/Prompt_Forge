import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  created_at: string;
  last_login?: string;
  preferences?: {
    theme: 'light' | 'dark';
    notifications: boolean;
    auto_save: boolean;
  };
}

// Database functions
const usersFile = join(process.cwd(), 'data', 'users.json');

function ensureUsersFile() {
  if (!existsSync(usersFile)) {
    // Start with empty users array - no demo account
    writeFileSync(usersFile, JSON.stringify([], null, 2));
  }
}

export function getAllUsers(): User[] {
  ensureUsersFile();
  try {
    const data = readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getUserByEmail(email: string): User | null {
  const users = getAllUsers();
  return users.find(user => user.email === email) || null;
}

export function getUserById(id: string): User | null {
  const users = getAllUsers();
  return users.find(user => user.id === id) || null;
}

export function createUser(userData: Omit<User, 'id' | 'created_at'>): User {
  const users = getAllUsers();

  // Check if user already exists
  if (users.some(u => u.email === userData.email)) {
    throw new Error('User with this email already exists');
  }

  const newUser: User = {
    ...userData,
    id: `user_${Date.now()}`,
    created_at: new Date().toISOString(),
    password: userData.password ? bcrypt.hashSync(userData.password, 12) : undefined
  };

  users.push(newUser);
  writeFileSync(usersFile, JSON.stringify(users, null, 2));

  return newUser;
}

export function updateUserLastLogin(userId: string) {
  const users = getAllUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex !== -1) {
    users[userIndex].last_login = new Date().toISOString();
    writeFileSync(usersFile, JSON.stringify(users, null, 2));
  }
}

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = getUserByEmail(credentials.email);

        if (!user || !user.password) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          return null;
        }

        // Update last login
        updateUserLastLogin(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
};