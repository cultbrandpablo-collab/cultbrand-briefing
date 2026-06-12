# CultBrand Briefing App — Documentación para Codex

## Resumen del proyecto

Aplicación web estática (HTML/CSS/JS vanilla) que permite a CultBrand:
1. Crear fichas de clientes y configurar qué módulos de briefing verán
2. Generar un enlace único por cliente con los datos codificados en la URL
3. El cliente rellena su formulario personalizado desde cualquier dispositivo
4. Panel de admin muestra el estado de cada proyecto (Enviado / Recibido)

**Pendiente de implementar:** backend real, login y persistencia multiusuario.

**Novedades (junio 2026):**
- **Enlace de respuestas (cierra el bucle sin backend):** al enviar el briefing, el cliente recibe un enlace comprimido `#respuesta/…` (deflate + base64url, ~1-2 KB) que puede mandar por email o WhatsApp con un clic. Al abrirlo, el panel importa el briefing automáticamente. También puede descargar una copia `.json`.
- **Importar respuestas:** botón en el panel para pegar un enlace de respuestas o un `.json` y volcarlo al proyecto correspondiente (crea el proyecto si no existe).
- **Envío automático opcional:** constante `FORM_ENDPOINT` al inicio del script. Si se configura con un endpoint de Formspree, el briefing también se envía por email al enviarse.
- **Gestión de proyectos completa:** editar ficha, duplicar y eliminar (con confirmación) desde la tabla.
- **9 estados de proyecto** editables desde la tabla: Borrador → Enviado → Recibido → Propuesta → Propuesta enviada → Aceptada → En producción → Entregada → Archivada.
- **Búsqueda y filtro por estado** en el panel; deadline visible por fila con aviso de vencimiento.
- **Backup / Restaurar:** exportación e importación de todos los proyectos en JSON (fusiona por id).
- **Historial de actividad** por proyecto (creación, briefing, propuesta, cambios de estado), visible en el modal Resumen.
- **Validación de email** en la ficha de cliente.
- **Exportación con botón Imprimir / Guardar PDF** integrado en la propuesta HTML (oculto al imprimir).
- **Seguridad de vistas:** el cliente real ya no ve el botón "Volver al panel" tras enviar.

**Nuevo MVP incluido:** generación asistida de propuesta desde briefing recibido. La app crea un borrador editable con lectura del reto, alcance, servicios, timing, condiciones e inversión estimada.

---

## Archivos del proyecto

| Archivo | Descripción |
|---|---|
| `cultbrand-briefing.html` | App completa (HTML + CSS + JS en un solo archivo) |
| `modules.config.js` | Módulos y preguntas exportados como ES6 module |
| `README.md` | Este documento |
| `PRD.md` | Product Requirements Document completo |

---

## Stack técnico

- **HTML5** semántico, sin frameworks
- **CSS** con custom properties (design tokens), light/dark mode, Manrope via Google Fonts
- **JavaScript** vanilla ES6+, sin dependencias externas
- **Routing:** hash-based (`#briefing/<base64payload>`)
- **Estado:** in-memory (array `projects[]`), sin localStorage ni backend
- **Fuentes:** Manrope (Google Fonts), todos los pesos 300–800

---

## Design System — CultBrand

### Paleta (CULTBRAND v5)

```css
--color-offwhite:  #F8FAFB
--color-dark-blue: #051216
--color-med-blue:  #103548
--color-high-lima: #DBFB54
--color-low-lima:  #F6FFC0
--color-ink:       #0B1A1F
--color-body:      #1A2D33
--color-grafito-2: #5A767A
--color-on-dark:   #E8EEF0
--color-box:       #EDF1F3
--color-sep:       #DCE3E5
```

### Tema claro

```css
--color-bg:        #F8FAFB
--color-surface:   #ffffff
--color-text:      #0B1A1F
--color-text-muted: #5A767A
```

### Tipografía

- **Familia:** Manrope (Google Fonts) — pesos 400 y 500
- **Escala fluida** con `clamp()`:
  ```css
  --text-xs:   clamp(.7rem,  .65rem + .2vw,  .8rem)
  --text-sm:   clamp(.8rem,  .75rem + .25vw, .9rem)
  --text-base: clamp(.9rem,  .85rem + .25vw, 1rem)
  --text-md:   clamp(1rem,   .9rem  + .4vw,  1.15rem)
  --text-lg:   clamp(1.1rem, .9rem  + .8vw,  1.5rem)
  --text-xl:   clamp(1.4rem, 1rem   + 1.5vw, 2.2rem)
  --text-2xl:  clamp(2rem,   1.2rem + 3vw,   3.5rem)
  ```
