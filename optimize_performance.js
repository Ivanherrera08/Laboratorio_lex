const fs = require('fs');
const path = require('path');

function replaceFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    for (const [regex, replacement] of replacements) {
        content = content.replace(regex, replacement);
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Optimized ${filePath}`);
}

// 1. Optimize globals.css
const globalsPath = path.join(__dirname, 'src/app/globals.css');
replaceFile(globalsPath, [
    [/animation: gradientFlow 15s ease infinite;/g, '/* removed heavy background animation */'],
    [/backdrop-filter: blur\(24px\);/g, 'backdrop-filter: blur(8px); /* reduced blur for performance */'],
    [/-webkit-backdrop-filter: blur\(24px\);/g, '-webkit-backdrop-filter: blur(8px);'],
    [/backdrop-filter: blur\(16px\);/g, 'backdrop-filter: blur(8px);'],
    [/-webkit-backdrop-filter: blur\(16px\);/g, '-webkit-backdrop-filter: blur(8px);'],
    [/backdrop-filter: blur\(20px\);/g, 'backdrop-filter: blur(10px);'],
    [/-webkit-backdrop-filter: blur\(20px\);/g, '-webkit-backdrop-filter: blur(10px);']
]);

// 2. Optimize DashboardLayoutClient.tsx
const dashboardPath = path.join(__dirname, 'src/app/dashboard/DashboardLayoutClient.tsx');
replaceFile(dashboardPath, [
    // Replace heavy moving animated blobs with simple static divs to kill GPU lag
    [/<motion\.div\s+animate=\{.*?\}\s+transition=\{.*?\}\s+className="absolute.*?(blur-\[100px\]|blur-\[120px\]).*?"\s*\/>/g, 
    '<div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-emerald-100/20 mix-blend-multiply filter blur-[60px]" />']
]);

// 3. Optimize RootClient.tsx (Landing Page)
const rootPath = path.join(__dirname, 'src/app/RootClient.tsx');
replaceFile(rootPath, [
    // Kill the heavy 6 floating orbs
    [/\{floatingOrbs\.map\(\(orb\) => \([\s\S]*?\}\)\)/g, ''],
    // Kill the 3D rotating cards loop which is heavy
    [/animate=\{\{.*?\}\}\s*transition=\{\{ repeat: Infinity.*?\}\}/g, ''],
    // Kill continuous scroll animations and blur 80px
    [/filter blur-\[80px\]/g, 'filter blur-[30px]'],
    [/filter blur-\[60px\]/g, 'filter blur-[20px]']
]);

// 4. Optimize Personal/Simulador/Historial Page (reduce layout animations)
const pages = [
    'src/app/dashboard/personal/page.tsx',
    'src/app/dashboard/simulador/page.tsx',
    'src/app/dashboard/historial/page.tsx'
];

pages.forEach(p => {
    const pPath = path.join(__dirname, p);
    replaceFile(pPath, [
        // Reduce motion layout overhead if any
        [/layout\s+initial=\{.*?\}\s+animate=\{.*?\}\s+exit=\{.*?\}/g, 'initial={{ opacity: 0 }} animate={{ opacity: 1 }}']
    ]);
});

console.log("Performance optimizations applied successfully.");
