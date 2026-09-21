const fs = require('fs');
const path = require('path');

const file = path.join('/home/senafactory/Descargas/Laboratorio_lex', 'src/app/dashboard/historial/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Add imports
content = content.replace("import { toast } from 'sonner';", "import { toast } from 'sonner';\nimport jsPDF from 'jspdf';\nimport autoTable from 'jspdf-autotable';");

// Replace exportarPDF function
const newFunc = `  const exportarPDF = () => {
    if (filtrados.length === 0) {
      toast.error('No hay registros para generar el reporte.');
      return;
    }
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Zone Control - Reporte de Auditoría y Accesos', 14, 22);
    
    doc.setFontSize(10);
    doc.text(\`Generado el: \${new Date().toLocaleString()}\`, 14, 30);
    doc.text(\`Total de registros: \${filtrados.length}\`, 14, 35);
    
    const tableColumn = ["Fecha/Hora", "Identificador", "Persona", "Área", "Resultado", "Motivo"];
    const tableRows: any[] = [];
    
    filtrados.forEach(item => {
      const rowData = [
        new Date(item.timestamp).toLocaleString(),
        item.numeroDocumentoIngresado || item.codigoTarjetaIngresado || '-',
        item.empleadoNombreCompleto || 'NO REGISTRADO',
        item.areaNombre || '-',
        item.resultadoAcceso,
        item.motivoDenegacion || 'OK'
      ];
      tableRows.push(rowData);
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [5, 150, 105] }, // emerald-600
    });
    
    doc.save(\`bitacora_accesos_zone_control_\${new Date().toISOString().slice(0, 10)}.pdf\`);
    toast.success('Reporte PDF descargado exitosamente.');
  };`;

content = content.replace(/const exportarPDF = \(\) => \{[\s\S]*?window\.print\(\);\s*\};/, newFunc);

fs.writeFileSync(file, content);
