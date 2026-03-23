'use client';
import { Download, Video, Calendar, FileText, User } from 'lucide-react';
import Link from 'next/link';

export default function ParentDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h2 className="text-2xl font-black text-blue-600">Puisano360</h2>
          <div className="flex items-center gap-4 text-slate-600">
            <span className="font-medium hidden sm:block">Welcome, Aone Motse</span>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
              <User size={20} />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Parent Portal</h1>
          <p className="text-slate-500 font-medium">Student: Tshepo Motse | Gaborone International School</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Progress Reports Section */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">Latest Progress Reports</h3>
              </div>
              
              <div className="space-y-4">
                {[
                  { term: 'Term 1, 2026', date: 'March 15, 2026', grade: 'A-' },
                  { term: 'Term 3, 2025', date: 'Dec 05, 2025', grade: 'B+' }
                ].map((report, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition">
                    <div>
                      <p className="font-bold text-slate-900">{report.term}</p>
                      <p className="text-slate-500 text-xs">Released on {report.date}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-lg font-black text-blue-600">{report.grade}</span>
                      <button className="flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-lg border shadow-sm hover:bg-slate-50 transition text-sm font-bold">
                        <Download size={16} /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* PTA / Virtual Meetings Section */}
          <div className="space-y-6">
            <section className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-xl text-white">
              <div className="flex items-center gap-3 mb-6">
                <Video className="text-blue-200" />
                <h3 className="text-xl font-bold">Virtual PTA Meeting</h3>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 mb-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar size={16} />
                  <span className="text-sm font-medium">Today @ 18:00 CAT</span>
                </div>
                <p className="text-sm opacity-90">Agenda: Term 1 performance review and sports day planning.</p>
              </div>
              <button className="w-full bg-white text-blue-700 py-4 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg flex justify-center items-center gap-2">
                <Video size={18} /> Join Meeting Now
              </button>
            </section>

            <section className="bg-white p-6 rounded-3xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2 text-sm">Teacher's Note</h4>
              <p className="text-slate-500 text-xs italic leading-relaxed">
                "Tshepo is excelling in Mathematics but needs more focus in Creative Arts. Great improvement overall!" - Mr. Motsamai
              </p>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}