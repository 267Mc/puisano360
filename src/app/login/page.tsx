'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'user'; // Gets 'teacher' or 'parent'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <Link href="/" className="text-slate-400 hover:text-blue-600 flex items-center gap-2 mb-6 text-sm transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="flex flex-col items-center mb-8">
          <GraduationCap className="text-blue-600 w-12 h-12 mb-2" />
          <h1 className="text-2xl font-bold text-blue-900 capitalize">{role} Login</h1>
          <p className="text-sm text-slate-500 italic">Puisano360 Portal</p>
        </div>
        
        <div className="space-y-4">
          <input type="email" placeholder="Email Address" className="w-full p-4 border rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input type="password" placeholder="Password" className="w-full p-4 border rounded-2xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" />
          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg">
            Sign In
          </button>
        </div>

        <div className="mt-8 text-center border-t pt-6">
          <p className="text-slate-500 mb-4 text-sm">New to the {role} portal?</p>
          <Link href="/signup" className="inline-block w-full border-2 border-blue-600 text-blue-600 py-3 rounded-2xl font-bold hover:bg-blue-50 transition">
            Create {role} Account
          </Link>
        </div>
      </div>
    </div>
  );
}