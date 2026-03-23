'use client';
import { useState } from 'react';
import { LayoutDashboard, FileUp, Users, LogOut, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function TeacherDashboard() {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    // Simulate upload delay for demo
    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-8">Puisano360</h2>
        <nav className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-blue-800 rounded-xl cursor-pointer">
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </div>
          <div className="flex items-center gap-3 p-3 hover:bg-blue-800 rounded-xl cursor-pointer transition">
            <Users size={20} /> <span>My Students</span>
          </div>
        </nav>
        <div className="absolute bottom-8">
          <Link href="/login" className="flex items-center gap-3 text-blue-300 hover:text-white transition">
            <LogOut size={20} /> <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Teacher Dashboard</h1>
            <p className="text-slate-500 font-medium">Gaborone International School | Mr. Thabo Motsamai</p>
          </div>
        </header>

        <div className="max-w-4xl bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xl font-bold text-slate-900">Upload Student Progress Report</h3>
            <p className="text-slate-500 text-sm">Select a student and upload their termly PDF report.</p>
          </div>

          <form onSubmit={handleUpload} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Select Student</label>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Tshepo Motse</option>
                  <option>Ama Mensah</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Term</label>
                <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Term 1 - 2026</option>
                  <option>Term 2 - 2026</option>
                </select>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-blue-400 transition cursor-pointer bg-slate-50">
              <FileUp className="mx-auto text-slate-400 mb-4" size={40} />
              <p className="text-slate-600 font-medium">Click to upload or drag and drop</p>
              <p className="text-slate-400 text-xs">PDF, PNG or JPG (max. 10MB)</p>
            </div>

            <button 
              type="submit" 
              disabled={uploading}
              className={`w-full py-4 rounded-xl font-bold text-white transition shadow-lg flex justify-center items-center gap-2 ${success ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {uploading ? 'Processing...' : success ? <><CheckCircle size={20}/> Report Uploaded</> : 'Submit Progress Report'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}