import Link from 'next/link';
import { GraduationCap, School, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] bg-slate-50 px-4">
      <GraduationCap className="text-blue-600 w-20 h-20 mb-6" />
      <h1 className="text-6xl font-black text-blue-900 mb-2">Puisano360</h1>
      <p className="text-xl text-slate-500 mb-10 italic">Connecting schools and parents</p>
      
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
        <Link href="/login?role=parent" className="flex-1 flex items-center justify-center gap-3 bg-blue-600 text-white p-6 rounded-3xl font-bold hover:bg-blue-700 transition shadow-xl">
          <Users size={24} /> Parent Portal
        </Link>
        
        <Link href="/login?role=teacher" className="flex-1 flex items-center justify-center gap-3 bg-white text-blue-900 border-2 border-blue-900 p-6 rounded-3xl font-bold hover:bg-slate-50 transition shadow-xl">
          <School size={24} /> Teacher Portal
        </Link>
      </div>
    </div>
  );
}