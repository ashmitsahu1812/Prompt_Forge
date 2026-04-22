import fs from 'fs';
import path from 'path';
import { DATA_DIR } from './data';

const TEAM_DIR = path.join(DATA_DIR, 'team');
const MEMBERS_FILE = path.join(TEAM_DIR, 'members.json');
const ACTIVITIES_FILE = path.join(TEAM_DIR, 'activities.json');
const SETTINGS_FILE = path.join(TEAM_DIR, 'settings.json');

// Initialize with default data
function initializeTeamData() {
  if (!fs.existsSync(TEAM_DIR)) {
    fs.mkdirSync(TEAM_DIR, { recursive: true });
  }

  if (!fs.existsSync(MEMBERS_FILE)) {
    const defaultMembers: User[] = [
      {
        user_id: 'admin_001',
        name: 'Admin User',
        email: 'admin@promptforge.dev',
        role: 'admin',
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        status: 'active'
      }
    ];
    fs.writeFileSync(MEMBERS_FILE, JSON.stringify(defaultMembers, null, 2), 'utf8');
  }

  if (!fs.existsSync(ACTIVITIES_FILE)) {
    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify([], null, 2), 'utf8');
  }

  if (!fs.existsSync(SETTINGS_FILE)) {
    const defaultSettings = {
      team_name: 'Prompt Forge Team',
      allow_public_prompts: true,
      require_approval: false,
      default_role: 'editor' as UserRole,
      created_at: new Date().toISOString()
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf8');
  }
}

export function getAllUsers(): User[] {
  initializeTeamData();
  const content = fs.readFileSync(MEMBERS_FILE, 'utf8');
  return JSON.parse(content);
}

function saveMembers(members: User[]) {
  fs.writeFileSync(MEMBERS_FILE, JSON.stringify(members, null, 2), 'utf8');
}

export function getUser(userId: string): User | null {
  const users = getAllUsers();
  return users.find(u => u.user_id === userId) || null;
}

export function saveUser(user: User) {
  const users = getAllUsers();
  const existingIndex = users.findIndex(u => u.user_id === user.user_id);

  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  saveMembers(users);
}

export function deleteUser(userId: string) {
  const users = getAllUsers();
  const newUsers = users.filter(u => u.user_id !== userId);
  saveMembers(newUsers);
}

export function getAllActivities(limit: number = 50): Activity[] {
  initializeTeamData();
  const content = fs.readFileSync(ACTIVITIES_FILE, 'utf8');
  const activities = JSON.parse(content);
  // Sort by timestamp (newest first) and limit
  return activities
    .sort((a: Activity, b: Activity) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function logActivity(activity: Omit<Activity, 'activity_id' | 'timestamp'>) {
  initializeTeamData();
  const content = fs.readFileSync(ACTIVITIES_FILE, 'utf8');
  const activities: Activity[] = JSON.parse(content);
  
  const newActivity: Activity = {
    ...activity,
    activity_id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };

  activities.unshift(newActivity);

  // Keep only last 1000 activities
  const limitedActivities = activities.slice(0, 1000);
  fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(limitedActivities, null, 2), 'utf8');
}

export function getTeamSettings() {
  initializeTeamData();
  const content = fs.readFileSync(SETTINGS_FILE, 'utf8');
  return JSON.parse(content);
}

export function updateTeamSettings(settings: any) {
  const currentSettings = getTeamSettings();
  const newSettings = { ...currentSettings, ...settings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2), 'utf8');
}

export function hasPermission(user: User, action: string, resource?: any): boolean {
  // Admin can do everything
  if (user.role === 'admin') return true;

  // Editor permissions
  if (user.role === 'editor') {
    const editorActions = ['create', 'update', 'execute', 'view'];
    return editorActions.includes(action);
  }

  // Viewer permissions
  if (user.role === 'viewer') {
    const viewerActions = ['view', 'execute'];
    return viewerActions.includes(action);
  }

  return false;
}

export function generateInviteToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function isInviteTokenValid(user: User): boolean {
  if (!user.invite_token || !user.invite_expires) return false;
  return new Date(user.invite_expires) > new Date();
}

export function getUserByInviteToken(token: string): User | null {
  initializeTeamData();
  return teamUsers.find(u => u.invite_token === token && isInviteTokenValid(u)) || null;
}

export function activateUser(userId: string) {
  const user = getUser(userId);
  if (user) {
    user.status = 'active';
    user.invite_token = undefined;
    user.invite_expires = undefined;
    user.last_active = new Date().toISOString();
    saveUser(user);
  }
}