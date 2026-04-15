import fs from 'fs';
import path from 'path';
import { DATA_DIR } from './data';

export type UserRole = 'admin' | 'editor' | 'viewer';

export type User = {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  created_at: string;
  last_active: string;
};

export type Team = {
  team_id: string;
  name: string;
  description: string;
  members: User[];
  created_at: string;
  settings: {
    allow_public_prompts: boolean;
    require_approval: boolean;
    default_role: UserRole;
  };
};

export type Activity = {
  activity_id: string;
  user_id: string;
  action: 'created' | 'updated' | 'deleted' | 'executed' | 'shared';
  resource_type: 'prompt' | 'test_suite' | 'template' | 'execution';
  resource_id: string;
  details: string;
  timestamp: string;
};

export function getTeamDataPath() {
  return path.join(DATA_DIR, 'team');
}

export function getUsersPath() {
  return path.join(getTeamDataPath(), 'users.json');
}

export function getActivitiesPath() {
  return path.join(getTeamDataPath(), 'activities.json');
}

export function getTeamSettingsPath() {
  return path.join(getTeamDataPath(), 'settings.json');
}

export function initializeTeamData() {
  const teamDir = getTeamDataPath();
  if (!fs.existsSync(teamDir)) {
    fs.mkdirSync(teamDir, { recursive: true });
  }

  // Initialize users file
  const usersPath = getUsersPath();
  if (!fs.existsSync(usersPath)) {
    const defaultUsers: User[] = [
      {
        user_id: 'admin_001',
        name: 'Admin User',
        email: 'admin@promptforge.dev',
        role: 'admin',
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      }
    ];
    fs.writeFileSync(usersPath, JSON.stringify(defaultUsers, null, 2));
  }

  // Initialize activities file
  const activitiesPath = getActivitiesPath();
  if (!fs.existsSync(activitiesPath)) {
    fs.writeFileSync(activitiesPath, JSON.stringify([], null, 2));
  }

  // Initialize team settings
  const settingsPath = getTeamSettingsPath();
  if (!fs.existsSync(settingsPath)) {
    const defaultSettings = {
      team_name: 'Prompt Forge Team',
      allow_public_prompts: true,
      require_approval: false,
      default_role: 'editor' as UserRole,
      created_at: new Date().toISOString()
    };
    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
  }
}

export function getAllUsers(): User[] {
  initializeTeamData();
  const usersPath = getUsersPath();
  const content = fs.readFileSync(usersPath, 'utf8');
  return JSON.parse(content);
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

  const usersPath = getUsersPath();
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
}

export function deleteUser(userId: string) {
  const users = getAllUsers();
  const filteredUsers = users.filter(u => u.user_id !== userId);

  const usersPath = getUsersPath();
  fs.writeFileSync(usersPath, JSON.stringify(filteredUsers, null, 2));
}

export function getAllActivities(limit: number = 50): Activity[] {
  initializeTeamData();
  const activitiesPath = getActivitiesPath();
  const content = fs.readFileSync(activitiesPath, 'utf8');
  const activities = JSON.parse(content);

  // Sort by timestamp (newest first) and limit
  return activities
    .sort((a: Activity, b: Activity) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function logActivity(activity: Omit<Activity, 'activity_id' | 'timestamp'>) {
  initializeTeamData();
  const activitiesPath = getActivitiesPath();
  const activities = getAllActivities(1000); // Keep last 1000 activities

  const newActivity: Activity = {
    ...activity,
    activity_id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };

  activities.unshift(newActivity);

  // Keep only last 1000 activities
  const limitedActivities = activities.slice(0, 1000);

  fs.writeFileSync(activitiesPath, JSON.stringify(limitedActivities, null, 2));
}

export function getTeamSettings() {
  initializeTeamData();
  const settingsPath = getTeamSettingsPath();
  const content = fs.readFileSync(settingsPath, 'utf8');
  return JSON.parse(content);
}

export function updateTeamSettings(settings: any) {
  initializeTeamData();
  const settingsPath = getTeamSettingsPath();
  const currentSettings = getTeamSettings();
  const updatedSettings = { ...currentSettings, ...settings };
  fs.writeFileSync(settingsPath, JSON.stringify(updatedSettings, null, 2));
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