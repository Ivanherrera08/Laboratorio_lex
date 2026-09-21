const fs = require('fs');
const path = require('path');

const dirs = [
  './src/app/dashboard/catalogos/page.tsx',
  './src/app/dashboard/auditoria/page.tsx',
  './src/app/dashboard/socio-sync/page.tsx',
  './src/app/dashboard/simulador/page.tsx',
  './src/app/dashboard/carga-masiva/page.tsx',
  './src/app/dashboard/historial/page.tsx'
];

for (const file of dirs) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Add import if missing
  if (!content.includes('framer-motion')) {
    content = content.replace(
      "import React,", 
      "import React from 'react';\nimport { motion, AnimatePresence } from 'framer-motion';\nimport"
    );
    // fallback if 'import React' is different
    if (!content.includes('framer-motion')) {
        content = content.replace(
            "import {",
            "import { motion, AnimatePresence } from 'framer-motion';\nimport {"
        );
    }
    changed = true;
  }

  // Replace outer div
  if (content.includes('return (') && content.includes('<div className="space-y-6">')) {
    content = content.replace(
      '<div className="space-y-6">',
      `<motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >`
    );
    
    // We need to find the last </div> closing tag of the main block.
    // The easiest robust way is just replace the last </div> with </motion.div>
    const lastDivIndex = content.lastIndexOf('</div>');
    if (lastDivIndex !== -1) {
       content = content.substring(0, lastDivIndex) + '</motion.div>' + content.substring(lastDivIndex + 6);
    }
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Animated ${file}`);
  }
}
