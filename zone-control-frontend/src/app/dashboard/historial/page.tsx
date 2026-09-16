'use client';

import React, { useState } from 'react';
import { HistorialAcceso, ResultadoAcceso } from '@/types';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const mockHistorial: HistorialAcceso[] = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    empleadoId: 1,
    empleadoNombreCompleto: 'Dr. Carlos Mendoza',
    areaId: 1,
    areaNombre: 'Laboratorio de Síntesis Molecular',
    numeroDocumentoIngresado: '1012345678',
    codigoTarjetaIngresado: 'RFID-001',
    resultadoAcceso: 'AUTORIZADO',
    timestamp: '2026-09-16T08:15:22Z',
  },
  {
    id: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
    empleadoId: 2,
    empleadoNombreCompleto: 'Ing. Laura Restrepo',
    areaId: 1,
    areaNombre: 'Laboratorio de Síntesis Molecular',
    numeroDocumentoIngresado: '1087654321',
    codigoTarjetaIngresado: 'RFID-002',
    resultadoAcceso: 'DENEGADO',
    motivoDenegacion: 'Permiso REVOCADO en área de alto riesgo',
    timestamp: '2026-09-16T08:18:45Z',
  },
  {
    id: '00112233-4455-6677-8899-aabbccddeeff',
    areaId: 2,
    areaNombre: 'Sala Limpia de Liofilización',
    numeroDocumentoIngresado: '9988776655',
    codigoTarjetaIngresado: 'RFID-UNKNOWN',
    resultadoAcceso: 'NO_REGISTRADO',
    motivoDenegacion: 'Credencial no existe en padrón de empleados',
    timestamp: '2026-09-16T08:24:10Z',
  },
];

export default function HistorialAccesosPage() {
  const [historial] = useState<HistorialAcceso[]>(mockHistorial);
  const [busqueda, setBusqueda] = useState('');
  const [filtroResultado, setFiltroResultado] = useState('TODOS');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const filtrados = historial.filter((item) => {
    const coincideTexto =
      item.numeroDocumentoIngresado.includes(busqueda) ||
      (item.empleadoNombreCompleto && item.empleadoNombreCompleto.toLowerCase().includes(busqueda.toLowerCase())) ||
      (item.areaNombre && item.areaNombre.toLowerCase().includes(busqueda.toLowerCase()));

    const coincideEstado = filtroResultado === 'TODOS' || item.resultadoAcceso === filtroResultado;

    return coincideTexto && coincideEstado;
  });

  const exportarCSV = () => {
    let csv = 'ID_UNICO,FECHA_HORA,DOCUMENTO,EMPLEADO,AREA,RESULTADO,MOTIVO\n';
    filtrados.forEach((row) => {
      csv += `"${row.id}","${row.timestamp}","${row.numeroDocumentoIngresado}","${row.empleadoNombreCompleto || 'NO REGISTRADO'}","${row.areaNombre || ''}","${row.resultadoAcceso}","${row.motivoDenegacion || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historial_accesos_zone_control_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportarPDF = () => {
    alert('Generando PDF firmado digitalmente con sello de trazabilidad inmutable...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-brand-dark">Historial Inmutable de Accesos</h1>
          <p className="text-xs text-brand-text/70 mt-1">
            Auditoría continua de todos los intentos de acceso registrados en torniquetes y esclusas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportarCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-brand-accent/60 text-brand-dark text-xs font-semibold hover:bg-brand-secondary/40 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-brand-primary" />
            Exportar CSV
          </button>
          <button
            onClick={exportarPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary/90 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-brand-accent/40 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-4 relative">
          <Search className="w-4 h-4 text-brand-text/50 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por documento, nombre o área..."
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-secondary/70 border-b border-brand-accent/30 text-brand-dark font-bold">
              <tr>
                <th className="p-4">Timestamp (Marca UTC)</th>
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
                  <td className="p-4 font-mono text-[11px] text-brand-text/80">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <p className="font-mono font-bold text-brand-dark">{item.numeroDocumentoIngresado}</p>
                    {item.codigoTarjetaIngresado && (
                      <span className="text-[10px] text-brand-primary font-mono">{item.codigoTarjetaIngresado}</span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-brand-dark">
                    {item.empleadoNombreCompleto || (
                      <span className="text-gray-400 italic">No empadronado</span>
                    )}
                  </td>
                  <td className="p-4 text-brand-text font-medium">{item.areaNombre}</td>
                  <td className="p-4">
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
                  <td className="p-4 text-brand-text/70 text-[11px]">
                    {item.motivoDenegacion || 'Acceso correcto verificado'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
