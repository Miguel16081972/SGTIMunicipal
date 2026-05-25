const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/maps-CAB77BKg.js","assets/rolldown-runtime-WNZMJCWm.js","assets/api-CS2gjh7X.js"])))=>i.map(i=>d[i]);
import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./api-CS2gjh7X.js";import{n,t as r}from"./preload-helper-B--W30Oa.js";var i=e({cambiarEstadoReporte:()=>h,cerrarReporteModal:()=>_,checkWspConnection:()=>p,currentWspGroup:()=>a,filtrarReportes:()=>v,getWspFeeds:()=>s,guardarUbicacion:()=>S,loadReportes:()=>m,refreshReportes:()=>y,refreshWspStats:()=>u,renderWspFeed:()=>c,startAutoRefresh:()=>x,switchWspGroup:()=>l,switchWspTab:()=>d,verReporte:()=>g}),a=`municipal`,o={municipal:[],seguridad:[],ambiental:[],rentas:[],urbano:[],humano:[],participacion:[],opc:[],demuna:[],ciam:[],omaped:[],otros:[]};function s(){return o}async function c(e){a=e,u();let n=document.getElementById(`wsp-feed`),r=document.getElementById(`wsp-feed-title`);if(!n)return;document.querySelectorAll(`.wsp-card`).forEach(e=>e.style.borderColor=``);let i=document.getElementById(`wsp-btn-${e}`);i&&(i.style.borderColor=`var(--blue)`),r.textContent=`Feed — ${{municipal:`Gerencia Municipal`,seguridad:`Seguridad Ciudadana`,ambiental:`Desarrollo Ambiental`,rentas:`Rentas`,urbano:`Desarrollo Urbano`,humano:`Desarrollo Humano`,participacion:`Participación Vecinal`,opc:`OPC`,demuna:`DEMUNA`,ciam:`CIAM`,omaped:`OMAPED`,otros:`Otros`}[e]||e}`;let s=document.getElementById(`filter-from`)?.value,c=document.getElementById(`filter-to`)?.value;try{let r={};s&&(r.from=s),c&&(r.to=c);let{feed:i}=await t.getWhatsappFeed(e,r);if(o[e]=i||[],n.innerHTML=``,o[e].length===0){n.innerHTML=`<div style="text-align:center;padding:40px;color:var(--text-dim)">No hay mensajes recientes en este grupo</div>`;return}o[e].forEach(e=>{console.log(`📸 [FEED IMG DEBUG] ID: ${e.id}, FotoUrl starts with: ${e.fotoUrl?e.fotoUrl.substring(0,30):`NULL`}, Length: ${e.fotoUrl?e.fotoUrl.length:0}`);let t=document.createElement(`div`);t.className=`feed-item`,t.innerHTML=`
        <div class="fi-header">
          <div style="display:flex;align-items:center;gap:8px">
            <div class="fi-avatar">${(e.sender||`?`).charAt(0)}</div>
            <div>
              <div class="fi-user">${e.sender} <span style="font-size:9px; color:var(--text-muted); font-weight:normal; text-transform:uppercase;"> — ${e.category||``}</span></div>
              <div class="fi-time">${e.time}</div>
            </div>
          </div>
          <span class="badge ${e.sentiment===`positivo`?`badge-green`:e.sentiment===`negativo`?`badge-red`:`badge-amber`}">${e.category}</span>
        </div>
        <div class="fi-body">${e.body}</div>
        ${e.fotoUrl&&e.fotoUrl.length>50?`
          <div class="fi-img-wrap" style="margin-top:10px; margin-bottom:12px;">
            <img src="${e.fotoUrl.startsWith(`http`)||e.fotoUrl.startsWith(`data:`)?e.fotoUrl:`data:image/jpeg;base64,`+e.fotoUrl}" 
                 style="width:120px; height:120px; object-fit:cover; border-radius:12px; cursor:zoom-in; border:2px solid var(--blue); box-shadow: 0 4px 15px rgba(0,0,0,0.2)" 
                 onclick="window.open(this.src, '_blank')">
          </div>`:``}
        ${e.ubicacion?`<div class="fi-loc" style="font-size:11px; color:var(--blue); margin-top:6px;">📍 ${e.ubicacion}</div>`:e.body.includes(`📍`)?`<div class="fi-loc">${e.body.split(`📍`)[1]}</div>`:``}
        <div class="fi-actions">
           <button class="btn btn-ghost" style="font-size:10px;padding:2px 8px" onclick="verReporte('${e.id}')">Gestionar →</button>
        </div>
      `,n.appendChild(t)})}catch{n.innerHTML=`<div style="text-align:center;padding:40px;color:var(--red)">Error cargando feed</div>`}}function l(e){c(e),r(()=>import(`./maps-CAB77BKg.js`).then(e=>e.i).then(t=>t.updateWspMapMarkers(e,o)),__vite__mapDeps([0,1,2])).catch(()=>{})}window.switchWspGroup=l;async function u(){try{let e=await t.getWhatsappStats();e&&e.porGerencia&&e.porGerencia.forEach(e=>{let t=document.getElementById(`wsp-count-${e.area}`);t&&(t.textContent=`${e.total||0} msg`)});let n=document.getElementById(`wsp-trending`);n&&e.tendencias&&(n.innerHTML=``,e.tendencias.length===0?n.innerHTML=`<div style="font-size:10px;color:var(--text-muted)">No hay suficientes reportes hoy para marcar tendencias</div>`:e.tendencias.forEach(e=>{let t=document.createElement(`div`);t.className=`trending-tag`;let r=`📢`,i=e.tema.toLowerCase();i.includes(`seguridad`)?r=`🚨`:i.includes(`basura`)||i.includes(`limpieza`)?r=`🗑️`:i.includes(`ruido`)||i.includes(`sonora`)?r=`🔊`:i.includes(`parque`)||i.includes(`ambiental`)?r=`🌿`:i.includes(`pista`)||i.includes(`urbano`)?r=`🏗️`:i.includes(`alumbrado`)||i.includes(`luz`)?r=`💡`:i.includes(`comercio`)||i.includes(`rentas`)?r=`💰`:i.includes(`transito`)||i.includes(`vehiculo`)?r=`🚗`:(i.includes(`animal`)||i.includes(`perro`))&&(r=`🐕`),t.innerHTML=`${r} ${e.tema} <span class="tt-count">${e.total}</span>`,n.appendChild(t)}))}catch(e){console.error(`Error actualizando stats wsp:`,e)}}function d(e){document.querySelectorAll(`#tabs-whatsapp .tab`).forEach(e=>e.classList.remove(`active`)),document.querySelectorAll(`#view-whatsapp .tab-content`).forEach(e=>e.classList.remove(`active`));let t=document.querySelector(`#tabs-whatsapp .tab[onclick*="'${e}'"]`),n=document.getElementById(`wsp-tab-${e}`);t&&t.classList.add(`active`),n&&n.classList.add(`active`),e===`feed`&&u(),e===`conexion`?(p(),f||=setInterval(p,5e3)):f&&=(clearInterval(f),null),e===`reportes`&&y(),r(()=>import(`./maps-CAB77BKg.js`).then(e=>e.i).then(e=>e.initMapWsp()),__vite__mapDeps([0,1,2])).catch(()=>{})}window.switchWspTab=d;var f=null;async function p(){let e=document.getElementById(`wsp-status-container`);if(!e)return;let n=e.querySelector(`.group-mgmt-list`),r=n?n.scrollTop:0;try{let n=await t.getWhatsappStatus();if(n.isAuthenticated){e.innerHTML=`
        <div style="color:var(--green);margin-bottom:16px">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h4 style="font-size:20px;margin-bottom:8px">Conectado con Éxito</h4>
        <p style="color:var(--text-dim)">El bot está activo y procesando mensajes en tiempo real.</p>
        
        <div style="margin-top:24px; font-size:12px; padding:16px; background:rgba(255,255,255,0.05); border-radius:12px; text-align:left;">
           <div style="margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px; font-weight:bold; color:var(--blue); display:flex; justify-content:space-between; align-items:center;">
             <span>📊 Gestión de Grupos Detectados (${n.totalGroups||0})</span>
             <span style="font-size:10px; font-weight:normal; color:var(--text-dim)">${n.monitoredCount||0} activos</span>
           </div>
           <div class="group-mgmt-list" style="max-height:300px; overflow-y:auto; padding-right:8px;">
             ${n.connectedGroups&&n.connectedGroups.length>0?n.connectedGroups.map(e=>`
                  <div class="group-mgmt-item" style="display:flex; align-items:center; gap:12px; margin-bottom:12px; padding:8px; background:rgba(255,255,255,0.02); border-radius:8px; border:1px solid ${e.isMonitored?`rgba(52,211,153,0.2)`:`rgba(255,255,255,0.05)`}">
                    <div style="flex:1">
                      <div style="font-weight:600; font-size:12px; color:var(--text-bright); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${e.name}">${e.name}</div>
                      <div style="font-size:9px; color:var(--text-dim); font-family:monospace;">${e.id}</div>
                    </div>
                    
                    <div style="display:flex; align-items:center; gap:8px">
                      <select class="filter-select" style="font-size:10px; padding:4px 8px; height:auto; width:130px" onchange="cambiarAreaGrupo('${e.id}', '${e.name}', this.value)">
                        <option value="municipal" ${e.area===`municipal`?`selected`:``}>🏢 Ger. Municipal</option>
                        <option value="seguridad" ${e.area===`seguridad`?`selected`:``}>🛡️ Seg. Ciudadana</option>
                        <option value="ambiental" ${e.area===`ambiental`?`selected`:``}>🌿 Des. Ambiental</option>
                        <option value="rentas" ${e.area===`rentas`?`selected`:``}>💰 Rentas</option>
                        <option value="urbano" ${e.area===`urbano`?`selected`:``}>🏗️ Des. Urbano</option>
                        <option value="humano" ${e.area===`humano`?`selected`:``}>👥 Des. Humano</option>
                        <option value="participacion" ${e.area===`participacion`?`selected`:``}>🤝 Part. Vecinal</option>
                        <option value="opc" ${e.area===`opc`?`selected`:``}>🏛️ OPC</option>
                        <option value="demuna" ${e.area===`demuna`?`selected`:``}>⚖️ DEMUNA</option>
                        <option value="ciam" ${e.area===`ciam`?`selected`:``}>👴 CIAM</option>
                        <option value="omaped" ${e.area===`omaped`?`selected`:``}>♿ OMAPED</option>
                        <option value="otros" ${e.area===`otros`||!e.area?`selected`:``}>❓ Otros / Sin Vinc.</option>
                      </select>
                      
                      <button class="btn ${e.isMonitored?`btn-primary`:`btn-ghost`}" 
                              style="font-size:9px; padding:4px 10px; height:auto; min-width:70px; ${e.isMonitored?`background:var(--green); border-color:var(--green)`:``}" 
                              onclick="toggleGrupoMonitoreo('${e.id}', '${e.name}', ${!e.isMonitored})">
                        ${e.isMonitored?`ACTIVO`:`IGNORAR`}
                      </button>
                    </div>
                  </div>
                 `).join(``):`<div style="color:var(--text-dim);text-align:center;padding:20px;">No se detectaron grupos aún. Asegúrate de que el bot esté en grupos de WhatsApp.</div>`}
           </div>
           <div style="margin-top:12px; font-size:9px; color:var(--text-muted); text-align:center;">
             💡 Cambia la gerencia para clasificar reportes o usa el botón para habilitar/deshabilitar el monitoreo.
           </div>
        </div>

        <button class="btn btn-ghost" style="margin-top:24px;color:var(--red)" onclick="desconectarWsp()">Desconectar</button>
      `;let t=e.querySelector(`.group-mgmt-list`);t&&(t.scrollTop=r)}else n.qrCode?e.innerHTML=`
        <div style="background:white;padding:16px;border-radius:12px;margin-bottom:16px; display:inline-block">
          <img src="${n.qrCode}" alt="QR Code" style="display:block;width:200px;height:200px">
        </div>
        <h4 style="font-size:18px;margin-bottom:8px">Escanea el código QR</h4>
        <p style="color:var(--text-dim);font-size:13px">Abre WhatsApp en tu teléfono > Dispositivos vinculados > Vincular un dispositivo.</p>
        <div style="margin-top:16px;font-size:11px;color:var(--amber); animation: pulse 2s infinite">● Esperando escaneo...</div>
      `:e.innerHTML=`
        <div class="spinner" style="margin-bottom:16px"></div>
        <h4 style="font-size:18px;margin-bottom:8px">Iniciando Servidor...</h4>
        <p style="color:var(--text-dim); margin-bottom: 8px;">Generando nueva sesión de conexión o cargando recursos.</p>
        <div style="font-size:11px; color:var(--blue); background:rgba(79,143,247,0.1); padding:8px 12px; border-radius:6px; display:inline-block; border:1px solid rgba(79,143,247,0.2)">
          🤖 <b>Log del Bot:</b> ${n.lastLog||`Iniciando...`}
        </div>
      `}catch{e.innerHTML=`<div style="color:var(--red)">Error al conectar con el servidor de WhatsApp</div>`}}window.desconectarWsp=async()=>{confirm(`¿Deseas cerrar la sesión de WhatsApp?`)&&(await t.request(`/whatsapp/logout`,{method:`POST`}),p())},window.cambiarAreaGrupo=async(e,n,r)=>{try{await t.vincularGrupo({remoteId:e,nombre:n,areaId:r}),p()}catch{alert(`Error al vincular grupo`)}},window.toggleGrupoMonitoreo=async(e,n,r)=>{try{await t.vincularGrupo({remoteId:e,nombre:n,monitoreado:r}),p()}catch{alert(`Error al cambiar estado de monitoreo`)}};async function m(){let e=document.getElementById(`reportes-lista`),n=document.getElementById(`reportes-kpis`);if(e)try{let r=document.getElementById(`rpt-filtro-estado`)?.value||`todos`,i=document.getElementById(`rpt-filtro-grupo`)?.value||`todos`,a=document.getElementById(`rpt-filtro-prioridad`)?.value||`todas`,o=document.getElementById(`filter-from`)?.value,s=document.getElementById(`filter-to`)?.value,{reportes:c,stats:l}=await t.getWhatsappReportes({estado:r,grupo:i,prioridad:a,from:o,to:s}),u=l?l.nuevo:c.filter(e=>e.estado===`nuevo`).length,d=document.getElementById(`reportes-badge`);if(d&&(d.textContent=u,d.style.display=u>0?`inline-block`:`none`),n&&l&&(n.innerHTML=`
        <div class="card card-accent" style="border-left-color:var(--red)"><div class="card-label">Nuevos</div><div class="card-value">${l.nuevo||0}</div></div>
        <div class="card card-accent" style="border-left-color:var(--amber)"><div class="card-label">En Proceso</div><div class="card-value">${l.en_proceso||0}</div></div>
        <div class="card card-accent" style="border-left-color:var(--green)"><div class="card-label">Atendidos</div><div class="card-value">${l.atendido||0}</div></div>
        <div class="card card-accent" style="border-left-color:var(--blue)"><div class="card-label">Total</div><div class="card-value">${l.total||0}</div></div>
      `),c.length===0){e.innerHTML=`<div style="text-align:center;padding:60px;background:var(--glass);border-radius:12px;color:var(--text-dim)">No se encontraron reportes con los filtros seleccionados</div>`;return}e.innerHTML=`
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Mensaje de WhatsApp</th>
              <th>Área / Categoría</th>
              <th>Prioridad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${c.map(e=>`
              <tr class="${e.estado===`nuevo`?`row-new`:``}" onclick="verReporte('${e.id}')" style="cursor:pointer">
                <td style="font-family:monospace;font-size:10px">${e.idString||e.id}</td>
                <td><div style="font-size:11px">${new Date(e.fecha).toLocaleDateString()}</div><div style="font-size:9px;color:var(--text-dim)">${new Date(e.fecha).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`})}</div></td>
                <td><div style="font-size:11px; max-width:320px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--blue)" title="${e.mensaje}">${e.mensaje}</div></td>
                <td>
                  <span class="badge badge-gray" style="font-size:9px">${(e.grupo||`otros`).toUpperCase()}</span>
                  <div style="font-weight:600;font-size:10px;margin-top:2px">${e.categoria||`Sin Clasificar`}</div>
                </td>
                <td><span class="badge ${e.prioridad===`Alta`?`badge-red`:e.prioridad===`Media`?`badge-amber`:`badge-green`}">${e.prioridad}</span></td>
                <td><span class="status-pill status-${e.estado}">${e.estado.replace(`_`,` `)}</span></td>
              </tr>
            `).join(``)}
          </tbody>
        </table>
      </div>
    `}catch{e.innerHTML=`<div style="color:var(--red)">Error cargando reportes</div>`}}window.loadReportes=m;async function h(e,r){try{await t.updateReporte(e,{estado:r}),n(`Reporte ${e}: estado cambiado a ${r}`),y()}catch{alert(`Error al actualizar estado`)}}window.cambiarEstadoReporte=h;async function g(e){let r=document.getElementById(`reporte-modal`),i=document.getElementById(`reporte-modal-content`);if(!(!r||!i))try{let a=await t.getWhatsappReporte(e);i.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div>
          <h2 style="font-size:18px;margin-bottom:2px">Reporte ${a.idString||a.id}</h2>
          <div style="font-size:11px;color:var(--text-dim)">${new Date(a.fecha).toLocaleString()}</div>
        </div>
        <span class="status-pill status-${a.estado}" id="modal-status-badge" style="font-size:11px;padding:5px 10px">${a.estado.replace(`_`,` `).toUpperCase()}</span>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
        <div class="card" style="padding:10px; background:rgba(255,255,255,0.02)">
          <div style="font-size:9px; color:var(--text-muted); font-weight:700; margin-bottom:4px;">DATOS DEL CIUDADANO</div>
          <div style="font-size:12px; margin-bottom:2px">👤 ${a.reportadoPor}</div>
          <div style="font-size:11px; color:var(--blue)">📱 ${a.telefono||`No disponible`}</div>
        </div>
        <div class="card" style="padding:10px; background:rgba(255,255,255,0.02)">
          <div style="font-size:9px; color:var(--text-muted); font-weight:700; margin-bottom:4px;">CLASIFICACIÓN</div>
          <div style="font-size:12px; margin-bottom:2px">📁 Area: ${(a.grupo||`otros`).toUpperCase()}</div>
          <div style="font-size:11px; font-weight:600">🏷️ ${a.categoria||`Sin Clasificar`}</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: ${a.fotoUrl&&a.fotoUrl.length>50?`1fr 200px`:`1fr`}; gap:12px; margin-bottom:12px;">
        <div>
          <div style="font-size:9px; color:var(--text-muted); font-weight:700; margin-bottom:4px;">MENSAJE RECIBIDO</div>
          <div style="padding:10px; background:var(--glass); border-radius:8px; font-size:12px; line-height:1.4; border-left:3px solid var(--blue); height:100%; min-height:60px;">
            ${a.mensaje}
          </div>
        </div>
        ${a.fotoUrl&&a.fotoUrl.length>50?`
        <div>
          <div style="font-size:9px; color:var(--text-muted); font-weight:700; margin-bottom:4px;">EVIDENCIA</div>
          <div style="text-align:center; background:rgba(0,0,0,0.1); border-radius:8px; padding:6px; border:1px solid rgba(255,255,255,0.05)">
            <img src="${a.fotoUrl.startsWith(`http`)||a.fotoUrl.startsWith(`data:`)?a.fotoUrl:`data:image/jpeg;base64,`+a.fotoUrl}" 
                 style="max-width:100%; max-height:160px; border-radius:6px; cursor:zoom-in; box-shadow:0 6px 20px rgba(0,0,0,0.4)" 
                 onclick="window.open(this.src, '_blank')">
          </div>
        </div>
        `:``}
      </div>

      <div style="margin-bottom:12px; padding:12px; background:rgba(79,143,247,0.05); border-radius:10px; border:1px solid rgba(79,143,247,0.2)">
        <div style="font-size:9px; color:var(--blue); font-weight:800; margin-bottom:8px;">📍 UBICACIÓN Y GESTIÓN</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
           <div>
             <label style="display:block;font-size:9px;margin-bottom:2px">Dirección:</label>
             <input type="text" class="filter-select" id="edit-ubicacion-${a.id}" value="${a.ubicacion||``}" style="width:100%" placeholder="Ej: Av. Central 123">
           </div>
           <div>
             <label style="display:block;font-size:9px;margin-bottom:2px">Estado del Reporte:</label>
             <select class="filter-select" id="edit-estado-${a.id}" style="width:100%; font-weight:bold; color:var(--blue)">
               <option value="nuevo" ${a.estado===`nuevo`?`selected`:``}>🔴 Nuevo (Sin atender)</option>
               <option value="en_proceso" ${a.estado===`en_proceso`?`selected`:``}>🟡 En Proceso</option>
               <option value="atendido" ${a.estado===`atendido`?`selected`:``}>🟢 Atendido / Finalizado</option>
             </select>
           </div>
        </div>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:8px;">
           <div>
             <label style="display:block;font-size:9px;margin-bottom:2px">Gerencia Responsable:</label>
             <select class="filter-select" id="edit-grupo-${a.id}" style="width:100%">
               <option value="municipal" ${a.grupo===`municipal`?`selected`:``}>Ger. Municipal</option>
               <option value="seguridad" ${a.grupo===`seguridad`?`selected`:``}>Seg. Ciudadana</option>
               <option value="ambiental" ${a.grupo===`ambiental`?`selected`:``}>Des. Ambiental</option>
               <option value="rentas" ${a.grupo===`rentas`?`selected`:``}>Rentas</option>
               <option value="urbano" ${a.grupo===`urbano`?`selected`:``}>Des. Urbano</option>
               <option value="humano" ${a.grupo===`humano`?`selected`:``}>Des. Humano</option>
               <option value="participacion" ${a.grupo===`participacion`?`selected`:``}>Participación Vecinal</option>
               <option value="opc" ${a.grupo===`opc`?`selected`:``}>OPC</option>
               <option value="demuna" ${a.grupo===`demuna`?`selected`:``}>DEMUNA</option>
               <option value="ciam" ${a.grupo===`ciam`?`selected`:``}>CIAM</option>
               <option value="omaped" ${a.grupo===`omaped`?`selected`:``}>OMAPED</option>
               <option value="otros" ${a.grupo===`otros`?`selected`:``}>Otros</option>
             </select>
           </div>
           <div>
             <label style="display:block;font-size:9px;margin-bottom:2px;color:var(--text-dim)">Coordenadas (Lat/Lng):</label>
             <div style="display:flex; gap:4px">
               <input type="number" step="any" class="filter-select" id="edit-lat-${a.id}" value="${a.lat||``}" style="width:100%" placeholder="Latitud">
               <input type="number" step="any" class="filter-select" id="edit-lng-${a.id}" value="${a.lng||``}" style="width:100%" placeholder="Longitud">
             </div>
           </div>
        </div>
        
        <div style="display:flex; gap:8px; margin-top:10px;">
          <button class="btn btn-primary" style="flex:2; height:36px; font-weight:bold; font-size:11px" onclick="guardarUbicacion('${a.id}')">💾 GUARDAR CAMBIOS</button>
          <button class="btn btn-ghost" style="flex:1; height:36px; font-size:10px; border-color:var(--green); color:var(--green)" onclick="autolocalizarGps('${a.id}')">📍 Autolocalizar GPS</button>
        </div>
      </div>

      <div style="font-size:9px; color:var(--text-dim); margin-bottom:3px">Mapa Interactivo (Haz clic para señalar lugar exacto y obtener dirección)</div>
      <div id="mini-map-${a.id}" style="height:220px; border-radius:10px; margin-bottom:6px; border:1px solid var(--border-light); cursor:crosshair; box-shadow: inset 0 0 10px rgba(0,0,0,0.5)"></div>
    `,r.classList.add(`show`),setTimeout(()=>{let e=parseFloat(a.lat)||-12.0435,t=parseFloat(a.lng)||-77.0955;if(!document.getElementById(`mini-map-${a.id}`))return;let r=L.map(`mini-map-${a.id}`).setView([e,t],17);L.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`,{attribution:`&copy; CARTO`}).addTo(r);let i=null;a.lat&&a.lng&&(i=L.marker([e,t]).addTo(r)),window._currentMiniMap=r,window._currentMarker=i,r.on(`click`,async e=>{await o(a.id,e.latlng.lat,e.latlng.lng,r)});async function o(e,t,n,r){document.getElementById(`edit-lat-${e}`).value=t.toFixed(6),document.getElementById(`edit-lng-${e}`).value=n.toFixed(6),window._currentMarker?window._currentMarker.setLatLng([t,n]):window._currentMarker=L.marker([t,n]).addTo(r);try{let r=await(await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${t}&lon=${n}&format=json&accept-language=es`)).json();if(r&&r.address){let t=r.address,n=``;t.road?(n=t.road,t.house_number&&(n+=` `+t.house_number)):n=t.amenity||t.building||t.pedestrian?t.amenity||t.building||t.pedestrian:r.display_name.split(`,`)[0];let i=t.suburb||t.neighbourhood||t.city_district;i&&!n.includes(i)&&(n+=`, `+i),document.getElementById(`edit-ubicacion-${e}`).value=n}}catch{console.warn(`No se pudo obtener la dirección automática`)}}window.autolocalizarGps=e=>{if(!navigator.geolocation){alert(`Tu navegador no soporta geolocalización`);return}let t=event.target,r=t.textContent;t.textContent=`⌛ Localizando...`,t.disabled=!0,navigator.geolocation.getCurrentPosition(async i=>{let{latitude:a,longitude:s}=i.coords;await o(e,a,s,window._currentMiniMap),window._currentMiniMap.setView([a,s],17),t.textContent=r,t.disabled=!1,n(`GPS: Ubicación capturada para reporte `+e)},e=>{alert(`Error al obtener GPS: `+e.message),t.textContent=r,t.disabled=!1},{enableHighAccuracy:!0,timeout:5e3})},setTimeout(()=>r.invalidateSize(),300)},50),n(`Detalle reporte: ${a.id}`)}catch(e){console.error(`Error cargando detalle:`,e),alert(`No se pudo cargar el detalle del reporte.`)}}window.verReporte=g;function _(){document.getElementById(`reporte-modal`).classList.remove(`show`)}window.cerrarReporteModal=_;function v(){m()}window.filtrarReportes=v;async function y(){n(`Reportes: actualización automática/manual`),await m(),a&&(await c(a),r(()=>import(`./maps-CAB77BKg.js`).then(e=>e.i).then(e=>e.updateWspMapMarkers(a,o)),__vite__mapDeps([0,1,2])).catch(()=>{}))}window.refreshReportes=y;var b=!1;function x(){b||(b=!0,setInterval(()=>{y()},1e4))}async function S(e){try{let i=document.getElementById(`edit-lat-${e}`).value,s=document.getElementById(`edit-lng-${e}`).value,c=document.getElementById(`edit-ubicacion-${e}`).value,l=document.getElementById(`edit-grupo-${e}`).value,u=document.getElementById(`edit-estado-${e}`).value;await t.updateReporte(e,{lat:i?parseFloat(i):null,lng:s?parseFloat(s):null,ubicacion:c,grupo:l,estado:u}),n(`Reporte ${e}: ubicación y estado (${u}) actualizados.`),_(),await y(),r(()=>import(`./maps-CAB77BKg.js`).then(e=>e.i).then(e=>{e.updateWspMapMarkers(a,o)}),__vite__mapDeps([0,1,2])).catch(()=>{})}catch(e){console.error(`Error guardando ubicacion:`,e),alert(`Error al guardar los cambios.`)}}window.guardarUbicacion=S,window.exportarMantenimiento=async function(){let e=document.getElementById(`mnt-mes`).value,r=document.getElementById(`mnt-anio`).value,i=`/api/whatsapp/export/${r}/${e}`;try{let a=await fetch(i,{headers:{Authorization:`Bearer ${t.getToken()}`}});if(!a.ok)throw Error(`No hay datos para este periodo o error en servidor`);let o=await a.blob(),s=window.URL.createObjectURL(o),c=document.createElement(`a`);c.href=s,c.download=`Respaldo_SGTI_${r}_${e}.csv`,document.body.appendChild(c),c.click(),c.remove(),n(`Respaldo descargado: ${e}/${r}`)}catch(e){alert(e.message)}},window.limpiarMantenimiento=async function(){let e=document.getElementById(`mnt-mes`).value,r=document.getElementById(`mnt-anio`).value;if(!document.getElementById(`mnt-confirm`).checked){alert(`Debes marcar la casilla de confirmación antes de eliminar.`);return}if(confirm(`¿ESTÁS SEGURO? Esta acción eliminará PERMANENTEMENTE todas las incidencias de ${e}/${r} de la base de datos.`))try{let i=await t.deleteWhatsappPurge(r,e);alert(i.message),n(`Limpieza de base de datos ejecutada: ${e}/${r}`),y()}catch(e){alert(`Error al limpiar: `+e.message)}},window.limpiarDemo=async function(){if(confirm(`¿Deseas eliminar los reportes de prueba antiguos y limpiar las tablas de demostración?

Solo se mantendrán los reportes generados hoy.`))try{let e=await t.request(`/whatsapp/cleanup-demo`,{method:`DELETE`});alert(e.message),n(`Limpieza de datos demo ejecutada`),y()}catch(e){alert(`Error al limpiar demo: `+e.message)}};export{s as a,x as c,g as d,i as f,v as i,l,_ as n,y as o,a as r,c as s,h as t,d as u};