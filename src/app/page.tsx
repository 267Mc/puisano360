import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <GraduationCap className="text-blue-600 w-20 h-20 mb-6" />
      <h1 className="text-6xl font-black text-blue-900 mb-2">Puisano360</h1>
      <p className="text-xl text-slate-500 mb-10 italic">Connecting schools and parents</p>
      
      <Link href="/parent" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg">
        Enter Parent Portal
      </Link>
    </div>
  );
}
