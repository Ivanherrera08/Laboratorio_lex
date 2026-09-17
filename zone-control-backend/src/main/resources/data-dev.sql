-- ============================================================
-- DATOS SEMILLA PARA PERFIL DEV (H2 en memoria)
-- Contraseña para todos los usuarios demo: Admin123!
-- Hash BCrypt pre-generado para "Admin123!"
-- ============================================================
SET SCHEMA zone_control;

-- Roles (solo created_at)
INSERT INTO roles (nombre, descripcion, created_at) VALUES ('ADMINISTRADOR', 'Administra usuarios internos, roles y configuracion general.', CURRENT_TIMESTAMP);
INSERT INTO roles (nombre, descripcion, created_at) VALUES ('GESTOR_PERSONAL', 'Gestiona el personal operativo y sus autorizaciones.', CURRENT_TIMESTAMP);
INSERT INTO roles (nombre, descripcion, created_at) VALUES ('SUPERVISOR_ACCESOS', 'Supervisa la actividad de acceso y audita eventos.', CURRENT_TIMESTAMP);

-- Departamentos de prueba (created_at, updated_at)
INSERT INTO departamentos (codigo, nombre, descripcion, activo, created_at, updated_at) VALUES ('DEP-PROD', 'Produccion y Sintesis', 'Departamento de produccion de medicamentos.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO departamentos (codigo, nombre, descripcion, activo, created_at, updated_at) VALUES ('DEP-CAL', 'Control de Calidad', 'Departamento de aseguramiento y control de calidad.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO departamentos (codigo, nombre, descripcion, activo, created_at, updated_at) VALUES ('DEP-ADM', 'Administracion', 'Departamento administrativo y de sistemas.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Areas restringidas (created_at, updated_at)
INSERT INTO areas_restringidas (codigo, nombre, nivel_riesgo, descripcion, activa, created_at, updated_at) VALUES ('ZR-LAB01', 'Laboratorio de Sintesis Molecular (Area A)', 'ALTO', 'Zona de manipulacion de principios activos de alto riesgo.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO areas_restringidas (codigo, nombre, nivel_riesgo, descripcion, activa, created_at, updated_at) VALUES ('ZR-LAB02', 'Sala Limpia de Liofilizacion (Area B)', 'ALTO', 'Sala limpia para procesos de liofilizacion.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO areas_restringidas (codigo, nombre, nivel_riesgo, descripcion, activa, created_at, updated_at) VALUES ('ZR-ALM01', 'Almacen Central de Materias Primas (Area C)', 'MEDIO', 'Almacen de materias primas.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO areas_restringidas (codigo, nombre, nivel_riesgo, descripcion, activa, created_at, updated_at) VALUES ('ZR-ADM01', 'Oficinas Administrativas de Calidad (Area D)', 'BAJO', 'Oficinas administrativas.', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Usuarios del sistema (password: Admin123!)
-- Hash BCrypt real generado para "Admin123!"
INSERT INTO usuarios (documento, nombres, apellidos, correo, password_hash, estado, intentos_fallidos, rol_id, created_at, updated_at)
VALUES ('10001234', 'Dr. Roberto', 'Gomez', 'admin@laboratorioxyz.com',
        '$2a$12$8s7kPmXGlQH9F1fN5lJm.e/RkmL7p4uKkMPGbThsOLVRnkj36XBSG', 'ACTIVO', 0,
        (SELECT id FROM roles WHERE nombre = 'ADMINISTRADOR'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO usuarios (documento, nombres, apellidos, correo, password_hash, estado, intentos_fallidos, rol_id, created_at, updated_at)
VALUES ('10002345', 'Maria Fernanda', 'Londono', 'gestor@laboratorioxyz.com',
        '$2a$12$8s7kPmXGlQH9F1fN5lJm.e/RkmL7p4uKkMPGbThsOLVRnkj36XBSG', 'ACTIVO', 0,
        (SELECT id FROM roles WHERE nombre = 'GESTOR_PERSONAL'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO usuarios (documento, nombres, apellidos, correo, password_hash, estado, intentos_fallidos, rol_id, created_at, updated_at)
VALUES ('10003456', 'Ing. Alejandro', 'Torres', 'supervisor@laboratorioxyz.com',
        '$2a$12$8s7kPmXGlQH9F1fN5lJm.e/RkmL7p4uKkMPGbThsOLVRnkj36XBSG', 'ACTIVO', 0,
        (SELECT id FROM roles WHERE nombre = 'SUPERVISOR_ACCESOS'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Empleados de prueba
INSERT INTO empleados (tipo_documento, numero_documento, nombres, apellidos, correo, telefono, departamento_id, codigo_tarjeta_rfid, estado, created_at, updated_at)
VALUES ('CC', '1012345678', 'Carlos Andres', 'Mendoza Vargas', 'carlos.mendoza@laboratorioxyz.com', '3001234567',
        (SELECT id FROM departamentos WHERE codigo = 'DEP-PROD'), 'CRN-XYZ-001', 'ACTIVO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO empleados (tipo_documento, numero_documento, nombres, apellidos, correo, telefono, departamento_id, codigo_tarjeta_rfid, estado, created_at, updated_at)
VALUES ('CC', '1087654321', 'Laura Sofia', 'Restrepo Villa', 'laura.restrepo@laboratorioxyz.com', '3109876543',
        (SELECT id FROM departamentos WHERE codigo = 'DEP-CAL'), 'CRN-XYZ-002', 'BLOQUEADO', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Autorizaciones de zona (solo fecha_asignacion)
INSERT INTO autorizaciones_zona (empleado_id, area_id, asignado_por, activo, fecha_asignacion)
VALUES (
    (SELECT id FROM empleados WHERE numero_documento = '1012345678'),
    (SELECT id FROM areas_restringidas WHERE codigo = 'ZR-LAB01'),
    (SELECT id FROM usuarios WHERE documento = '10001234'),
    TRUE, CURRENT_TIMESTAMP
);

INSERT INTO autorizaciones_zona (empleado_id, area_id, asignado_por, activo, fecha_asignacion)
VALUES (
    (SELECT id FROM empleados WHERE numero_documento = '1012345678'),
    (SELECT id FROM areas_restringidas WHERE codigo = 'ZR-ALM01'),
    (SELECT id FROM usuarios WHERE documento = '10001234'),
    TRUE, CURRENT_TIMESTAMP
);
