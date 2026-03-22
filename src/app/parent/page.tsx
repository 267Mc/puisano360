'use client';
import Link from 'next/link';
import { UserCog, FileText, Video, Bell } from 'lucide-react';

export default function ParentDashboard() {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Welcome to Puisano360</h1>
        <p className="text-slate-500 italic">Connecting schools and parents</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        
        {/* THE UPDATE LINK */}
        <Link href="/parent/profile" className="group p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-500 hover:shadow-md transition-all">
          <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
            <UserCog className="text-blue-600 group-hover:text-white" size={24} />
          </div>
          <h3 className="font-bold text-slate-800">Update Profile</h3>
          <p className="text-xs text-slate-500 mt-1">Change your contact details and phone number.</p>
        </Link>

        <Link href="/meeting" className="group p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-500 hover:shadow-md transition-all">
          <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
            <Video className="text-indigo-600 group-hover:text-white" size={24} />
          </div>
          <h3 className="font-bold text-slate-800">Virtual Meeting</h3>
          <p className="text-xs text-slate-500 mt-1">Join the live 360 conversation with teachers.</p>
        </Link>

        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-green-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <FileText className="text-green-600" size={24} />
          </div>
          <h3 className="font-bold text-slate-800">Latest Reports</h3>
          <p className="text-xs text-slate-500 mt-1">View academic progress for Term 1.</p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 opacity-60">
          <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Bell className="text-orange-600" size={24} />
          </div>
          <h3 className="font-bold text-slate-800">School News</h3>
          <p className="text-xs text-slate-500 mt-1">Upcoming events at BAC (Coming soon).</p>
        </div>
      </div>

      {/* Placeholder for Data Lists */}
      <div className="bg-blue-900 rounded-3xl p-8 text-white shadow-xl">
        <h2 className="text-xl font-bold mb-2">Notice Board</h2>
        <p className="text-blue-200 text-sm">Please ensure your contact details are up to date in the Profile section to receive SMS notifications.</p>
      </div>
    </div>
  );
}
