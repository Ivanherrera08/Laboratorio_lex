import SimuladorAccesoPage from '@/components/SimuladorAcceso';
import { Fingerprint, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AccesoPublico() {
  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center overflow-hidden selection:bg-emerald-500 selection:text-white p-4">
      
      {/* Background Effects matching RootClient */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-200/40 mix-blend-multiply filter blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-200/40 mix-blend-multiply filter blur-[100px]" />
        {/* Subtle dot pattern */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }} />
      </div>

      <div className="absolute bottom-8 left-8 z-50">
        <Link href="/">
          <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 hover:text-emerald-700 hover:border-emerald-300 shadow-sm transition-all cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            Volver al Inicio
          </div>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-8 text-center space-y-4">
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10 relative">
              <Fingerprint className="w-7 h-7" />
              <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 animate-ping opacity-20" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">
            Punto de Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Biométrico</span>
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-sm md:text-base font-medium">
            Terminal de validación encriptada para áreas de alta contención biológica.
            Escanee su credencial para verificar privilegios de acceso.
          </p>
        </div>

        {/* The Simulator */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden transform transition-all relative z-20">
          <SimuladorAccesoPage />
        </div>
      </div>
    </div>
  );
}
