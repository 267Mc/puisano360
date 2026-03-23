'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, User, Mail, Lock, School } from 'lucide-react';

// Initialize Supabase client
// Make sure these match your .env.local file exactly
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('Gaborone International School');
  const [role, setRole] = useState('parent');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Sign up the user in Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          school_name: school,
          role: role,
        }
      }
    });

    if (authError) {
      alert(`Signup Error: ${authError.message}`);
      setLoading(false);
      return;
    }

    if (data.user) {
      alert("Registration successful! Please check your email for a confirmation link.");
      router.push('/login');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-blue-600 p-8 text-white text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4 text-sm transition">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="flex justify-center mb-2">
            <GraduationCap size={48} />
          </div>
          <h1 className="text-2xl font-bold">Join Puisano360</h1>
          <p className="text-blue-100 text-sm">Create your account to get started</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSignup} className="p-8 space-y-4">
          
          {/* Role Selection */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-2">
            <button
              type="button"
              onClick={() => setRole('parent')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${role === 'parent' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              Parent
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${role === 'teacher' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              Teacher
            </button>
          </div>

          {/* School Selection */}
          <div className="relative">
            <School className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <select 
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-slate-900"
            >
              <option>Gaborone International School</option>
              <option>Westwood International</option>
              <option>Northside Primary</option>
            </select>
          </div>

          <div className="relative">
            <User className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Full Name (e.g. Mr Thabo Motsamai)" 
              required 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            />
          </div>

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
              placeholder="Create Password" 
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
            {loading ? 'Creating Account...' : 'Register for Puisano360'}
          </button>

          <div className="text-center pt-4">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-bold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}