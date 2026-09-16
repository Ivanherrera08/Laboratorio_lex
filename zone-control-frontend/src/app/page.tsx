import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Award,
  Building2,
  ArrowRight,
  Microscope,
  FileCheck2,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Database,
  Layers,
  KeyRound
} from 'lucide-react';

export default function PortalPublicoPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-brand-primary selection:text-white">
      {/* 1. Header / Navbar Institucional */}
      <header className="border-b border-brand-accent/40 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-primary to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-brand-primary/20">
              Z
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl text-brand-dark tracking-tight">Zone Control</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wide">
                  v1.0 ACTIVO
                </span>
              </div>
              <span className="block text-xs font-semibold text-brand-primary">
                Laboratorio Farmacéutico XYZ • Sistema Central de Trazabilidad y Bioseguridad
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Plataforma Segura SSL/TLS</span>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold text-xs hover:bg-brand-primary/90 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <KeyRound className="w-4 h-4" />
              Acceso a Personal Autorizado
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section Principal */}
      <main className="flex-1">
        {/* Banner Hero */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Infraestructura Farmacéutica de Máxima Bioseguridad y Auditoría 21 CFR Part 11
              </div>

              <h1 className="text-4xl sm:text-5xl font-heading font-black text-brand-dark leading-[1.15] tracking-tight">
                Control de Acceso Físico y Trazabilidad en Tiempo Real
              </h1>

              <p className="text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
                Bienvenido al portal central de <strong>Zone Control — Laboratorio XYZ</strong>. Nuestra plataforma 
                gestiona la autenticación, la asignación de permisos por áreas de riesgo biológico (Clases A, B, C y D), 
                el control de esclusas de aire (airlocks) y el registro inmutable de accesos para la producción 
                de medicamentos de alto costo.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  Iniciar Sesión en el Sistema
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <a
                  href="#modulos-info"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all shadow-xs"
                >
                  Conocer Módulos y Normativas
                </a>
              </div>
            </div>

            {/* Tarjeta Institucional de Bioseguridad Farmacéutica */}
            <div className="lg:col-span-5 bg-white p-7 rounded-3xl border border-brand-accent/60 shadow-xl space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-brand-dark">Laboratorio Farmacéutico XYZ</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Complejo de Investigación y Producción Estéril</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-brand-dark mb-0.5">Control de Áreas Críticas</h4>
                    <p className="text-[11px] text-slate-500">
                      Acceso restringido únicamente a personal debidamente acreditado y capacitado en bioseguridad.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <Award className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-brand-dark mb-0.5">Estándares Internacionales GMP</h4>
                    <p className="text-[11px] text-slate-500">
                      Garantía de calidad e integridad en la síntesis de medicamentos y productos biológicos.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-brand-dark mb-0.5">Seguridad y Trazabilidad</h4>
                    <p className="text-[11px] text-slate-500">
                      Monitoreo permanente para preservar la esterilidad y el cumplimiento regulatorio.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <span className="text-[11px] font-semibold text-brand-primary">
                  Sede Central • Dirección de Calidad y Bioseguridad
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Módulos y Capacidades del Sistema */}
        <section id="modulos-info" className="bg-white border-y border-slate-200 py-16">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                Módulos Integrados en Zone Control
              </span>
              <h2 className="text-3xl font-heading font-extrabold text-brand-dark">
                Seguridad Integral para Laboratorios Farmacéuticos
              </h2>
              <p className="text-sm text-slate-600">
                El sistema proporciona una solución completa de extremo a extremo para la gestión de accesos y el cumplimiento regulatorio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3 hover:border-brand-primary/60 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Microscope className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-brand-dark">Gestión de Personal y Zonas</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Registro de colaboradores con asignación de laboratorios principales y matriz de áreas autorizadas (RF F-21).
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3 hover:border-brand-primary/60 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-brand-dark">Simulador de Esclusas RFID</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Emulador de hardware para validar tarjetas magnéticas, reglas de paso y detección de intrusiones en tiempo real.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3 hover:border-brand-primary/60 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-brand-dark">Auditoría 21 CFR Part 11</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Historial inmutable con triggers de base de datos que impiden la alteración o borrado de registros de acceso.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-3 hover:border-brand-primary/60 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-brand-dark">Socio Internacional Sync</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Exportación e intercambio seguro de logs con validación de hashes criptográficos para casas matrices en el exterior.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Estándares y Cumplimiento Normativo */}
        <section className="max-w-7xl mx-auto px-6 py-16 space-y-8">
          <div className="bg-gradient-to-r from-brand-dark to-slate-900 text-white rounded-3xl p-8 lg:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Certificaciones y Normativas
              </span>
              <h3 className="text-2xl lg:text-3xl font-heading font-black">
                Alineado a las Buenas Prácticas de Manufactura (GMP)
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Cumplimiento estricto con los requerimientos de la FDA, INVIMA y la Agencia Europea de Medicamentos (EMA) 
                en materia de integridad de datos electrónicos y seguridad perimetral.
              </p>
            </div>

            <div className="shrink-0 flex flex-col gap-3 w-full sm:w-auto">
              <Link
                href="/login"
                className="px-6 py-3.5 rounded-xl bg-brand-primary text-white font-bold text-xs text-center hover:bg-brand-primary/90 transition-all shadow-md"
              >
                Ingreso de Funcionarios
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 5. Footer Institucional */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Laboratorio Farmacéutico XYZ S.A. Todos los derechos reservados. Sistema Zone Control.</p>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">Línea de Bioseguridad:</span>
            <span>+57 (601) 555-0199</span>
            <span>•</span>
            <span>seguridad@laboratorioxyz.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
