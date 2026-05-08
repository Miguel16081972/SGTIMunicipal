const https = require('https');
const fs = require('fs');

const options = {
    hostname: 'es.wikipedia.org',
    path: '/w/api.php?action=query&titles=Carmen_de_La_Legua-Reynoso&prop=pageimages&format=json&pithumbsize=500',
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
};

https.get(options, (res) => {
    let data = '';
    res.on('data', d => data+=d);
    res.on('end', () => {
        const json = JSON.parse(data);
        const pages = json.query.pages;
        const pageId = Object.keys(pages)[0];
        const imageUrl = pages[pageId].thumbnail.source;
        console.log("Image URL:", imageUrl);
        
        const imgUrlObj = new URL(imageUrl);
        const dlOptions = {
            hostname: imgUrlObj.hostname,
            path: imgUrlObj.pathname + imgUrlObj.search,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        };
        https.get(dlOptions, (dlRes) => {
             dlRes.pipe(fs.createWriteStream('C:/Users/USER/Desktop/SGTI-MUNICIPAL/demo 5/frontend/public/logo.png'));
             console.log('Downloaded correctly');
        });
    });
});
