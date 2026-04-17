// In-memory team management for Vercel compatibility

export type UserRole = 'admin' | 'editor' | 'viewer';

export type User = {
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  created_at: string;
  last_active: string;
  status?: 'active' | 'pending' | 'inactive';
  invite_token?: string;
  invite_expires?: string;
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

// In-memory storage
let teamUsers: User[] = [];
let activities: Activity[] = [];
let teamSettings = {
  team_name: 'Prompt Forge Team',
  allow_public_prompts: true,
  require_approval: false,
  default_role: 'editor' as UserRole,
  created_at: new Date().toISOString()
};

// Initialize with default data
function initializeTeamData() {
  if (teamUsers.length === 0) {
    teamUsers = [
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
  }
}

export function getAllUsers(): User[] {
  initializeTeamData();
  return teamUsers;
}

export function getUser(userId: string): User | null {
  initializeTeamData();
  return teamUsers.find(u => u.user_id === userId) || null;
}

export function saveUser(user: User) {
  initializeTeamData();
  const existingIndex = teamUsers.findIndex(u => u.user_id === user.user_id);

  if (existingIndex >= 0) {
    teamUsers[existingIndex] = user;
  } else {
    teamUsers.push(user);
  }
}

export function deleteUser(userId: string) {
  initializeTeamData();
  teamUsers = teamUsers.filter(u => u.user_id !== userId);
}

export function getAllActivities(limit: number = 50): Activity[] {
  // Sort by timestamp (newest first) and limit
  return activities
    .sort((a: Activity, b: Activity) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function logActivity(activity: Omit<Activity, 'activity_id' | 'timestamp'>) {
  const newActivity: Activity = {
    ...activity,
    activity_id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };

  activities.unshift(newActivity);

  // Keep only last 1000 activities
  if (activities.length > 1000) {
    activities = activities.slice(0, 1000);
  }
}

export function getTeamSettings() {
  return teamSettings;
}

export function updateTeamSettings(settings: any) {
  teamSettings = { ...teamSettings, ...settings };
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