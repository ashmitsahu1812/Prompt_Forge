"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User {
  user_id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  created_at: string;
  last_active: string;
  status?: 'active' | 'pending' | 'inactive';
  invite_token?: string;
  invite_expires?: string;
}

interface Activity {
  activity_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  timestamp: string;
}

export default function Team() {
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'editor' as const });

  useEffect(() => {
    setMounted(true);
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const [usersRes, activitiesRes] = await Promise.all([
        fetch('/api/team/users'),
        fetch('/api/team/activities')
      ]);

      const usersData = await usersRes.json();
      const activitiesData = await activitiesRes.json();

      setUsers(usersData.data || []);
      setActivities(activitiesData.data || []);
    } catch (error) {
      console.error('Failed to fetch team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    try {
      const res = await fetch('/api/team/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const userData = await res.json();

      if (res.ok) {
        setUsers([...users, userData.data]);
        setShowInviteModal(false);
        setNewUser({ name: '', email: '', role: 'editor' });

        // Show success message
        if (userData.warning) {
          alert(`⚠️ ${userData.message}`);
        } else {
          alert(`✅ ${userData.message}`);
        }
      } else {
        alert(`❌ ${userData.error}`);
      }
    } catch (error) {
      console.error('Failed to invite user:', error);
      alert('❌ Failed to send invitation. Please try again.');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/team/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole as any } : u));
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'editor': return 'text-electric-500 bg-electric-500/10 border-electric-500/20';
      case 'viewer': return 'text-neural-500 bg-neural-500/10 border-neural-500/20';
      default: return 'text-neural-400 bg-neural-400/10 border-neural-400/20';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '✨';
      case 'updated': return '📝';
      case 'deleted': return '🗑️';
      case 'executed': return '⚡';
      case 'shared': return '🔗';
      default: return '📋';
    }
  };

  if (!mounted || loading) return (
    <div className="space-y-12 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="h-4 w-32 skeleton rounded-full" />
          <div className="h-16 w-80 skeleton rounded-2xl" />
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 h-96 skeleton rounded-2xl" />
        <div className="h-96 skeleton rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="space-y-20 lg:space-y-32 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-neon-500/10 border border-neon-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-neon-500 shadow-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-500"></span>
            </span>
            <span>Team Collaboration</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-[0.9] font-display">
            Team <span className="text-neon-500 text-glow">Management</span>
          </h1>
          <p className="text-xl lg:text-2xl text-neural-400 leading-relaxed font-medium max-w-2xl">
            Collaborate with your team on prompt engineering projects. Manage permissions, track activities, and share knowledge.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="btn-premium"
        >
          <span>Invite Team Member</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Team Members */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex items-end justify-between border-b border-border dark:border-white/5 pb-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tight font-display">Team Members</h2>
              <p className="text-sm text-neural-400 font-medium italic">Manage roles and permissions</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-foreground font-display">{users.length}</span>
              <div className="text-[10px] font-black text-neural-400 uppercase tracking-widest mt-1">Active Members</div>
            </div>
          </div>

          <div className="space-y-6">
            {users.map(user => (
              <div key={user.user_id} className="card-premium flex items-center justify-between group hover:border-neon-500/30">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-500 to-electric-500 flex items-center justify-center text-white font-black text-xl shadow-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-foreground group-hover:text-neon-500 transition-colors">{user.name}</h3>
                    <p className="text-sm text-neural-400 font-medium">{user.email}</p>
                    <p className="text-[10px] text-neural-500 uppercase tracking-widest">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-black uppercase tracking-widest transition-all ${getRoleColor(user.role)}`}
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>

                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${user.status === 'pending' ? 'bg-yellow-500' :
                      new Date(user.last_active) > new Date(Date.now() - 5 * 60 * 1000) ? 'bg-green-500' : 'bg-neural-400'
                      }`} />
                    <span className="text-[10px] text-neural-400 uppercase tracking-widest">
                      {user.status === 'pending' ? 'Pending Invitation' :
                        new Date(user.last_active) > new Date(Date.now() - 5 * 60 * 1000) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-12">
          <div className="flex items-end justify-between border-b border-border dark:border-white/5 pb-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground tracking-tight font-display">Recent Activity</h2>
              <p className="text-sm text-neural-400 font-medium italic">Team collaboration feed</p>
            </div>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
            {activities.map(activity => {
              const user = users.find(u => u.user_id === activity.user_id);
              return (
                <div key={activity.activity_id} className="p-6 bg-neural-50/50 dark:bg-neural-950/50 rounded-2xl border border-border dark:border-white/5 hover:border-neon-500/20 transition-all group">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-neon-500/10 flex items-center justify-center text-lg">
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-foreground">{user?.name || 'Unknown User'}</span>
                        <span className="text-neural-400">{activity.action}</span>
                        <span className="text-neon-500 font-bold">{activity.resource_type}</span>
                      </div>
                      <p className="text-sm text-neural-400 leading-relaxed">{activity.details}</p>
                      <p className="text-[10px] text-neural-500 uppercase tracking-widest">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-neural-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out_forwards]" onClick={() => setShowInviteModal(false)}>
          <div className="card-premium w-full max-w-xl shadow-2xl animate-[zoomIn_0.3s_ease-out_forwards]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-12">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tight font-display">Invite Member</h2>
                <p className="text-[10px] font-bold text-neural-400 uppercase tracking-[0.3em]">Add new team member</p>
              </div>
              <button onClick={() => setShowInviteModal(false)} className="p-2 text-neural-400 hover:text-foreground transition-colors hover:bg-neural-100 dark:hover:bg-white/5 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  className="input-forge !py-4 !px-6"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Email Address</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  className="input-forge !py-4 !px-6"
                  placeholder="e.g. john@company.com"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="input-forge !py-4 !px-6"
                >
                  <option value="viewer">Viewer - Can view and execute prompts</option>
                  <option value="editor">Editor - Can create and edit prompts</option>
                  <option value="admin">Admin - Full access to all features</option>
                </select>
              </div>

              <button type="submit" className="w-full btn-premium !py-5 shadow-2xl">
                <span>Send Invitation</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}