- **Letter-spacing:** `0`
- **Headings:** `font-weight: 500`

### Elementos de marca

- Corchetes `[ ]` como elemento gráfico decorativo (presente en botones, tags, vacíos)
- Iconos de módulo: caracteres tipográficos `◎ ▣ ↗ ◈ ⬡` (no emojis)
- Logo: SVG inline — círculo con punto central sobre fondo de color primario
- Border-radius contenido: `--radius-sm: 3px`, `--radius-md: 6px`, `--radius-lg: 10px`
- Transiciones: `160ms cubic-bezier(0.16, 1, 0.3, 1)`

---

## Arquitectura de la app

### Vistas (views)

```
#view-admin     → Panel del configurador (Pablo)
#view-client    → Formulario del cliente (enlace)
#view-proposal  → Configurador editable de propuesta
#view-thankyou  → Pantalla de confirmación post-envío
```

Activación mediante clase `.active` y función `showView(id)`.

### Routing

- Hash-based: `cultbrand-briefing.html#briefing/<base64>`
- El payload es un objeto JSON con los datos del proyecto, codificado en Base64
- `generateLink(pid)` → codifica el proyecto en la URL
- `handleHash()` → decodifica al cargar y llama a `loadClient(project)`
- Esto permite que el enlace funcione en cualquier sesión/dispositivo sin backend

```js
// Codificación
const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));

// Decodificación
const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
```

### Estado

```js
let projects = [];        // Array de proyectos en memoria
let currentProjectId;     // ID del proyecto activo en vista cliente
```

Estructura de un proyecto:
```js
{
  id: 'p_1234567890',
  empresa: 'Nombre empresa',
  contacto: 'Nombre contacto',
  cargo: 'Director de Marketing',
  email: 'contacto@empresa.com',
  telefono: '+34 600 000 000',
  proyecto: 'Nombre del proyecto',
  fecha: '2026-06-10',
  deadline: '2026-06-20',
  notas: 'Notas internas (no visibles al cliente)',
  modules: ['estrategia', 'identidad', 'campana', 'digital', 'contenidos'],
  status: 'sent' | 'received' | 'draft',
  createdAt: '10/6/2026'
}
```

---

## Módulos disponibles

| Key | Label | Icon | Nº preguntas |
|---|---|---|---|
| `estrategia` | Consultoría estratégica de marca | ◎ | 14 |
| `identidad` | Identidad visual y Brand Book | ▣ | 11 |
| `campana` | Campaña de publicidad | ↗ | 12 |
| `digital` | Redes sociales y presencia digital | ◈ | 8 |
| `contenidos` | Producción de contenidos | ⬡ | 10 |

Cada módulo incluye al final:
- Selector de urgencia (Sin urgencia / 1-3 meses / Próximas semanas / Sprint urgente)
- Aviso automático de incremento de precio si selecciona Sprint
- Campo de comentarios libres

### Tipos de pregunta

```js
{ type: 'text' }      // Input de una línea
{ type: 'textarea' }  // Área de texto libre
{ type: 'radio' }     // Selección única (choice items)
{ type: 'check' }     // Selección múltiple (choice items)
```

Los `choice-item` son `<div role="radio|checkbox">` — **sin `<input>` nativo** para evitar el doble disparo del evento en labels.
Gestión de eventos mediante **delegación** en `document` y `client-body`.

---

## Flujo de usuario

### Admin (Pablo)

1. Abre el HTML en el navegador → panel de proyectos
2. `[ + Nuevo proyecto ]` → modal con ficha cliente + selector de módulos
3. Selecciona módulos (toggle `.selected`)
4. "Crear proyecto" → valida campos → codifica en URL → muestra enlace
5. Copia enlace → lo envía al cliente por email/WhatsApp
6. Desde la tabla: "Ver briefing" (preview) o "Copiar enlace"
7. Cuando el cliente envía → estado cambia a "Recibido"

### Cliente

1. Abre el enlace → `handleHash()` decodifica → `loadClient(project)`
2. Ve mensaje de bienvenida personalizado con su nombre
3. Rellena los módulos asignados (solo los que Pablo seleccionó)
4. Barra de progreso en tiempo real (% de campos completados)
5. Al final de cada módulo: urgencia + comentarios
6. "Enviar briefing →" → `submitBriefing()` → pantalla de gracias

