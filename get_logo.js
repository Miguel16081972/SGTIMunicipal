const https = require('https');
const fs = require('fs');

const url = 'https://upload.wikimedia.org/wikipedia/commons/d/dd/Escudo_de_Carmen_de_La_Legua_-_Reynoso.png';
// Wait, the previous search results were: "Escudo_de_Carmen_de_la_Legua_Reynoso.png"
const options = {
    hostname: 'upload.wikimedia.org',
    port: 443,
    path: '/wikipedia/commons/1/1d/Escudo_de_Carmen_de_la_Legua_Reynoso.png',
    method: 'GET',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
};

const req = https.request(options, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (res2) => {
             res2.pipe(fs.createWriteStream('C:/Users/USER/Desktop/SGTI-MUNICIPAL/demo 5/frontend/public/logo.png'));
             console.log('Redirect followed and downloaded!');
        });
    } else if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream('C:/Users/USER/Desktop/SGTI-MUNICIPAL/demo 5/frontend/public/logo.png'));
        console.log('Downloaded directly!');
    } else {
        console.log('Failed:', res.statusCode);
    }
});
req.on('error', e => console.error(e));
req.end();
