// ===== SGTI Municipal — Geocodificador de Direcciones =====
// Convierte direcciones de texto a coordenadas lat/lng usando Nominatim (OSM)
// Gratis, sin API key. Limitado a Carmen de La Legua Reynoso, Callao, Perú.

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Coordenadas centrales del distrito Carmen de La Legua Reynoso
const DISTRITO_CENTER = { lat: -12.0435, lng: -77.0955 };

// Bounding box del distrito (Ajustado a los 17 sectores oficiales)
const DISTRITO_BBOX = {
  south: -12.0465, // Límite Av. Argentina / Chalaca
  north: -12.0360, // Límite Río Rímac
  west: -77.1000,  // Límite Gambetta
  east: -77.0810   // Límite Lima
};

// Cache en memoria para evitar peticiones repetidas
const geocodeCache = new Map();

// Rate limiter: Nominatim requiere max 1 req/segundo
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // 1.1 segundos entre requests

/**
 * Espera para respetar el rate limit de Nominatim
 */
async function rateLimitWait() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
}

/**
 * Normaliza una dirección para mejorar la búsqueda
 * Remueve ruido común en los mensajes de WhatsApp y mejora intersecciones
 */
function normalizeAddress(address) {
  if (!address) return '';
  
  let clean = address
    // Remover frases de introducción comunes
    .replace(/^(atención médica domiciliaria|reporte de|incidente en|emergencia en|ubicación:|dirección:)\s*/gi, '')
    // Manejar intersecciones "con" -> "y" (Nominatim prefiere "and" o "y")
    .replace(/\bcon\b/gi, ' y ')
    // Abreviaturas de calles
    .replace(/\bcdr?a?\.?\s*/gi, 'cuadra ')
    .replace(/\bAv\.?\s*/gi, 'Avenida ')
    .replace(/\bJr\.?\s*/gi, 'Jirón ')
    .replace(/\bCl\.?\s*/gi, 'Calle ')
    .replace(/\bPsje\.?\s*/gi, 'Pasaje ')
    .replace(/\besq\.?\s*/gi, 'esquina ')
    // Limpieza general
    .replace(/\s+/g, ' ')
    .trim();

  return clean;
}

/**
 * Geocodifica una dirección y retorna coordenadas { lat, lng }
 * Añade "Carmen de La Legua Reynoso, Callao, Perú" para mejorar precisión
 */
async function geocodeAddress(address) {
  if (!address || address === 'Por determinar') return null;

  const normalizedAddr = normalizeAddress(address);
  if (!normalizedAddr || normalizedAddr.length < 3) return null;

  // Check cache
  const cacheKey = normalizedAddr.toLowerCase().trim();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }

  try {
    await rateLimitWait();

    // Priorizar búsqueda local — Forzamos Carmen de la Legua como parte de la cadena principal
    // Nominatim a veces ignora el viewbox si no hay coincidencias exactas dentro
    const searchQuery = `${normalizedAddr}, Carmen de La Legua Reynoso, Callao, Perú`;

    const params = new URLSearchParams({
      q: searchQuery,
      format: 'json',
      limit: '5',
      addressdetails: '1',
      // Forzar al área del Callao / Carmen de la Legua de forma más estricta
      viewbox: `${DISTRITO_BBOX.west},${DISTRITO_BBOX.north},${DISTRITO_BBOX.east},${DISTRITO_BBOX.south}`,
      bounded: '1', 
      'accept-language': 'es'
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'User-Agent': 'SGTI-Municipal-CDLL/2.0 (sistema.territorial@carmendelalegua.gob.pe)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Geocoder HTTP error: ${response.status}`);
      return null;
    }

    const results = await response.json();

    if (results.length > 0) {
      // Filtrar resultados para asegurar que estén dentro del BBOX estricto
      const validResult = results.find(r => {
        const lat = parseFloat(r.lat);
        const lon = parseFloat(r.lon);
        return lat >= DISTRITO_BBOX.south && lat <= DISTRITO_BBOX.north &&
               lon >= DISTRITO_BBOX.west && lon <= DISTRITO_BBOX.east;
      });

      if (validResult) {
        const result = {
          lat: parseFloat(validResult.lat),
          lng: parseFloat(validResult.lon),
          displayName: validResult.display_name
        };
        geocodeCache.set(cacheKey, result);
        console.log(`📍 Geocodificado (estricto): "${normalizedAddr}" → ${result.lat}, ${result.lng}`);
        return result;
      }
    }

    // Fallback: Si no se encuentra, ponerlo en una "Zona de Validación" central
    // Evitamos dispersión aleatoria fuera del mapa
    console.log(`⚠️ No se pudo geocodificar con precisión: "${normalizedAddr}". Usando Zona de Validación.`);
    const fallback = generateFallbackCoords(normalizedAddr);
    geocodeCache.set(cacheKey, fallback);
    return fallback;

  } catch (error) {
    console.error(`❌ Error en geocodificación de "${address}":`, error.message);
    return generateFallbackCoords(address);
  }
}

/**
 * Genera coordenadas dentro de una zona central del distrito como fallback
 * Mantiene los puntos dentro de los sectores visibles
 */
function generateFallbackCoords(address) {
  // Hash para que la misma dirección siempre caiga en el mismo sitio
  let hash = 0;
  const str = (address || 'default').toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }

  // Zona central segura (Sector 1, 2, 5, 6 - Corazón del distrito)
  const safeBBox = {
    south: -12.0440,
    north: -12.0410,
    west: -77.0970,
    east: -77.0930
  };

  const latRange = safeBBox.north - safeBBox.south;
  const lngRange = safeBBox.east - safeBBox.west;

  const latOffset = (Math.abs(hash) % 1000) / 1000;
  const lngOffset = (Math.abs(hash >> 8) % 1000) / 1000;

  return {
    lat: safeBBox.south + (latOffset * latRange),
    lng: safeBBox.west + (lngOffset * lngRange),
    displayName: `${address || 'Ubicación aproximada'} (Pendiente Validación), Carmen de La Legua`
  };
}


/**
 * Limpia el cache de geocodificación
 */
function clearCache() {
  geocodeCache.clear();
  console.log('🗑️ Cache de geocodificación limpiado');
}

/**
 * Convierte coordenadas { lat, lng } a una dirección legible
 */
async function reverseGeocode(lat, lng) {
  if (!lat || !lng) return null;

  try {
    await rateLimitWait();

    const params = new URLSearchParams({
      lat: lat,
      lon: lng,
      format: 'json',
      addressdetails: '1',
      'accept-language': 'es'
    });

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: {
        'User-Agent': 'SGTI-Municipal-CDLL/2.0 (sistema.territorial@carmendelalegua.gob.pe)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.address) {
      const addr = data.address;
      // Construir dirección legible priorizando calle y número
      let parts = [];
      if (addr.road) parts.push(addr.road);
      if (addr.house_number) parts.push(addr.house_number);
      
      // Si no hay calle, usar el punto de interés o barrio
      if (parts.length === 0) {
        if (addr.amenity) parts.push(addr.amenity);
        else if (addr.suburb) parts.push(addr.suburb);
      }

      return parts.join(' ');
    }
    return null;
  } catch (error) {
    console.error(`❌ Error en geocodificación inversa (${lat}, ${lng}):`, error.message);
    return null;
  }
}

module.exports = {
  geocodeAddress,
  reverseGeocode,
  generateFallbackCoords,
  clearCache,
  DISTRITO_CENTER
};

