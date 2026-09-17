-- V2: Insertar datos de prueba para la Fase 4 (Integración)

-- 1. Crear Roles
INSERT INTO zone_control.roles (nombre, descripcion) VALUES 
('ADMINISTRADOR', 'Acceso total al sistema'),
('GESTOR_PERSONAL', 'Puede gestionar empleados'),
('SUPERVISOR_ACCESOS', 'Audita accesos e historial')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Crear Usuarios (Contraseña: Admin123!)
-- Hash generado con BCrypt de 'Admin123!'
INSERT INTO zone_control.usuarios (documento, nombres, apellidos, correo, password_hash, estado, intentos_fallidos, rol_id, updated_at) VALUES 
('10001234', 'Dr. Roberto', 'Gomez', 'admin@laboratorioxyz.com', '$2a$10$C8HhP7mIINgV1K2sNqjVz.i8n2DqN/J/jD/G/JvL7T3x/x2G/9.Fm', 'ACTIVO', 0, 1, CURRENT_TIMESTAMP),
('10002345', 'Maria Fernanda', 'Londono', 'gestor@laboratorioxyz.com', '$2a$10$C8HhP7mIINgV1K2sNqjVz.i8n2DqN/J/jD/G/JvL7T3x/x2G/9.Fm', 'ACTIVO', 0, 2, CURRENT_TIMESTAMP),
('10003456', 'Ing. Alejandro', 'Torres', 'supervisor@laboratorioxyz.com', '$2a$10$C8HhP7mIINgV1K2sNqjVz.i8n2DqN/J/jD/G/JvL7T3x/x2G/9.Fm', 'ACTIVO', 0, 3, CURRENT_TIMESTAMP)
ON CONFLICT (documento) DO NOTHING;

-- 3. Crear Departamento y Áreas
INSERT INTO zone_control.departamentos (codigo, nombre, descripcion, activo, updated_at) VALUES 
('DEP-OPE', 'Operaciones Generales', 'Departamento principal', true, CURRENT_TIMESTAMP)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO zone_control.areas_restringidas (codigo, nombre, descripcion, nivel_riesgo, departamento_id, activa, updated_at) VALUES 
('AREA-A', 'Laboratorio de Síntesis Molecular (Área A)', 'Zona crítica BSL-3', 'ALTO', 1, true, CURRENT_TIMESTAMP),
('AREA-B', 'Sala Limpia de Liofilización (Área B)', 'Zona estéril ISO 5', 'MEDIO', 1, true, CURRENT_TIMESTAMP),
('AREA-C', 'Almacén Central (Área C)', 'Almacenamiento general', 'BAJO', 1, true, CURRENT_TIMESTAMP),
('AREA-D', 'Oficinas Administrativas (Área D)', 'Zona de trabajo común', 'BAJO', 1, true, CURRENT_TIMESTAMP)
ON CONFLICT (codigo) DO NOTHING;

-- 4. Crear un Empleado de Prueba (Para el simulador)
INSERT INTO zone_control.empleados (tipo_documento, numero_documento, codigo_tarjeta_rfid, nombres, apellidos, departamento_id, estado, motivo_cambio_estado, created_at, updated_at) VALUES 
('CC', '12345678', 'RFID-001', 'Juan', 'Perez (Prueba)', 1, 'ACTIVO', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('CC', '87654321', 'RFID-002', 'Ana', 'Lopez (Prueba)', 1, 'INACTIVO', 'Prueba de inactivacion', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (numero_documento) DO NOTHING;

-- 5. Autorizar al Empleado de Prueba 1 en el Área A
INSERT INTO zone_control.autorizaciones_zona (empleado_id, area_id, asignado_por, fecha_asignacion, activo) VALUES 
(1, 1, 1, CURRENT_TIMESTAMP, true)
ON CONFLICT (empleado_id, area_id) DO NOTHING;
