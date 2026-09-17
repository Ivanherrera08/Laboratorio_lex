import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Zone Control — Laboratorio XYZ',
  description: 'Sistema Integral de Control de Acceso Físico y Trazabilidad Farmacéutica',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-brand-bg text-brand-text antialiased">
        <AuthProvider>
          <NotificationProvider>
            {children}
            <Toaster position="bottom-right" richColors theme="light" />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
