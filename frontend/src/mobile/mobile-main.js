import './mobile.css';
import api from '../js/api.js';
import { generateReportesPdf } from '../js/pdf.js';

// DOM Elements
const screenLogin = document.getElementById('mobile-login');
const screenApp = document.getElementById('mobile-app');
const loginForm = document.getElementById('mobile-login-form');
const loginError = document.getElementById('m-login-error');
const userBadge = document.getElementById('user-badge');
const groupSelect = document.getElementById('m-group-select');
const feedContainer = document.getElementById('m-feed-container');

// Profile Elements
const pName = document.getElementById('p-name');
const pRole = document.getElementById('p-role');
const pAvatar = document.getElementById('p-avatar');

// Navegación (Actualizado para refrescar fecha)
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Update active state
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Switch view
    const target = btn.dataset.target;
    document.querySelectorAll('.m-view').forEach(v => v.classList.remove('active'));
    document.getElementById(target).classList.add('active');

    // Si entra a reportes, forzar actualización de fecha
    if (target === 'm-view-reports') {
      updateWeeklyDisplay();
    }
  });
});

// Boot
window.addEventListener('DOMContentLoaded', () => {
  updateWeeklyDisplay();
  initMobile();
});

// App Initialization
async function initMobile() {
  if (api.isAuthenticated()) {
    const user = api.getUser();
    if (!user) {
      api.clearToken();
      showScreen('login');
      return;
    }
    setupUserSession(user);
    showScreen('app');
    loadFeed(user.gerencia === 'all' ? 'municipal' : user.gerencia);
  } else {
    showScreen('login');
  }
}

function showScreen(screen) {
  screenLogin.classList.remove('active');
  screenApp.classList.remove('active');
  if (screen === 'login') screenLogin.classList.add('active');
  if (screen === 'app') screenApp.classList.add('active');
}

function setupUserSession(user) {
  userBadge.textContent = user.gerencia.toUpperCase();
  pName.textContent = user.nombre;
  pRole.textContent = `Gerencia: ${user.gerencia}`;
  pAvatar.textContent = user.nombre.charAt(0).toUpperCase();

  // Elementos de Navegación
  const navFeed = document.getElementById('m-nav-feed');
  const navEquipo = document.getElementById('m-nav-equipo');

  // Lógica de Interfaz por Rol
  if (user.rol === 'gerente') {
    // Si es gerente, ocultar feed y mostrar equipo
    if (navFeed) navFeed.style.display = 'none';
    if (navEquipo) navEquipo.style.display = 'flex';
    
    // Cambiar a vista de Informes por defecto
    switchMobileView('m-view-reports');
  } else {
    // Si es operador, modo estándar
    if (navFeed) navFeed.style.display = 'flex';
    if (navEquipo) navEquipo.style.display = 'none';
    switchMobileView('m-view-feed');
  }

  // Filter dropdown options based on RBAC
  if (user.gerencia !== 'all' && user.gerencia !== 'municipal') {
    Array.from(groupSelect.options).forEach(opt => {
      if (opt.value !== user.gerencia) {
        opt.style.display = 'none';
      }
    });
    groupSelect.value = user.gerencia;
  }
}

function switchMobileView(targetId) {
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.remove('active');
    if (b.dataset.target === targetId) b.classList.add('active');
  });
  document.querySelectorAll('.m-view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(targetId);
  if (target) target.classList.add('active');
  
  if (targetId === 'm-view-reports') updateWeeklyDisplay();
}

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const u = document.getElementById('m-user').value;
  const p = document.getElementById('m-pass').value;
  const btn = document.getElementById('m-btn-login');
  
  btn.textContent = 'Verificando...';
  loginError.textContent = '';
  
  try {
    const data = await api.login(u, p);
    if (data && data.token) {
      setupUserSession(data.user);
      showScreen('app');
      // No cargar feed si es gerente
      if (data.user.rol !== 'gerente') {
        loadFeed(data.user.gerencia === 'all' ? 'municipal' : data.user.gerencia);
      }
    }
  } catch (error) {
    loginError.textContent = error.message || 'Credenciales incorrectas';
  } finally {
    btn.textContent = 'Ingresar';
  }
});

