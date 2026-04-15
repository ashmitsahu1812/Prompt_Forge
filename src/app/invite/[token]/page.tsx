"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function InviteAcceptance({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    validateInvitation();
  }, [token]);

  const validateInvitation = async () => {
    try {
      const res = await fetch(`/api/invite/${token}`);
      const data = await res.json();

      if (res.ok) {
        setUser(data.data);
      } else {
        setError(data.error || 'Invalid or expired invitation');
      }
    } catch (err) {
      setError('Failed to validate invitation');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    setAccepting(true);
    try {
      const res = await fetch(`/api/invite/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (res.ok) {
        setAccepted(true);
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setError(data.error || 'Failed to accept invitation');
      }
    } catch (err) {
      setError('Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (!mounted || loading) return (
    <div className="min-h-screen bg-neural-950 flex items-center justify-center p-6">
      <div className="card-premium w-full max-w-md text-center">
        <div className="w-16 h-16 border-4 border-electric-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-black text-foreground mb-2">Validating Invitation</h2>
        <p className="text-neural-400">Please wait while we verify your invitation...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-neural-950 flex items-center justify-center p-6">
      <div className="card-premium w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-foreground mb-2">Invalid Invitation</h2>
        <p className="text-neural-400 mb-6">{error}</p>
        <Link href="/" className="btn-premium">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );

  if (accepted) return (
    <div className="min-h-screen bg-neural-950 flex items-center justify-center p-6">
      <div className="card-premium w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-black text-foreground mb-2">Welcome to the Team! 🎉</h2>
        <p className="text-neural-400 mb-6">Your invitation has been accepted successfully. Redirecting to dashboard...</p>
        <div className="w-8 h-8 border-2 border-electric-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neural-950 flex items-center justify-center p-6">
      <div className="card-premium w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-electric-500 to-neon-500 flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-2xl">
            PF
          </div>
          <h1 className="text-3xl font-black text-foreground mb-2 font-display">You're Invited!</h1>
          <p className="text-neural-400">Join the Prompt Forge team and start collaborating on AI projects.</p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-neural-50/50 dark:bg-neural-950/50 rounded-2xl border border-border dark:border-white/5">
            <h3 className="text-lg font-black text-foreground mb-4">Invitation Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neural-400">Name:</span>
                <span className="font-bold text-foreground">{user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neural-400">Email:</span>
                <span className="font-bold text-foreground">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neural-400">Role:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${user?.role === 'admin' ? 'text-red-500 bg-red-500/10' :
                    user?.role === 'editor' ? 'text-electric-500 bg-electric-500/10' :
                      'text-neural-500 bg-neural-500/10'
                  }`}>
                  {user?.role}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neural-400">Expires:</span>
                <span className="font-bold text-foreground">
                  {user?.invite_expires ? new Date(user.invite_expires).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-electric-500/5 border border-electric-500/20 rounded-2xl">
            <h4 className="text-sm font-black text-electric-500 mb-3 uppercase tracking-widest">What you can do as a {user?.role}:</h4>
            <ul className="text-sm text-neural-400 space-y-2">
              {user?.role === 'admin' && (
                <>
                  <li>• Full access to all features</li>
                  <li>• Manage team members and permissions</li>
                  <li>• Configure system settings</li>
                  <li>• Access all prompts and data</li>
                </>
              )}
              {user?.role === 'editor' && (
                <>
                  <li>• Create and edit prompts</li>
                  <li>• Run prompt executions</li>
                  <li>• Access analytics and results</li>
                  <li>• Collaborate on team projects</li>
                </>
              )}
              {user?.role === 'viewer' && (
                <>
                  <li>• View prompts and results</li>
                  <li>• Run prompt executions</li>
                  <li>• Access basic analytics</li>
                  <li>• Participate in team discussions</li>
                </>
              )}
            </ul>
          </div>

          <button
            onClick={acceptInvitation}
            disabled={accepting}
            className="w-full btn-premium !py-5 shadow-2xl"
          >
            {accepting ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Accepting Invitation...</span>
              </div>
            ) : (
              <>
                <span>Accept Invitation & Join Team</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>

          <div className="text-center">
            <p className="text-xs text-neural-500">
              By accepting this invitation, you agree to collaborate respectfully and follow team guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}