// ===== SGTI Municipal — Maps =====
import { renderWspFeed, getWspFeeds, currentWspGroup } from './whatsapp.js';

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; OpenStreetMap contributors &copy; CARTO';
// Coordenadas centrales de Carmen de La Legua - Reynoso
const CENTER = [-12.0435, -77.0955];
// Polígono exacto del distrito (Carmen de La Legua Reynoso)
const CARMEN_POLYGON = [
  [-12.039575, -77.0992547],
  [-12.0403016, -77.0991774],
  [-12.0411883, -77.0990831],
  [-12.0422192, -77.0989838],
  [-12.043898, -77.0988175],
  [-12.0460721, -77.0986029],
  [-12.0484104, -77.0983995],
  [-12.0474364, -77.0874596],
  [-12.0469196, -77.0816033],
  [-12.0468768, -77.081605],
  [-12.0449269, -77.0817948],
  [-12.0449984, -77.0826873],
  [-12.0392438, -77.0831828],
  [-12.0391953, -77.0825954],
  [-12.036339, -77.0829631],
  [-12.036654, -77.0846652],
  [-12.0382858, -77.0935231]
];

let mapWsp = null, wspMarkers = [];
let mapBenef = null;
let map = null;
const mapLayers = {};
let sectoresLayer = null; // Para el mapa principal
let sectoresLayerWsp = null; // Para el mapa de WhatsApp
let sectoresLayerBenef = null; // Para el mapa de beneficiados

async function getSectoresGeoJSON(targetMap, colorOpacity = 0.3) {
  try {
    const res = await fetch('/data/Sectores.geojson');
    const data = await res.json();
    const layer = L.geoJSON(data, {
      style: (feature) => {
        const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#22d3ee'];
        const color = colors[feature.properties.id % colors.length];
        return {
          fillColor: color,
          weight: 1.5,
          opacity: 0.8,
          color: 'white',
          dashArray: '2',
          fillOpacity: colorOpacity
        };
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(`<b>${feature.properties.Name}</b><br>Distrito: Carmen de La Legua`);
      }
    });
    if (targetMap) layer.addTo(targetMap);
    return layer;
  } catch (e) {
    console.error('Error loading sectores GeoJSON:', e);
    return null;
  }
}

const mapLayerData = {
  incidencias: { color: '#f87171', label: 'Incidencias', points: [{ lat: -12.0420, lng: -77.0940, popup: '<b>Pelea</b><br>Jr. Los Olivos' }, { lat: -12.0445, lng: -77.0970, popup: '<b>Sospechoso</b><br>Av. Colonial' }, { lat: -12.0438, lng: -77.0955, popup: '<b>Basura</b><br>Av. Colonial esq.' }, { lat: -12.0410, lng: -77.0985, popup: '<b>Accidente</b><br>Av. Argentina' }] },
  negocios: { color: '#fbbf24', label: 'Negocios', points: [{ lat: -12.0450, lng: -77.0945, popup: 'Pollería "El Sabrosón" ✅' }, { lat: -12.0435, lng: -77.0960, popup: 'Bar "La Noche" ❌' }, { lat: -12.0425, lng: -77.0930, popup: 'Taller "AutoFix" ⚠️' }] },
  obras: { color: '#fb923c', label: 'Obras', points: [{ lat: -12.0460, lng: -77.0975, popup: 'Pistas 75%' }, { lat: -12.0432, lng: -77.0950, popup: 'Parque 45%' }] },
  riesgo: { color: '#f87171', label: 'Riesgo', points: [{ lat: -12.0465, lng: -77.0978, popup: 'Ribera 🔴' }, { lat: -12.0418, lng: -77.0988, popup: 'Industrial 🟡' }, { lat: -12.0442, lng: -77.0948, popup: 'Mercado 🟡' }] },
  semaforo: { color: '#34d399', label: 'Semáforo', points: [{ lat: -12.0422, lng: -77.0940, popup: 'S1 🟡', color: '#fbbf24', radius: 20 }, { lat: -12.0430, lng: -77.0975, popup: 'S2 🟢', color: '#34d399', radius: 14 }, { lat: -12.0445, lng: -77.0955, popup: 'S3 🔴', color: '#f87171', radius: 28 }, { lat: -12.0455, lng: -77.0940, popup: 'S4 🟡', color: '#fbbf24', radius: 18 }, { lat: -12.0415, lng: -77.0985, popup: 'S5 🟢', color: '#34d399', radius: 15 }, { lat: -12.0460, lng: -77.0970, popup: 'S6 🟡', color: '#fbbf24', radius: 16 }] },
  reportes: { color: '#60a5fa', label: 'Reportes WSP', points: [] }, // Fetch from API
  sectores: { color: '#8b5cf6', label: 'Sectores', points: [], isGeoJSON: true }
};
const layerState = { incidencias: true, reportes: true, negocios: true, obras: false, riesgo: false, semaforo: false, sectores: true };

