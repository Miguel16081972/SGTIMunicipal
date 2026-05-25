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
    
    // Replace labels with proper HTML Entities for Spanish letters (ñ, í, á)
    // This is 100% immune to encoding corruptions because it uses standard ASCII-based HTML entities!
    content = content.replace(/<label([^>]*)>Contrasena<\/label>/g, '<label$1>Contrase&ntilde;a</label>');
    content = content.replace(/placeholder="Tu contrasena"/g, 'placeholder="Tu contrase&ntilde;a"');
    content = content.replace(/placeholder="Tu contrasenaa"/g, 'placeholder="Tu contrase&ntilde;a"');
    
    // Also fix the manager register screen password label
    content = content.replace(/<label>Contrasena<\/label>/g, '<label>Contrase&ntilde;a</label>');
    
    // Fix Area to Área
    content = content.replace(/<label>Area<\/label>/g, '<label>&Aacute;rea</label>');
    
    // Fix status bar header label
    content = content.replace(/id="logged-user-status">EN LINEA<\/span>/g, 'id="logged-user-status">EN L&Iacute;NEA</span>');
    content = content.replace(/id="logged-user-status">EN L[^A-Za-z]+NEA<\/span>/g, 'id="logged-user-status">EN L&Iacute;NEA</span>');
    
    // Fix JavaScript status string using safe Unicode escape for 'Í' (\u00CD)
    content = content.replace(/'EN LINEA:\s*'/g, "'EN L\\u00CDNEA: '");
    content = content.replace(/'EN L[^A-Za-z]+NEA:\s*'/g, "'EN L\\u00CDNEA: '");
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully applied HTML entities and Unicode escapes to:', file);
}
