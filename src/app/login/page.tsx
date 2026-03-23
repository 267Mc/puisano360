'use client';
import Link from 'next/link'; // <--- Check if this line is there!
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

// ... (previous imports)
export default function LoginPage() {
  return (
    // ... (previous login UI)
    <div className="mt-8 text-center border-t pt-6">
      <p className="text-slate-500 mb-4 text-sm">New to Puisano360?</p>
      <Link href="/signup" className="inline-block w-full border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition">
        Create New Account
      </Link>
    </div>
  );
}