export function initMapWsp() {
  if (mapWsp) { mapWsp.invalidateSize(); updateWspMapMarkers(currentWspGroup, getWspFeeds()); return; }
  const el = document.getElementById('map-wsp');
  if (!el || el.offsetParent === null) return;
  mapWsp = L.map('map-wsp').setView(CENTER, 15);
  L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(mapWsp);
  L.polygon(CARMEN_POLYGON, { color: '#4f8ff7', weight: 4, fillOpacity: 0.05, dashArray: '5, 10' }).addTo(mapWsp);
  
  // Cargar sectores para el mapa de WhatsApp
  getSectoresGeoJSON(mapWsp, 0.15).then(layer => { sectoresLayerWsp = layer; });

  renderWspFeed(currentWspGroup);
  updateWspMapMarkers(currentWspGroup, getWspFeeds());
  mapWsp.invalidateSize();
}

export function updateWspMapMarkers(g, feeds) {
  if (!mapWsp) return;
  wspMarkers.forEach(m => mapWsp.removeLayer(m));
  wspMarkers = [];
  const items = (feeds || getWspFeeds())[g] || [];
  items.forEach(f => {
    if (f.lat && f.lng) {
      // Si está atendido, color verde. Si no, color según prioridad.
      const color = f.estado === 'atendido' ? '#10b981' : (f.prioridad === 'Alta' ? '#f87171' : (f.prioridad === 'Media' ? '#fbbf24' : '#34d399'));

      const m = L.circleMarker([f.lat, f.lng], { 
        radius: 8, 
        fillColor: color, 
        color: '#fff', 
        weight: 2, 
        fillOpacity: .85 
      }).addTo(mapWsp).bindPopup(`<b>${(f.mensaje || '').substring(0, 60)}...</b><br><small>${new Date(f.fecha).toLocaleString()}</small>`);
      wspMarkers.push(m);
    }
  });
}

export function initMapBenef() {
  if (mapBenef) { mapBenef.invalidateSize(); return; }
  const el = document.getElementById('map-beneficiados');
  if (!el || el.offsetParent === null) return;
  mapBenef = L.map('map-beneficiados').setView(CENTER, 15);
  L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(mapBenef);
  L.polygon(CARMEN_POLYGON, { color: '#22d3ee', weight: 3, fillOpacity: 0.05, dashArray: '5, 10' }).addTo(mapBenef);

  // Cargar sectores para el mapa de beneficiados
  getSectoresGeoJSON(mapBenef, 0.1).then(layer => { sectoresLayerBenef = layer; });

  [{ lat: -12.0418, lng: -77.0935, p: 'Vaso de Leche', f: 12, c: '#a78bfa' }, { lat: -12.0425, lng: -77.0948, p: 'Vaso de Leche', f: 18, c: '#a78bfa' }, { lat: -12.0440, lng: -77.0960, p: 'Comedor', f: 25, c: '#f472b6' }, { lat: -12.0412, lng: -77.0972, p: 'Vaso de Leche', f: 15, c: '#a78bfa' }, { lat: -12.0455, lng: -77.0940, p: 'CIAM', f: 8, c: '#22d3ee' }, { lat: -12.0432, lng: -77.0985, p: 'Vaso de Leche', f: 22, c: '#a78bfa' }, { lat: -12.0448, lng: -77.0970, p: 'OMAPED', f: 6, c: '#4f8ff7' }, { lat: -12.0420, lng: -77.0955, p: 'Comedor', f: 30, c: '#f472b6' }, { lat: -12.0460, lng: -77.0950, p: 'Vaso de Leche', f: 20, c: '#a78bfa' }, { lat: -12.0435, lng: -77.0930, p: 'CIAM', f: 10, c: '#22d3ee' }].forEach(b => {
    L.circleMarker([b.lat, b.lng], { radius: Math.max(5, b.f / 3), fillColor: b.c, color: '#fff', weight: 1, fillOpacity: .7 }).addTo(mapBenef).bindPopup(`<b>${b.p}</b><br>${b.f} familias`);
  });
  const leg = L.control({ position: 'bottomright' });
  leg.onAdd = function () { const d = L.DomUtil.create('div', ''); d.style.cssText = 'background:#111a2d;border:1px solid rgba(56,72,106,.4);border-radius:8px;padding:10px;font-size:10px;color:#e8ecf4;font-family:DM Sans'; d.innerHTML = '<b>Programas</b><br>● Vaso de Leche<br>● Comedor<br>● CIAM<br>● OMAPED'; return d; };
  leg.addTo(mapBenef);
  mapBenef.invalidateSize();
}

import api from './api.js';

