const fs = require('fs');

const files = [
  'www/index.html',
  'android/app/src/main/assets/public/index.html'
];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log('No existe:', file);
    continue;
  }

  let html = fs.readFileSync(file, 'utf8');

  // Asegurar UTF-8
  if (/<meta\s+charset=/i.test(html)) {
    html = html.replace(/<meta\s+charset=["'][^"']+["']\s*\/?>/i, '<meta charset="UTF-8">');
  } else {
    html = html.replace(/<head[^>]*>/i, m => m + '\n<meta charset="UTF-8">');
  }

  // Reparar mojibake común y caracteres corruptos directos
  html = html.replace(/EN LÃ\u0081 NEA/gi, 'EN LINEA');
  html = html.replace(/EN LÃ NEA/gi, 'EN LINEA');
  html = html.replace(/Contraseñ/g, 'Contrasena');
  html = html.replace(/contraseñ/g, 'contrasena');
  html = html.replace(/Ã rea/g, 'Area');
  html = html.replace(/â€”/g, ' | ');
  html = html.replace(/â\u0080\u0094/g, ' | ');
  html = html.replace(/âœ…/g, '✅');

  // Reparar mojibake común
  html = html.replace(/Contrase\u00c3\u00b1a/g, 'Contrasena');
  html = html.replace(/contrase\u00c3\u00b1a/g, 'contrasena');
  html = html.replace(/\u00c3\u00a1/g, 'a');
  html = html.replace(/\u00c3\u00a9/g, 'e');
  html = html.replace(/\u00c3\u00ad/g, 'i');
  html = html.replace(/\u00c3\u00b3/g, 'o');
  html = html.replace(/\u00c3\u00ba/g, 'u');
  html = html.replace(/\u00c3\u00b1/g, 'n');
  html = html.replace(/\u00c2\u00a9/g, '(c)');
  html = html.replace(/\u00c2/g, '');
  html = html.replace(/\u00e2\u20ac\u00a2/g, '*');

  // Limpiar emojis/íconos dañados antes de opciones visibles
  const labels = [
    'Atendido / Finalizado',
    'Pendiente',
    'Baja',
    'Media',
    'Alta',
    'Leve',
    'Moderada',
    'Grave',
    'Seguridad',
    'Limpieza',
    'Obras',
    'Fiscalizacion',
    'Transito',
    'Riesgos',
    'Otros'
  ];

  for (const label of labels) {
    const re = new RegExp('>\\s*[^<]*' + escapeRegExp(label) + '\\s*<', 'gi');
    html = html.replace(re, '>' + label + '<');
  }

  // Cambiar textos acentuados a texto simple para evitar nueva corrupción
  html = html.replace(/Contraseña/g, 'Contrasena');
  html = html.replace(/contraseña/g, 'contrasena');
  html = html.replace(/Fiscalización/g, 'Fiscalizacion');
  html = html.replace(/Tránsito/g, 'Transito');
  html = html.replace(/Ubicación/g, 'Ubicacion');
  html = html.replace(/Intervención/g, 'Intervencion');
  html = html.replace(/Fotográfica/g, 'Fotografica');

  // Evitar placeholder con bullets raros
  html = html.replace(/placeholder=["'][^"']*[\u2022\*][^"']*["']/gi, 'placeholder="Tu contrasena"');

  fs.writeFileSync(file, html, 'utf8');
  console.log('Corregido:', file);
}
