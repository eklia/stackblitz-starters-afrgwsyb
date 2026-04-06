'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Lang } from '@/lib/types';

type PageProps = {
  params: {
    lang: Lang;
  };
};

export default function TestSupabasePage({ params }: PageProps) {
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('session_availability')
        .select('*')
        .limit(5);

      if (error) {
        setError(error.message);
        console.error('Supabase error:', error);
      } else {
        setData(data || []);
        console.log('Supabase success:', data);
      }

      setLoading(false);
    };

    testConnection();
  }, []);

  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="mb-4 text-2xl font-bold">
        Supabase Test Page ({params.lang})
      </h1>

      {loading && <p>Loading...</p>}

      {!loading && error && (
        <div className="rounded-lg bg-red-100 p-4 text-red-700">
          ❌ Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div>
          <p className="mb-4 text-green-700">✅ Supabase connected successfully</p>
          <pre className="overflow-auto rounded-lg bg-slate-100 p-4 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}