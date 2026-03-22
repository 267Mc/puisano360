import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-5xl font-extrabold text-blue-900 mb-4">Puisano360</h1>
      <p className="text-xl text-slate-600 mb-8 font-medium italic">Connecting schools and parents</p>
      <div className="flex gap-4">
        <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
          Login to Portal
        </Link>
      </div>
    </div>
  );
}
