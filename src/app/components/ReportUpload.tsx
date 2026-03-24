'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClients';
import { UploadCloud, CheckCircle } from 'lucide-react';

export default function ReportUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    setStatus('Uploading...');
    
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('school-reports')
      .upload(fileName, file);

    if (uploadError) setStatus('Error uploading');
    else setStatus('Report Shared Successfully!');
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-blue-100">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <UploadCloud className="text-blue-600" /> Upload Student Report
      </h3>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-4 block w-full text-sm" />
      <button onClick={handleUpload} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">
        {status || 'Confirm Upload'}
      </button>
    </div>
  );
}
