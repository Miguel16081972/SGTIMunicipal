const fs = require('fs');
const path = require('path');

const files = [
    path.join(__dirname, 'www', 'index.html'),
    path.join(__dirname, 'android', 'app', 'src', 'main', 'assets', 'public', 'index.html')
];

for (const file of files) {
    if (!fs.existsSync(file)) {
        console.log('File does not exist:', file);
        continue;
    }
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix overlapping replacement double-a typo (Contrasenaa -> Contrasena)
    content = content.replace(/Contrasenaa/g, 'Contrasena');
    content = content.replace(/contrasenaa/g, 'contrasena');
    content = content.replace(/Contraseñ/g, 'Contrasena');
    content = content.replace(/contraseñ/g, 'contrasena');
    
    // Fix EN LÃ NEA and variations using broad bulletproof regex
    content = content.replace(/EN L[^A-Za-z]+NEA/g, 'EN LINEA');
    content = content.replace(/L[^A-Za-z]+NEA/g, 'LINEA');
    
    // Fix em-dash and weird chars in header titles
    content = content.replace(/SGTI\s+[^A-Za-z|0-9]+\s+Sistema/g, 'SGTI | Sistema');
    content = content.replace(/SGTI\s+[^A-Za-z|0-9]+\s+Gestión/g, 'SGTI | Sistema de Gestión');
    content = content.replace(/SGTI\s+[^A-Za-z|0-9]+/g, 'SGTI | ');
    
    // Fix Area and Área weird encodings
    content = content.replace(/Ã.rea/gi, 'Area');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully applied perfect text repair to:', file);
}
