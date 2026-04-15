"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-950 via-neural-900 to-neural-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-2 font-display">
            Prompt <span className="text-neon-500">Forge</span>
          </h1>
          <p className="text-neural-400 font-medium">Sign in to your account</p>
        </div>

        {/* Sign In Form */}
        <div className="card-premium">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-forge !py-4 !px-6"
                placeholder="admin@promptforge.dev"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-forge !py-4 !px-6"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-premium !py-5 shadow-2xl disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border dark:border-white/5 text-center">
            <p className="text-sm text-neural-400">
              Don't have an account?{' '}
              <Link href="/register" className="text-neon-500 hover:text-neon-400 font-bold">
                Sign up
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-neon-500/5 border border-neon-500/20 rounded-xl">
            <h3 className="text-sm font-bold text-neon-500 mb-2">Demo Credentials</h3>
            <div className="text-xs text-neural-400 space-y-1">
              <p><strong>Email:</strong> admin@promptforge.dev</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}