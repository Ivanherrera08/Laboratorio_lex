import Link from 'next/link';
import { ShieldCheck, Lock, Award, Building2, ArrowRight } from 'lucide-react';

export default function PortalPublicoPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Navbar Institucional */}
      <header className="border-b border-brand-accent/30 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white font-bold text-xl shadow-sm">
              Z
            </div>
            <div>
              <span className="font-heading font-bold text-xl text-brand-dark tracking-tight">Zone Control</span>
              <span className="block text-xs font-semibold text-brand-primary">Laboratorio XYZ • Farmacéutica</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-primary text-white font-medium text-sm hover:bg-brand-primary/90 transition-all shadow-sm"
            >
              <Lock className="w-4 h-4" />
              Acceso a Personal Interno
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-secondary text-brand-primary text-xs font-bold mb-6">
              <ShieldCheck className="w-4 h-4" />
              Infraestructura Farmacéutica de Alta Seguridad
            </div>
            <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-brand-dark leading-tight tracking-tight mb-6">
              Innovación y Rigor en la Producción de Medicamentos de Alto Costo
            </h1>
            <p className="text-base text-brand-text/80 leading-relaxed mb-8">
              En Laboratorio XYZ garantizamos la máxima calidad, pureza e integridad biológica en cada proceso. 
              El sistema <strong>Zone Control</strong> asegura la trazabilidad inmutable y el acceso biométrico 
              y físico restringido a nuestras salas estériles y áreas de síntesis molecular.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-primary text-white font-semibold text-sm hover:bg-brand-primary/90 transition-all shadow-md"
              >
                Ingresar al Sistema
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-brand-secondary border border-brand-accent/40 shadow-xs">
              <Award className="w-8 h-8 text-brand-primary mb-4" />
              <h3 className="font-heading font-bold text-lg text-brand-dark mb-2">Estándares GMP & FDA</h3>
              <p className="text-xs text-brand-text/80 leading-relaxed">
                Cumplimiento estricto con normativas internacionales de manufactura farmacéutica y registros 21 CFR Part 11.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-secondary border border-brand-accent/40 shadow-xs">
              <Building2 className="w-8 h-8 text-brand-primary mb-4" />
              <h3 className="font-heading font-bold text-lg text-brand-dark mb-2">Zonas Bioseguras</h3>
              <p className="text-xs text-brand-text/80 leading-relaxed">
                Control de esclusas, presión positiva y esclusas de aire con validación instantánea de credenciales.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-secondary border border-brand-accent/40 shadow-xs">
              <Lock className="w-8 h-8 text-brand-primary mb-4" />
              <h3 className="font-heading font-bold text-lg text-brand-dark mb-2">Trazabilidad Total</h3>
              <p className="text-xs text-brand-text/80 leading-relaxed">
                Registro inmutable en PostgreSQL de cada intento de acceso, garantizando auditoría al 100%.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-secondary border border-brand-accent/40 shadow-xs">
              <ShieldCheck className="w-8 h-8 text-brand-primary mb-4" />
              <h3 className="font-heading font-bold text-lg text-brand-dark mb-2">Alianza Internacional</h3>
              <p className="text-xs text-brand-text/80 leading-relaxed">
                Sincronización automatizada de reportes de actividad con socios estratégicos en el exterior.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-accent/30 bg-brand-secondary py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-text/70">
          <p>© 2026 Laboratorio XYZ S.A. Todos los derechos reservados. Zone Control v1.0.</p>
          <p>Contacto de Seguridad: seguridad@laboratorioxyz.com | Línea Directa: +57 (601) 555-0199</p>
        </div>
      </footer>
    </div>
  );
}
