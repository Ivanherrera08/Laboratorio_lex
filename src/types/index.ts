export type RolUsuario = 'ADMINISTRADOR' | 'GESTOR_PERSONAL' | 'SUPERVISOR_ACCESOS';

export type EstadoUsuario = 'ACTIVO' | 'BLOQUEADO' | 'INACTIVO';

export type EstadoEmpleado = 'ACTIVO' | 'REVOCADO' | 'SUSPENDIDO' | 'INACTIVO';

export type ResultadoAcceso = 'AUTORIZADO' | 'DENEGADO' | 'NO_REGISTRADO';

export interface UsuarioAuth {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: RolUsuario;
  estado: EstadoUsuario;
}

export interface Empleado {
  id: number;
  departamentoId: number;
  departamentoNombre?: string;
  areaPrincipalId?: number;
  areaPrincipalNombre?: string;
  areasAutorizadas?: string[];
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  codigoTarjetaRfid?: string;
  estado: EstadoEmpleado;
  motivoCambioEstado?: string;
  createdAt?: string;
  fotoPerfil?: string; // Base64 o URL de la foto del empleado
}


export interface Departamento {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface AreaRestringida {
  id: number;
  codigo: string;
  nombre: string;
  nivelRiesgo: 'ALTO' | 'MEDIO' | 'BAJO';
  descripcion: string;
  activa: boolean;
}

export interface HistorialAcceso {
  id: string;
  empleadoId?: number;
  empleadoNombreCompleto?: string;
  areaId: number;
  areaNombre?: string;
  numeroDocumentoIngresado: string;
  codigoTarjetaIngresado?: string;
  resultadoAcceso: ResultadoAcceso;
  motivoDenegacion?: string;
  timestamp: string;
}

export interface BitacoraAuditoria {
  id: string;
  usuarioId?: number;
  usuarioNombre?: string;
  direccionIp?: string;
  tipoOperacion: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'INTENTO_FALLIDO';
  moduloTabla: string;
  valorAnterior?: Record<string, unknown>;
  valorNuevo?: Record<string, unknown>;
  timestamp: string;
}

export interface SincronizacionSocio {
  id: number;
  departamentoId?: number;
  periodoInicio: string;
  periodoFin: string;
  estado: 'EXITOSO' | 'FALLIDO' | 'PENDIENTE' | 'REINTENTANDO';
  intentosRealizados: number;
  codigoRespuestaHttp?: number;
  fechaEnvio?: string;
  fechaProximoReintento?: string;
}