export async function initMap() {
  if (map) { map.invalidateSize(); return; }
  const el = document.getElementById('map-main');
  if (!el || el.offsetParent === null) return;
  map = L.map('map-main').setView(CENTER, 15);
  L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);
  L.polygon(CARMEN_POLYGON, { color: '#f43f5e', weight: 4, fillOpacity: 0.02, dashArray: '8, 8' }).addTo(map);

  // Load WhatsApp Reportes dynamically from geocoded reports endpoint
  try {
    const data = await api.getMapaReportes();
    if (data.points && data.points.length > 0) {
      mapLayerData.reportes.points = data.points.map(p => ({
        lat: p.lat,
        lng: p.lng,
        popup: p.popup,
        color: p.color || '#60a5fa',
        radius: p.radius || 7,
      }));
      console.log(`📍 Mapa: ${data.points.length} reportes geocodificados cargados (${data.source})`);
    }
  } catch (e) {
    console.error('Error fetching map reportes:', e);
  }

  // Load Sectores GeoJSON para el mapa principal
  getSectoresGeoJSON(null, 0.3).then(layer => {
    if (!layer) return;
    sectoresLayer = layer;
    
    // Configurar interactividad extra solo para el mapa principal
    sectoresLayer.eachLayer(l => {
      l.on({
        mouseover: (e) => {
          const target = e.target;
          target.setStyle({ fillOpacity: 0.6, weight: 3 });
        },
        mouseout: (e) => {
          sectoresLayer.resetStyle(e.target);
        }
      });
    });
    
    if (layerState.sectores) sectoresLayer.addTo(map);
  });

  const bc = document.getElementById('map-layer-btns');
  bc.innerHTML = '';
  Object.keys(mapLayerData).forEach(k => {
    const d = mapLayerData[k], on = layerState[k], b = document.createElement('div');
    b.className = 'layer-toggle' + (on ? ' on' : '');
    b.innerHTML = `<span class="lt-dot" style="background:${d.color}"></span> ${d.label}`;
    b.onclick = function () { layerState[k] = !layerState[k]; b.classList.toggle('on'); renderMapLayers(); };
    bc.appendChild(b);
  });
  renderMapLayers();
  setTimeout(() => { if (map) map.invalidateSize(); }, 500);
}

function renderMapLayers() {
  if (!map) return;
  if (sectoresLayer) map.removeLayer(sectoresLayer);
  Object.values(mapLayers).forEach(g => { g.forEach(m => map.removeLayer(m)); });
  Object.keys(mapLayerData).forEach(k => {
    mapLayers[k] = [];
    if (!layerState[k]) return;
    const d = mapLayerData[k];
    if (d.isGeoJSON) {
      if (k === 'sectores' && sectoresLayer) sectoresLayer.addTo(map);
      return;
    }
    d.points.forEach(p => {
      const c = p.color || d.color, r = p.radius || 7;
      const m = L.circleMarker([p.lat, p.lng], { radius: r, fillColor: c, color: k === 'semaforo' ? c : '#fff', weight: k === 'semaforo' ? 2 : 1.5, fillOpacity: k === 'semaforo' ? .25 : .85 }).addTo(map).bindPopup(p.popup);
      mapLayers[k].push(m);
    });
  });
}

/**
 * Filtra y resalta los sectores en el mapa basándose en la selección del usuario.
 * @param {string} sectorName - El nombre del sector (ej: "Sector 1") o "all".
 */
export function filterSectors(sectorName) {
  // Aplicar a todos los mapas que tengan la capa de sectores cargada
  const layers = [sectoresLayer, sectoresLayerWsp, sectoresLayerBenef];
  const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa', '#f472b6', '#fb923c', '#22d3ee'];

  layers.forEach(layerGroup => {
    if (!layerGroup) return;
    
    layerGroup.eachLayer(l => {
      const name = l.feature.properties.Name;
      const originalColor = colors[l.feature.properties.id % colors.length];
      
      if (sectorName === 'all' || sectorName === 'todos') {
        // Restaurar colores originales (basados en ID)
        l.setStyle({
          fillColor: originalColor,
          fillOpacity: 0.3,
          weight: 1.5,
          opacity: 0.8,
          color: 'white'
        });
      } else if (name === sectorName) {
        // RESALTAR sector seleccionado con su COLOR ORIGINAL
        l.setStyle({
          fillColor: originalColor,
          fillOpacity: 0.7,
          weight: 3,
          opacity: 1,
          color: '#000' // Marco negro para definición
        });
        // Zoom al sector resaltado
        const bounds = l.getBounds();
        if (layerGroup === sectoresLayer && map) map.fitBounds(bounds);
      } else {
        // OCULTAR otros sectores
        l.setStyle({
          fillOpacity: 0,
          weight: 0,
          opacity: 0
        });
      }
    });
  });
}
