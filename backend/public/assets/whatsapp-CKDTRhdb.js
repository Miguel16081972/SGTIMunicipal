const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/maps-Cad17YoV.js","assets/rolldown-runtime-WNZMJCWm.js","assets/api-4BY-EIOA.js"])))=>i.map(i=>d[i]);
import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./api-4BY-EIOA.js";import{n,t as r}from"./preload-helper-B--W30Oa.js";var i=e({cambiarEstadoReporte:()=>m,cerrarReporteModal:()=>g,checkWspConnection:()=>f,currentWspGroup:()=>a,filtrarReportes:()=>_,getWspFeeds:()=>s,guardarUbicacion:()=>x,loadReportes:()=>p,refreshReportes:()=>v,renderWspFeed:()=>c,startAutoRefresh:()=>b,switchWspGroup:()=>l,switchWspTab:()=>u,verReporte:()=>h}),a=`municipal`,o={municipal:[],seguridad:[],ambiental:[],rentas:[],urbano:[],humano:[],participacion:[],opc:[],demuna:[],ciam:[],omaped:[],otros:[]};function s(){return o}async function c(e){a=e;let n=document.getElementById(`wsp-feed`),r=document.getElementById(`wsp-feed-title`);if(!n)return;document.querySelectorAll(`.wsp-card`).forEach(e=>e.style.borderColor=``);let i=document.getElementById(`wsp-btn-${e}`);i&&(i.style.borderColor=`var(--blue)`),r.textContent=`Feed — ${{municipal:`Gerencia Municipal`,seguridad:`Seguridad Ciudadana`,ambiental:`Desarrollo Ambiental`,rentas:`Rentas`,urbano:`Desarrollo Urbano`,humano:`Desarrollo Humano`,participacion:`Participación Vecinal`,opc:`OPC`,demuna:`DEMUNA`,ciam:`CIAM`,omaped:`OMAPED`,otros:`Otros`}[e]||e}`;let s=document.getElementById(`filter-from`)?.value,c=document.getElementById(`filter-to`)?.value;try{let{reportes:r}=await t.getWhatsappReportes({grupo:e,limit:50,from:s,to:c});if(o[e]=r||[],n.innerHTML=``,o[e].length===0){n.innerHTML=`<div style="text-align:center;padding:40px;color:var(--text-dim)">No hay mensajes recientes en este grupo</div>`;return}o[e].forEach(e=>{let t=document.createElement(`div`);t.className=`feed-item`,t.innerHTML=`
        <div class="fi-header">
          <div style="display:flex;align-items:center;gap:8px">
            <div class="fi-avatar">${(e.reportadoPor||`?`).charAt(0)}</div>
            <div>
              <div class="fi-user">${e.reportadoPor}</div>
              <div class="fi-time">${new Date(e.fecha).toLocaleString()}</div>
            </div>
          </div>
          <span class="badge ${e.estado===`atendido`?`badge-green`:e.estado===`en_proceso`?`badge-amber`:`badge-red`}">${e.estado.toUpperCase()}</span>
        </div>
        <div class="fi-body">${e.mensaje}</div>
        ${e.ubicacion?`<div class="fi-loc">📍 ${e.ubicacion}</div>`:``}
        <div class="fi-actions">
           <button class="btn btn-ghost" style="font-size:10px;padding:2px 8px" onclick="verReporte('${e.id}')">Gestionar →</button>
        </div>
      `,n.appendChild(t)})}catch{n.innerHTML=`<div style="text-align:center;padding:40px;color:var(--red)">Error cargando feed</div>`}}function l(e){c(e),r(()=>import(`./maps-Cad17YoV.js`).then(e=>e.i).then(t=>t.updateWspMapMarkers(e,o)),__vite__mapDeps([0,1,2])).catch(()=>{})}window.switchWspGroup=l;function u(e){document.querySelectorAll(`#tabs-whatsapp .tab`).forEach(e=>e.classList.remove(`active`)),document.querySelectorAll(`#view-whatsapp .tab-content`).forEach(e=>e.classList.remove(`active`));let t=document.querySelector(`#tabs-whatsapp .tab[onclick*="'${e}'"]`),n=document.getElementById(`wsp-tab-${e}`);t&&t.classList.add(`active`),n&&n.classList.add(`active`),e===`conexion`?(f(),d||=setInterval(f,5e3)):d&&=(clearInterval(d),null),e===`reportes`&&v(),r(()=>import(`./maps-Cad17YoV.js`).then(e=>e.i).then(e=>e.initMapWsp()),__vite__mapDeps([0,1,2])).catch(()=>{})}window.switchWspTab=u;var d=null;async function f(){let e=document.getElementById(`wsp-status-container`);if(e)try{let n=await t.getWhatsappStatus();n.isAuthenticated?e.innerHTML=`
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
           <div style="max-height:300px; overflow-y:auto; padding-right:8px;">
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
      `:n.qrCode?e.innerHTML=`
        <div style="background:white;padding:16px;border-radius:12px;margin-bottom:16px; display:inline-block">
          <img src="${n.qrCode}" alt="QR Code" style="display:block;width:200px;height:200px">
        </div>
        <h4 style="font-size:18px;margin-bottom:8px">Escanea el código QR</h4>
        <p style="color:var(--text-dim);font-size:13px">Abre WhatsApp en tu teléfono > Dispositivos vinculados > Vincular un dispositivo.</p>
        <div style="margin-top:16px;font-size:11px;color:var(--amber); animation: pulse 2s infinite">● Esperando escaneo...</div>
      `:e.innerHTML=`
        <div class="spinner" style="margin-bottom:16px"></div>
        <h4 style="font-size:18px;margin-bottom:8px">Iniciando Servidor...</h4>
        <p style="color:var(--text-dim)">Generando nueva sesión de conexión o cargando recursos.</p>
      `}catch{e.innerHTML=`<div style="color:var(--red)">Error al conectar con el servidor de WhatsApp</div>`}}window.desconectarWsp=async()=>{confirm(`¿Deseas cerrar la sesión de WhatsApp?`)&&(await t.request(`/whatsapp/logout`,{method:`POST`}),f())},window.cambiarAreaGrupo=async(e,n,r)=>{try{await t.vincularGrupo({remoteId:e,nombre:n,areaId:r}),f()}catch{alert(`Error al vincular grupo`)}},window.toggleGrupoMonitoreo=async(e,n,r)=>{try{await t.vincularGrupo({remoteId:e,nombre:n,monitoreado:r}),f()}catch{alert(`Error al cambiar estado de monitoreo`)}};async function p(){let e=document.getElementById(`reportes-lista`),n=document.getElementById(`reportes-kpis`);if(e)try{let r=document.getElementById(`rpt-filtro-estado`)?.value||`todos`,i=document.getElementById(`rpt-filtro-grupo`)?.value||`todos`,a=document.getElementById(`rpt-filtro-prioridad`)?.value||`todas`,o=document.getElementById(`filter-from`)?.value,s=document.getElementById(`filter-to`)?.value,{reportes:c,stats:l}=await t.getWhatsappReportes({estado:r,grupo:i,prioridad:a,from:o,to:s}),u=c.filter(e=>e.estado===`nuevo`).length,d=document.getElementById(`reportes-badge`);if(d&&(d.textContent=u,d.style.display=u>0?`inline-block`:`none`),n&&l&&(n.innerHTML=`
        <div class="card card-accent" style="border-left-color:var(--red)"><div class="card-label">Nuevos</div><div class="card-value">${l.nuevo||0}</div></div>
        <div class="card card-accent" style="border-left-color:var(--amber)"><div class="card-label">En Proceso</div><div class="card-value">${l.en_proceso||0}</div></div>
        <div class="card card-accent" style="border-left-color:var(--green)"><div class="card-label">Atendidos</div><div class="card-value">${l.atendido||0}</div></div>
        <div class="card card-accent" style="border-left-color:var(--blue)"><div class="card-label">Total</div><div class="card-value">${c.length}</div></div>
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
    `}catch{e.innerHTML=`<div style="color:var(--red)">Error cargando reportes</div>`}}window.loadReportes=p;async function m(e,r){try{await t.updateReporte(e,{estado:r}),n(`Reporte ${e}: estado cambiado a ${r}`),v()}catch{alert(`Error al actualizar estado`)}}window.cambiarEstadoReporte=m;async function h(e){let r=document.getElementById(`reporte-modal`),i=document.getElementById(`reporte-modal-content`);if(!(!r||!i))try{let a=await t.getWhatsappReporte(e);i.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:16px;">
        <div>
          <h2 style="font-size:20px;margin-bottom:4px">Reporte ${a.idString||a.id}</h2>
          <div style="font-size:12px;color:var(--text-dim)">${new Date(a.fecha).toLocaleString()}</div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:end; gap:8px">
          <span class="status-pill status-${a.estado}" id="modal-status-badge" style="font-size:12px;padding:6px 12px">${a.estado.replace(`_`,` `).toUpperCase()}</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px;">
        <div class="card" style="padding:12px; background:rgba(255,255,255,0.02)">
          <div style="font-size:10px; color:var(--text-muted); font-weight:700; margin-bottom:8px;">DATOS DEL CIUDADANO</div>
          <div style="font-size:13px; margin-bottom:4px">👤 ${a.reportadoPor}</div>
          <div style="font-size:12px; color:var(--blue)">📱 ${a.telefono||`No disponible`}</div>
        </div>
        <div class="card" style="padding:12px; background:rgba(255,255,255,0.02)">
          <div style="font-size:10px; color:var(--text-muted); font-weight:700; margin-bottom:8px;">CLASIFICACIÓN</div>
          <div style="font-size:13px; margin-bottom:4px">📁 Area: ${(a.grupo||`otros`).toUpperCase()}</div>
          <div style="font-size:12px; font-weight:600">🏷️ ${a.categoria||`Sin Clasificar`}</div>
        </div>
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-size:10px; color:var(--text-muted); font-weight:700; margin-bottom:8px;">MENSAJE RECIBIDO</div>
        <div style="padding:12px; background:var(--glass); border-radius:8px; font-size:13px; line-height:1.5; border-left:3px solid var(--blue)">
          ${a.mensaje}
        </div>
      </div>

      <div style="margin-bottom:20px; padding:16px; background:rgba(79,143,247,0.05); border-radius:12px; border:1px solid rgba(79,143,247,0.2)">
        <div style="font-size:10px; color:var(--blue); font-weight:800; margin-bottom:12px;">📍 UBICACIÓN Y GESTIÓN</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
           <div>
             <label style="display:block;font-size:10px;margin-bottom:4px">Dirección:</label>
             <input type="text" class="filter-select" id="edit-ubicacion-${a.id}" value="${a.ubicacion||``}" style="width:100%" placeholder="Ej: Av. Central 123">
           </div>
           <div>
             <label style="display:block;font-size:10px;margin-bottom:4px">Estado del Reporte:</label>
             <select class="filter-select" id="edit-estado-${a.id}" style="width:100%; font-weight:bold; color:var(--blue)">
               <option value="nuevo" ${a.estado===`nuevo`?`selected`:``}>🔴 Nuevo (Sin atender)</option>
               <option value="en_proceso" ${a.estado===`en_proceso`?`selected`:``}>🟡 En Proceso</option>
               <option value="atendido" ${a.estado===`atendido`?`selected`:``}>🟢 Atendido / Finalizado</option>
             </select>
           </div>
        </div>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:12px;">
           <div>
             <label style="display:block;font-size:10px;margin-bottom:4px">Gerencia Responsable:</label>
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
             <label style="display:block;font-size:10px;margin-bottom:4px;color:var(--text-dim)">Pista: Haz clic en el mapa de abajo para fijar coordenadas</label>
             <div style="display:flex; gap:4px">
               <input type="number" step="any" class="filter-select" id="edit-lat-${a.id}" value="${a.lat||``}" style="width:100%" placeholder="Latitud">
               <input type="number" step="any" class="filter-select" id="edit-lng-${a.id}" value="${a.lng||``}" style="width:100%" placeholder="Longitud">
             </div>
           </div>
        </div>
        
        <button class="btn btn-primary" style="width:100%; margin-top:16px; height:44px; font-weight:bold" onclick="guardarUbicacion('${a.id}')">💾 GUARDAR CAMBIOS Y FINALIZAR</button>
      </div>

      <div style="font-size:10px; color:var(--text-dim); margin-bottom:4px">Mapa Interactivo (Haz clic para señalar lugar exacto y obtener dirección)</div>
      <div id="mini-map-${a.id}" style="height:320px; border-radius:12px; margin-bottom:10px; border:1px solid var(--border-light); cursor:crosshair; box-shadow: inset 0 0 10px rgba(0,0,0,0.5)"></div>
    `,r.classList.add(`show`),setTimeout(()=>{let e=parseFloat(a.lat)||-12.0435,t=parseFloat(a.lng)||-77.0955;if(!document.getElementById(`mini-map-${a.id}`))return;let n=L.map(`mini-map-${a.id}`).setView([e,t],16);L.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`,{attribution:`&copy; CARTO`}).addTo(n);let r=null;a.lat&&a.lng&&(r=L.marker([e,t]).addTo(n)),n.on(`click`,async e=>{let{lat:t,lng:i}=e.latlng;document.getElementById(`edit-lat-${a.id}`).value=t.toFixed(6),document.getElementById(`edit-lng-${a.id}`).value=i.toFixed(6),r?r.setLatLng(e.latlng):r=L.marker(e.latlng).addTo(n);try{let e=await(await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${t}&lon=${i}&format=json`)).json();if(e&&e.display_name){let t=e.address,n=`${t.road||``} ${t.house_number||``}${t.suburb?`, `+t.suburb:``}`.trim();document.getElementById(`edit-ubicacion-${a.id}`).value=n||e.display_name}}catch{console.warn(`No se pudo obtener la dirección automática`)}}),setTimeout(()=>n.invalidateSize(),300)},50),n(`Detalle reporte: ${a.id}`)}catch(e){console.error(`Error cargando detalle:`,e),alert(`No se pudo cargar el detalle del reporte.`)}}window.verReporte=h;function g(){document.getElementById(`reporte-modal`).classList.remove(`show`)}window.cerrarReporteModal=g;function _(){p()}window.filtrarReportes=_;async function v(){n(`Reportes: actualización automática/manual`),await p(),a&&(await c(a),r(()=>import(`./maps-Cad17YoV.js`).then(e=>e.i).then(e=>e.updateWspMapMarkers(a,o)),__vite__mapDeps([0,1,2])).catch(()=>{}))}window.refreshReportes=v;var y=!1;function b(){y||(y=!0,setInterval(()=>{v()},1e4))}async function x(e){try{let i=document.getElementById(`edit-lat-${e}`).value,s=document.getElementById(`edit-lng-${e}`).value,c=document.getElementById(`edit-ubicacion-${e}`).value,l=document.getElementById(`edit-grupo-${e}`).value,u=document.getElementById(`edit-estado-${e}`).value;await t.updateReporte(e,{lat:i?parseFloat(i):null,lng:s?parseFloat(s):null,ubicacion:c,grupo:l,estado:u}),n(`Reporte ${e}: ubicación y estado (${u}) actualizados.`),g(),await v(),r(()=>import(`./maps-Cad17YoV.js`).then(e=>e.i).then(e=>{e.updateWspMapMarkers(a,o)}),__vite__mapDeps([0,1,2])).catch(()=>{})}catch(e){console.error(`Error guardando ubicacion:`,e),alert(`Error al guardar los cambios.`)}}window.guardarUbicacion=x,window.exportarMantenimiento=async function(){let e=document.getElementById(`mnt-mes`).value,r=document.getElementById(`mnt-anio`).value,i=`/api/whatsapp/export/${r}/${e}`;try{let a=await fetch(i,{headers:{Authorization:`Bearer ${t.getToken()}`}});if(!a.ok)throw Error(`No hay datos para este periodo o error en servidor`);let o=await a.blob(),s=window.URL.createObjectURL(o),c=document.createElement(`a`);c.href=s,c.download=`Respaldo_SGTI_${r}_${e}.csv`,document.body.appendChild(c),c.click(),c.remove(),n(`Respaldo descargado: ${e}/${r}`)}catch(e){alert(e.message)}},window.limpiarMantenimiento=async function(){let e=document.getElementById(`mnt-mes`).value,r=document.getElementById(`mnt-anio`).value;if(!document.getElementById(`mnt-confirm`).checked){alert(`Debes marcar la casilla de confirmación antes de eliminar.`);return}if(confirm(`¿ESTÁS SEGURO? Esta acción eliminará PERMANENTEMENTE todas las incidencias de ${e}/${r} de la base de datos.`))try{let i=await t.deleteWhatsappPurge(r,e);alert(i.message),n(`Limpieza de base de datos ejecutada: ${e}/${r}`),v()}catch(e){alert(`Error al limpiar: `+e.message)}},window.limpiarDemo=async function(){if(confirm(`¿Deseas eliminar los reportes de prueba antiguos y limpiar las tablas de demostración?

Solo se mantendrán los reportes generados hoy.`))try{let e=await t.request(`/whatsapp/cleanup-demo`,{method:`DELETE`});alert(e.message),n(`Limpieza de datos demo ejecutada`),v()}catch(e){alert(`Error al limpiar demo: `+e.message)}};export{s as a,b as c,h as d,i as f,_ as i,l,g as n,v as o,a as r,c as s,m as t,u};