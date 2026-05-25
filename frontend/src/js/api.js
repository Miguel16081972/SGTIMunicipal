// ===== SGTI Municipal — API Layer =====
const API_BASE = (window.Capacitor && window.Capacitor.isNativePlatform())
  ? 'https://app.gobernanzamunicipal.com/api'
  : '/api';

class API {
  constructor() {
    this.token = localStorage.getItem('sgti_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('sgti_token', token);
  }

  getToken() {
    return this.token || localStorage.getItem('sgti_token');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('sgti_token');
    localStorage.removeItem('sgti_user');
  }

  getUser() {
    const u = localStorage.getItem('sgti_user');
    return u ? JSON.parse(u) : null;
  }

  setUser(user) {
    localStorage.setItem('sgti_user', JSON.stringify(user));
  }

  isAuthenticated() {
    return !!this.token;
  }

  async request(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

      if (res.status === 401) {
        this.clearToken();
        window.location.reload();
        return null;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  // Auth
  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data) {
      this.setToken(data.token);
      this.setUser(data.user);
    }
    return data;
  }

  async me() {
    return this.request('/auth/me');
  }

  logout() {
    this.clearToken();
    window.location.reload();
  }

  // Data endpoints
  async getOverview() { return this.request('/overview'); }
  async getNotificaciones() { return this.request('/overview/notificaciones'); }
  async getSerenazgo() { return this.request('/seguridad/serenazgo'); }
  async getFiscalizacion() { return this.request('/seguridad/fiscalizacion'); }
  async getAmbiental() { return this.request('/ambiental'); }
  async getRentasRecaudacion() { return this.request('/rentas/recaudacion'); }
  async getRentasFiscTributaria() { return this.request('/rentas/fisc-tributaria'); }
  async getRentasDesarrolloEco() { return this.request('/rentas/desarrollo-eco'); }
  async getUrbano() { return this.request('/urbano'); }
  async getRiesgo() { return this.request('/riesgo'); }
  async getHumano() { return this.request('/humano'); }
  async getHumanoParticipacion() { return this.request('/humano/participacion'); }
  async getHumanoSalud() { return this.request('/humano/salud'); }
  async getHumanoEducacion() { return this.request('/humano/educacion'); }
  async getWhatsapp() { return this.request('/whatsapp'); }
  async getWhatsappStatus() { return this.request('/whatsapp/status'); }
  async getWhatsappFeed(grupo, filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/whatsapp/feed/${grupo}${params ? '?' + params : ''}`);
  }
  async getWhatsappReportes(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/whatsapp/reportes${params ? '?' + params : ''}`);
  }
  async getWhatsappReporte(id) { return this.request(`/whatsapp/reportes/${id}`); }
  async updateReporte(id, data) {
    return this.request(`/whatsapp/reportes/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  }
  async deleteWhatsappPurge(year, month) {
    return this.request(`/whatsapp/purge/${year}/${month}`, { method: 'DELETE' });
  }
  async enviarReporte(data) {
    return this.request('/whatsapp/webhook', { method: 'POST', body: JSON.stringify(data) });
  }
  async getMapaLayers() { return this.request('/mapa/layers'); }
  async getMapaReportes() { return this.request('/mapa/reportes'); }
  async getWhatsappConfig() { return this.request('/whatsapp/config'); }
  async getWhatsappStats() { return this.request('/whatsapp/stats'); }
  async getGruposConectados() { return this.request('/whatsapp/grupos-conectados'); }
  async vincularGrupo(data) {
    return this.request('/whatsapp/vincular', { method: 'POST', body: JSON.stringify(data) });
  }

  // Equipo
  async getEquipo() { return this.request('/equipo/personal'); }
  async getUsuarioReportes(id) { return this.request(`/equipo/personal/${id}/reportes`); }
  async crearUsuarioEquipo(data) {
    return this.request('/equipo/personal', { method: 'POST', body: JSON.stringify(data) });
  }
  async eliminarUsuarioEquipo(id) {
    return this.request(`/equipo/personal/${id}`, { method: 'DELETE' });
  }
  async getSupervisoresTurno() {
    return this.request('/equipo/supervisores-turno');
  }
  async setSupervisoresTurno(data) {
    return this.request('/equipo/supervisores-turno', { method: 'POST', body: JSON.stringify(data) });
  }
}

export const api = new API();
export default api;