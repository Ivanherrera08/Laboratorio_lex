const fs = require('fs');
const path = require('path');

const file = path.join('/home/senafactory/.gemini/antigravity-ide/brain/a493a194-9ea6-4070-bc9c-c1b362068139', 'task.md');
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("- `[ ]` Configurar filtros avanzados", "- `[x]` Configurar filtros avanzados");
  content = content.replace("- `[ ]` Implementar exportación a PDF", "- `[x]` Implementar exportación a PDF");
  content = content.replace("- `[/]` Asegurar que el estado", "- `[x]` Asegurar que el estado");
  fs.writeFileSync(file, content);
} else {
  console.log("No task.md found");
}
