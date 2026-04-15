"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Account created successfully! Redirecting to sign in...');
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create account');
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
          <p className="text-neural-400 font-medium">Create your account</p>
        </div>

        {/* Sign Up Form */}
        <div className="card-premium">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                {success}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-forge !py-4 !px-6"
                placeholder="John Doe"
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-forge !py-4 !px-6"
                placeholder="john@company.com"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-forge !py-4 !px-6"
                placeholder="Minimum 6 characters"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-neural-400 uppercase tracking-[0.3em] pl-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input-forge !py-4 !px-6"
                placeholder="Confirm your password"
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
                  <span>Creating Account...</span>
                </span>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border dark:border-white/5 text-center">
            <p className="text-sm text-neural-400">
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-neon-500 hover:text-neon-400 font-bold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}