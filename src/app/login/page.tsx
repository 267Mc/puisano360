'use client';

import { useState, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, Mail, Lock } from 'lucide-react';

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Detect if the user is a parent or teacher from the URL
  const role = searchParams.get('role') || 'parent';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(`Login Error: ${error.message}`);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Redirect specifically based on the role in the URL
        if (role === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/parent');
        }
      }
    } catch (err) {
      alert("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
      {/* Visual Header */}
      <div className="bg-blue-600 p-8 text-white text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 text-sm transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="flex justify-center mb-2">
          <GraduationCap size={48} />
        </div>
        <h1 className="text-2xl font-bold capitalize">{role} Portal</h1>
        <p className="text-blue-100 text-sm">Welcome back to Puisano360</p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleLogin} className="p-8 space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
          <input 
            type="email" 
            placeholder="Email Address" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>
        
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
          <input 
            type="password" 
            placeholder="Password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg mt-2 disabled:bg-slate-400"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm mb-3">New to Puisano360?</p>
          <Link 
            href="/signup" 
            className="text-blue-600 font-bold hover:underline"
          >
            Create New Account
          </Link>
        </div>
      </form>
    </div>
  );
}

// Main Page Component with Suspense Boundary
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white font-bold">Loading Portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}