'use client';
import { Users, MessageSquare, School, Bell, Search } from 'lucide-react';

export default function TeacherDashboard() {
  // These matches your Supabase 'profiles' table exactly
  const allParents = [
    { name: "Aone Motse", school: "Gaborone International", student: "Tshepo Motse", status: "Active" },
    { name: "Lesedi Leepo", school: "Northside Primary", student: "Neo Leepo", status: "New" },
    { name: "Ford Sibanda", school: "Westwood International", student: "Lindiwe Sibanda", status: "Active" }
  ];

  // For the demo, we'll assume the logged-in teacher is Mr. Thabo Motsamai (Gaborone International)
  const currentSchool = "Gaborone International";
  const filteredParents = allParents.filter(p => p.school === currentSchool);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <School size={32} className="text-blue-300" />
            <div>
              <h1 className="text-xl font-bold">Teacher Console</h1>
              <p className="text-blue-300 text-sm">{currentSchool}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full">
            <span className="font-medium">Mr. Thabo Motsamai</span>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">TM</div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <Users className="text-blue-600 mb-2" size={28} />
            <p className="text-slate-500 text-sm font-medium">My Parents</p>
            <h2 className="text-3xl font-black text-slate-900">{filteredParents.length}</h2>
          </div>
          {/* ... other stats ... */}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Parent Directory</h2>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-50 border rounded-xl text-sm outline-none" />
            </div>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Parent Name</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParents.map((parent, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-900">{parent.name}</td>
                  <td className="px-6 py-4 text-slate-600">{parent.student}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      {parent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 font-bold hover:underline text-sm">Send Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}