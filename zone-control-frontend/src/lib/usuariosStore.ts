/**
 * usuariosStore.ts
 *
 * Almacén compartido de usuarios del sistema (operadores Zone Control).
 * Persiste en localStorage para que el Simulador pueda encontrar
 * a los operadores registrados en la página de Usuarios.
 */

import { UsuarioAuth } from '@/types';

const STORE_KEY = 'zone_control_usuarios_sistema';

// Usuarios demo iniciales
const usuariosIniciales: UsuarioAuth[] = [
  {
    id: 1,
    documento: '10001234',
    nombres: 'Dr. Roberto',
    apellidos: 'Gómez',
    correo: 'admin@laboratorioxyz.com',
    rol: 'ADMINISTRADOR',
    estado: 'ACTIVO',
  },
  {
    id: 2,
    documento: '10002345',
    nombres: 'María Fernanda',
    apellidos: 'Londoño',
    correo: 'gestor@laboratorioxyz.com',
    rol: 'GESTOR_PERSONAL',
    estado: 'ACTIVO',
  },
  {
    id: 3,
    documento: '10003456',
    nombres: 'Ing. Alejandro',
    apellidos: 'Torres',
    correo: 'supervisor@laboratorioxyz.com',
    rol: 'SUPERVISOR_ACCESOS',
    estado: 'ACTIVO',
  },
];

export function getUsuariosSistema(): UsuarioAuth[] {
  if (typeof window === 'undefined') return usuariosIniciales;
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      localStorage.setItem(STORE_KEY, JSON.stringify(usuariosIniciales));
      return usuariosIniciales;
    }
    return JSON.parse(raw) as UsuarioAuth[];
  } catch {
    return usuariosIniciales;
  }
}

export function saveUsuariosSistema(usuarios: UsuarioAuth[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(usuarios));
  } catch {}
}

export function buscarUsuarioPorDocumento(documento: string): UsuarioAuth | null {
  const usuarios = getUsuariosSistema();
  return usuarios.find((u) => u.documento.trim() === documento.trim()) ?? null;
}