---

## Funciones principales

```js
// Admin
openNewProject()          // Abre modal limpio
toggleModule(card)        // Selecciona/deselecciona módulo
createProject()           // Valida + crea proyecto + genera enlace
generateLink(pid)         // Codifica proyecto en URL hash
renderTable()             // Renderiza tabla de proyectos
copyProjectLink(pid)      // Copia enlace al clipboard
previewProject(pid)       // Vista previa del briefing (modo admin)
generateProposal(pid)     // Crea borrador de propuesta desde briefing
openProposal(pid)         // Abre configurador editable
exportCurrentProposal()   // Exporta propuesta HTML imprimible

// Cliente
loadClient(project, isPreview) // Construye y muestra el formulario
buildModule(mod, key, num)     // HTML de un módulo completo
buildQ(q, key)                 // HTML de una pregunta
handleChoiceClick(e)           // Delegación click para radio/check
setUrgency(btn, key, level)    // Gestiona selector de urgencia
updateProgress()               // Actualiza barra de progreso
submitBriefing()               // Envío + cambio de estado

// Routing
handleHash()              // Lee URL y decide qué vista mostrar
showView(id)              // Activa una vista
goBackToAdmin()           // Vuelve al panel desde preview

// Utils
showToast(msg)            // Notificación temporal
```

---

## Lo que falta por implementar (roadmap)

### Fase 2 — Recepción de datos (PRIORIDAD)

**Integración con Formspree**
- Cuenta: `cultbrand.alicia@gmail.com`
- Endpoint: `https://formspree.io/f/XXXXXXXX` (pendiente de crear)
- En `submitBriefing()`, antes de mostrar la pantalla de gracias, hacer un `fetch POST` con todos los campos del formulario como FormData o JSON
- Formspree reenvía el briefing completo al email configurado

```js
// Esquema de implementación en submitBriefing()
async function submitBriefing() {
  const data = collectFormData(); // recorre todos los inputs/choices
  await fetch('https://formspree.io/f/XXXXXXXX', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });
  // cambiar estado + mostrar gracias
}
```

### Fase 3 — Generador de propuestas/presupuestos

El flujo deseado:
```
Briefing recibido
    → Motor de análisis lee las respuestas
    → Detecta servicios requeridos + alcance + urgencia
    → Genera borrador de propuesta con partidas y orientación de precio
    → Pablo revisa y ajusta
    → Exporta en PDF
```

**Lógica de detección:**
- Si módulo `estrategia` + workshop presencial → suma partida "Workshop on-site (X sesiones)"
- Si módulo `identidad` + "Manual completo" → precio tier alto
- Si urgencia = sprint → +30% sobre base
- Si mercados = internacional → considera adaptaciones de idioma
- Si `campana` + "Producción desde cero" → suma partida de producción
- Si `contenidos` + IA generativa + "sin restricciones" → ofrece suite IA

**Tabla de precios base** (a definir con Pablo):
```js
const PRICING = {
  estrategia: { base: 0, workshop_presencial: 0, entrevistas: 0, ... },
  identidad:  { base: 0, brandbook_completo: 0, ... },
  campana:    { base: 0, produccion_video: 0, ... },
  digital:    { base_mensual: 0, ... },
  contenidos: { shooting_dia: 0, ... }
}
```

---

## Restricciones técnicas conocidas

- **Sin localStorage** — la app corre en iframe sandboxed que bloquea storage. Todo el estado es in-memory
- **Sin backend** — archivo HTML estático. Los datos no persisten entre sesiones del admin
- **El enlace del cliente es autosuficiente** — lleva los datos del proyecto codificados en el hash, no depende de la sesión del admin
- **Web no incluida** — CultBrand trabaja con Elementor (WordPress). No se gestiona desde esta app
- **Formatos de entrega** — el módulo de identidad pregunta por AI/Figma/PDF, pero CultBrand trabaja en Elementor para web; no incluir opción de "desarrollo web a medida"

---

## Referencias de marca

- Web: https://cultbrand.es
- Servicios: https://cultbrand.es/servicios/
- Soluciones: https://cultbrand.es/soluciones/
- Email operativo: pablo@cultbrand.es
- Ubicación: Valencia, España
- Tipografía: Manrope (Google Fonts)
- Estética: dark editorial, fondo casi negro, texto crema, corchetes como elemento gráfico
