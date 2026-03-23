'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { GraduationCap, ArrowLeft, Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'parent';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Top Header Section */}
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

        {/* Form Section */}
        <div className="p-8">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg mt-2">
              Sign In
            </button>
          </div>

          {/* Footer Section (The part you wanted) */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm mb-3">New to Puisano360?</p>
            <Link 
              href="/signup" 
              className="text-blue-600 font-bold hover:underline"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}