// --- GESTIÓN DE EQUIPO MÓVIL ---
window.createMobileUser = async () => {
  const nombre = document.getElementById('m-eq-nombre').value;
  const username = document.getElementById('m-eq-user').value;
  const password = document.getElementById('m-eq-pass').value;
  const msg = document.getElementById('m-eq-msg');

  if (!nombre || !username || !password) {
    msg.innerHTML = '<span style="color:var(--danger)">Llene todos los campos</span>';
    return;
  }

  msg.innerHTML = '<span style="color:var(--blue)">⏳ Creando...</span>';

  try {
    // El backend ya toma el rol 'operador' y la gerencia del gerente logueado
    await api.crearUsuarioEquipo({ nombre, username, password, rol: 'operador' });
    msg.innerHTML = '<span style="color:var(--success)">✅ Operador creado con éxito</span>';
    
    // Limpiar campos
    document.getElementById('m-eq-nombre').value = '';
    document.getElementById('m-eq-user').value = '';
    document.getElementById('m-eq-pass').value = '';
    
    setTimeout(() => { msg.innerHTML = ''; }, 3000);
  } catch (err) {
    msg.innerHTML = `<span style="color:var(--danger)">❌ Error: ${err.message}</span>`;
  }
};

// Logout
document.getElementById('btn-logout').addEventListener('click', () => {
  api.clearToken();
  showScreen('login');
});

// Fetch & Render Feed
async function loadFeed(grupo) {
  feedContainer.innerHTML = '<div class="spinner"></div>';
  try {
    const response = await api.getWhatsappFeed(grupo);
    // Backend devuelve { grupo, feed: [...] }
    const feedData = response.feed ? response.feed : (Array.isArray(response) ? response : []);
    renderFeed(feedData);
  } catch (err) {
    if (err.message.includes('Grupo no encontrado') || err.message.includes('404')) {
      renderFeed([]); // Es normal si el grupo no tiene data mockeada
    } else {
      feedContainer.innerHTML = `<p style="text-align:center; color:var(--danger)">Error: ${err.message}</p>`;
    }
  }
}

function renderFeed(messages) {
  if (!messages || messages.length === 0) {
    feedContainer.innerHTML = '<div class="msg-card" style="text-align:center; color:var(--text-dim)">No hay incidencias reportadas en esta área hoy.</div>';
    return;
  }
  
  feedContainer.innerHTML = messages.map(msg => {
    const prioridad = (msg.tags && msg.tags[0]) ? msg.tags[0] : 'Baja';
    let tagHTML = `<span class="tag tag-${prioridad}">${prioridad}</span>`;
    if (msg.category) tagHTML += `<span class="tag tag-area">${msg.category}</span>`;
    
    return `
      <div class="msg-card">
        <div class="msg-header">
          <span style="color:var(--cyan);font-weight:600">👤 ${msg.sender || 'Reporte Anónimo'}</span>
          <span style="color:var(--text-dim)">${msg.time || 'Ahora'}</span>
        </div>
        <div class="msg-body">${msg.body || '📷 Imagen/Documento adjunto'}</div>
        <div class="msg-tags">${tagHTML}</div>
      </div>
    `;
  }).join('');
}

// Feed Controls
document.getElementById('btn-refresh-feed').addEventListener('click', () => {
  loadFeed(groupSelect.value);
});

groupSelect.addEventListener('change', (e) => {
  loadFeed(e.target.value);
});

// --- REPORTES ---
window.generateMobileReport = async () => {
  const user = api.getUser();
  const grupo = (user && user.gerencia !== 'all') ? user.gerencia : 'general';
  await generateReportesPdf(grupo);
};

// --- LÓGICA DE FECHA SEMANAL ---
function updateWeeklyDisplay() {
  const el = document.getElementById('week-range-text');
  if (!el) return;

  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  const fmt = (d) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  el.textContent = `Del ${fmt(lastWeek)} al ${fmt(today)} de ${today.getFullYear()}`;
}

// Report Generation
document.getElementById('btn-generate-pdf').addEventListener('click', () => {
  const user = api.getUser();
  const targetGroup = (user.gerencia === 'all' || user.gerencia === 'municipal') ? 'general' : user.gerencia;
  
  // Make the button indicate processing
  const btn = document.getElementById('btn-generate-pdf');
  const originalText = btn.textContent;
  btn.textContent = '⏳ Generando...';
  btn.disabled = true;
  
  // Wait a small tick so UI updates, then generate (generateReportesPdf blocks thread)
  setTimeout(() => {
    try {
      generateReportesPdf(targetGroup);
    } catch(e) {
      console.error(e);
      alert('Error generando PDF: ' + e.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }, 100);
});

