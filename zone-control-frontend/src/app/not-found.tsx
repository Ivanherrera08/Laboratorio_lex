'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Por seguridad, cualquier URL inexistente o no autorizada es redirigida al portal principal
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-brand-secondary flex items-center justify-center text-brand-primary animate-pulse border border-brand-accent/40 shadow-xs">
        <span className="font-bold text-lg">Z</span>
      </div>
      <p className="text-xs font-bold text-brand-dark animate-pulse">
        Redirigiendo de forma segura al portal principal...
      </p>
    </div>
  );
}
