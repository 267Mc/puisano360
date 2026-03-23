'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function SignUpPage() {
  const schools = ["Gaborone International School", "Westwood International", "Northside Primary"];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-lg">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">Create Account</h2>
        
        <div className="space-y-4">
          <select className="w-full p-4 border rounded-2xl bg-slate-50">
            <option>Select Your School</option>
            {schools.map(school => <option key={school}>{school}</option>)}
          </select>
          
          <input type="text" placeholder="Full Name" className="w-full p-4 border rounded-2xl" />
          <input type="email" placeholder="Email Address" className="w-full p-4 border rounded-2xl" />
          <input type="password" placeholder="Create Password" className="w-full p-4 border rounded-2xl" />
          
          <button className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition">
            Register for Puisano360
          </button>
        </div>
        
        <p className="text-center mt-6 text-slate-600">
          Already have an account? <Link href="/login" className="text-blue-600 font-bold underline">Login</Link>
        </p>
      </div>
    </div>
  );
}