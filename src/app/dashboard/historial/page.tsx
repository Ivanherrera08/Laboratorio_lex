'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HistorialAcceso } from '@/types';
import {
  FileText,
  Search,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCw,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  obtenerHistorialCombinado,
  limpiarHistorialLocal,
  getHistorialLocal,
} from '@/lib/historialStore';

export default function HistorialAccesosPage() {
  const [historial, setHistorial] = useState<HistorialAcceso[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroResultado, setFiltroResultado] = useState('TODOS');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const cargarDatos = useCallback(async (mostrarToast = false) => {
    try {
      setLoading(true);
      const datos = await obtenerHistorialCombinado();
      setHistorial(datos);
      if (mostrarToast) toast.success('Historial actualizado desde el servidor');
    } catch {
      setHistorial(getHistorialLocal());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();

    const handleUpdate = () => {
      cargarDatos();
    };

    window.addEventListener('historial-updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('historial-updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [cargarDatos]);

  const filtrados = historial.filter((item) => {
    const texto = busqueda.trim().toLowerCase();
    const coincideTexto =
      !texto ||
      (item.numeroDocumentoIngresado && item.numeroDocumentoIngresado.toLowerCase().includes(texto)) ||
      (item.codigoTarjetaIngresado && item.codigoTarjetaIngresado.toLowerCase().includes(texto)) ||
      (item.empleadoNombreCompleto && item.empleadoNombreCompleto.toLowerCase().includes(texto)) ||
      (item.areaNombre && item.areaNombre.toLowerCase().includes(texto));

    const coincideEstado = filtroResultado === 'TODOS' || item.resultadoAcceso === filtroResultado;

    let coincideFechas = true;
    if (item.timestamp) {
      const fechaItem = new Date(item.timestamp);
      if (fechaInicio) {
        coincideFechas = coincideFechas && fechaItem >= new Date(`${fechaInicio}T00:00:00`);
      }
      if (fechaFin) {
        coincideFechas = coincideFechas && fechaItem <= new Date(`${fechaFin}T23:59:59`);
      }
    }

    return coincideTexto && coincideEstado && coincideFechas;
  });

  const exportarCSV = () => {
    if (filtrados.length === 0) {
      toast.error('No hay registros en el filtro actual para exportar.');
      return;
    }

    let csv = 'ID_UNICO,TIMESTAMP_UTC,DOCUMENTO,CODIGO_RFID,PERSONA,AREA,RESULTADO,MOTIVO_DETALLE\n';
    filtrados.forEach((row) => {
      csv += `"${row.id}","${row.timestamp}","${row.numeroDocumentoIngresado || ''}","${row.codigoTarjetaIngresado || ''}","${row.empleadoNombreCompleto || 'NO REGISTRADO'}","${row.areaNombre || ''}","${row.resultadoAcceso}","${(row.motivoDenegacion || 'Acceso correcto verificado').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bitacora_accesos_zone_control_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Archivo CSV exportado exitosamente.');
  };

  const exportarPDF = () => {
    if (filtrados.length === 0) {
      toast.error('No hay registros para generar el reporte.');
      return;
    }
    window.print();
  };

  const handleLimpiar = () => {
    if (window.confirm('¿Deseas reiniciar la bitácora local? Los registros de la base de datos persistirán en el servidor.')) {
      limpiarHistorialLocal();
      setHistorial([]);
      toast.success('Bitácora local restablecida.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-brand-dark flex items-center gap-2">
            Historial Inmutable de Accesos
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary font-bold">
              {filtrados.length} {filtrados.length === 1 ? 'registro' : 'registros'}
            </span>
          </h1>
          <p className="text-xs text-brand-text/70 mt-1">
            Auditoría continua de todos los intentos de acceso registrados en torniquetes, lectores biométricos y simulador.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => cargarDatos(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-brand-accent/60 text-brand-dark text-xs font-semibold hover:bg-brand-secondary/40 shadow-xs transition-colors"
            title="Sincronizar con servidor"
          >
            <RotateCw className={`w-3.5 h-3.5 text-brand-primary ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
          <button
            onClick={handleLimpiar}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50 shadow-xs transition-colors"
            title="Limpiar registros locales"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            Limpiar Local
          </button>
          <button
            onClick={exportarCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-brand-accent/60 text-brand-dark text-xs font-semibold hover:bg-brand-secondary/40 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-brand-primary" />
            Exportar CSV
          </button>
          <button
            onClick={exportarPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary/90 shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Título solo para impresión */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-xl font-bold">Zone Control — Reporte Oficial de Auditoría y Bitácoras de Acceso</h1>
        <p className="text-xs text-gray-600">Generado el: {new Date().toLocaleString()} | Cumplimiento FDA 21 CFR Part 11</p>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-brand-accent/40 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-center print:hidden">
        <div className="sm:col-span-4 relative">
          <Search className="w-4 h-4 text-brand-text/50 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por documento, carnet, nombre o área..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-brand-accent/60 text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={filtroResultado}
            onChange={(e) => setFiltroResultado(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-brand-accent/60 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/40 font-semibold"
          >
            <option value="TODOS">Todos los Resultados</option>
            <option value="AUTORIZADO">Solo AUTORIZADOS</option>
            <option value="DENEGADO">Solo DENEGADOS</option>
            <option value="NO_REGISTRADO">Solo NO REGISTRADOS</option>
          </select>
        </div>

        <div className="sm:col-span-5 flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-brand-text/70">
            <Calendar className="w-3.5 h-3.5 text-brand-primary" />
            <span>Rango:</span>
          </div>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full px-2 py-1.5 rounded-xl border border-brand-accent/60 text-xs"
          />
          <span className="text-xs text-gray-400">-</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full px-2 py-1.5 rounded-xl border border-brand-accent/60 text-xs"
          />
        </div>
      </div>

      {/* Tabla de Historial */}
      <div className="bg-white rounded-2xl border border-brand-accent/40 shadow-xs overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-brand-secondary/60 flex items-center justify-center mb-3 text-brand-primary">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-brand-dark text-sm">No hay registros que coincidan</h3>
            <p className="text-xs text-brand-text/70 max-w-sm mt-1">
              No se han encontrado registros con los filtros actuales. Puedes ir al <strong>Simulador de Acceso</strong> para escanear documentos o carnets y generar eventos en tiempo real.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-secondary/70 border-b border-brand-accent/30 text-brand-dark font-bold">
                <tr>
                  <th className="p-4">Timestamp (UTC / Local)</th>
                  <th className="p-4">Credencial / Identificador</th>
                  <th className="p-4">Persona Asociada</th>
                  <th className="p-4">Área Restringida</th>
                  <th className="p-4">Resultado</th>
                  <th className="p-4">Detalle / Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-accent/20">
                {filtrados.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-light/60 transition-colors">
                    <td className="p-4 font-mono text-[11px] text-brand-text/80 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-mono font-bold text-brand-dark">{item.numeroDocumentoIngresado || '—'}</p>
                      {item.codigoTarjetaIngresado && (
                        <span className="text-[10px] text-brand-primary font-mono block">
                          {item.codigoTarjetaIngresado}
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-brand-dark">
                      {item.empleadoNombreCompleto || (
                        <span className="text-gray-400 italic">No empadronado</span>
                      )}
                    </td>
                    <td className="p-4 text-brand-text font-medium">{item.areaNombre}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          item.resultadoAcceso === 'AUTORIZADO'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.resultadoAcceso === 'DENEGADO'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.resultadoAcceso === 'AUTORIZADO' && <CheckCircle className="w-3 h-3" />}
                        {item.resultadoAcceso === 'DENEGADO' && <XCircle className="w-3 h-3" />}
                        {item.resultadoAcceso === 'NO_REGISTRADO' && <AlertCircle className="w-3 h-3" />}
                        {item.resultadoAcceso}
                      </span>
                    </td>
                    <td className="p-4 text-brand-text/70 text-[11px] max-w-xs break-words">
                      {item.motivoDenegacion || 'Acceso concedido exitosamente'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
