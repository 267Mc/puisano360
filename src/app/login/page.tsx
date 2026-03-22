'use client';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-slate-50">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <GraduationCap className="text-blue-600 w-12 h-12 mb-2" />
          <h1 className="text-2xl font-bold text-blue-900">Puisano360</h1>
          <p className="text-sm text-slate-500 italic">Connecting schools and parents</p>
        </div>
        
        <div className="space-y-4">
          <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-xl" />
          <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl" />
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
            Sign In to Portal
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">
          Authorized PTA Access Only
        </p>
      </div>
    </div>
  );
}
