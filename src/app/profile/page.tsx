"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function Profile() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || ''
      }));
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Mock API call - in real implementation, this would update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage('Profile updated successfully!');

      // Update session if name changed
      if (formData.name !== session?.user?.name) {
        await update({ name: formData.name });
      }
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage('Password changed successfully!');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setMessage('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-20 lg:space-y-32 fade-in">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-12 pb-12 border-b border-border dark:border-white/5">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-3 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-purple-500 shadow-glow">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span>User Account</span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-foreground tracking-tighter leading-[0.9] font-display">
            Profile <span className="text-purple-500 text-glow">Settings</span>
          </h1>
          <p className="text-xl lg:text-2xl text-neural-400 leading-relaxed font-medium max-w-2xl">
            Manage your account information, security settings, and personal preferences.
          </p>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-xl border ${message.includes('successfully')
          ? 'bg-green-500/10 border-green-500/20 text-green-400'
          : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Profile Information */}
        <div className="space-y-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tight font-display">Profile Information</h2>
            <p className="text-sm text-neural-400 font-medium italic">Update your personal details</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="input-forge !py-4 !px-6"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="input-forge !py-4 !px-6"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">
                Role
              </label>
              <div className="px-6 py-4 bg-neural-50/50 dark:bg-neural-950/50 rounded-2xl border border-border dark:border-white/5">
                <span className="text-purple-500 font-bold capitalize">{session?.user?.role || 'Member'}</span>
                <p className="text-xs text-neural-500 mt-1">Contact an admin to change your role</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-premium !py-5 shadow-2xl disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating...</span>
                </span>
              ) : (
                <span>Update Profile</span>
              )}
            </button>
          </form>
        </div>

        {/* Security Settings */}
        <div className="space-y-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tight font-display">Security Settings</h2>
            <p className="text-sm text-neural-400 font-medium italic">Change your password and security options</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">
                Current Password
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                className="input-forge !py-4 !px-6"
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                className="input-forge !py-4 !px-6"
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input-forge !py-4 !px-6"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.currentPassword || !formData.newPassword}
              className="w-full btn-premium !py-5 shadow-2xl disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Changing...</span>
                </span>
              ) : (
                <span>Change Password</span>
              )}
            </button>
          </form>

          {/* Account Stats */}
          <div className="card-premium">
            <h3 className="text-xl font-black text-foreground mb-6">Account Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-neural-500">Member Since</span>
                <span className="font-bold text-foreground">
                  {session?.user ? new Date().toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neural-500">Prompts Created</span>
                <span className="font-bold text-foreground">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neural-500">Executions Run</span>
                <span className="font-bold text-foreground">156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neural-500">Last Login</span>
                <span className="font-bold text-foreground">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}