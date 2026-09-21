const fs = require('fs');
const path = require('path');

const file = path.join('/home/senafactory/Descargas/Laboratorio_lex', 'src/app/dashboard/simulador/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace the fallback logic completely
const newLogic = `
      const res = await api.post('/accesos/molinete', {
        numeroDocumento: tipoIdentificador === 'DOCUMENTO' ? identificador.trim() : undefined,
        codigoTarjetaRfid: tipoIdentificador === 'RFID' ? identificador.trim() : undefined,
        areaId: parseInt(areaId, 10),
      });

      const estado = res.data.resultado as ResultadoAcceso;
      const timestampActual = new Date().toISOString();

      setResultado({
        estado,
        motivo: res.data.motivo || res.data.mensaje,
        timestamp: timestampActual,
        areaConsultada: res.data.nombreArea || areaSeleccionada,
        perfil: res.data.nombreEmpleado ? {
          id: 0,
          departamentoId: 0,
          tipoDocumento: 'CC',
          numeroDocumento: identificador,
          nombres: res.data.nombreEmpleado.split(' ')[0] || res.data.nombreEmpleado,
          apellidos: res.data.nombreEmpleado.split(' ').slice(1).join(' ') || '',
          correo: 'personal@laboratorioxyz.com',
          telefono: 'Registrado en Servidor',
          estado: res.data.estadoEmpleado || (estado === 'AUTORIZADO' ? 'ACTIVO' : 'REVOCADO'),
          areaPrincipalNombre: res.data.nombreArea || areaSeleccionada,
        } : undefined,
      });

      if (estado === 'AUTORIZADO') {
        toast.success('Acceso Permitido', { id: 'scan-toast' });
      } else if (estado === 'DENEGADO') {
        toast.error('Acceso Denegado', { id: 'scan-toast' });
      } else {
        toast.warning('Credencial Desconocida', { id: 'scan-toast' });
      }

    } catch (error) {
      toast.error('Error de conexión con el servidor biométrico', { id: 'scan-toast' });
    } finally {
      setLoading(false);
    }
  };
`;

content = content.replace(/const res = await api\.post\('\/accesos\/molinete'[\s\S]*?setLoading\(false\);\s*\}\s*\};\s*const colors/m, newLogic.trim() + '\n\n  const colors');
fs.writeFileSync(file, content);
