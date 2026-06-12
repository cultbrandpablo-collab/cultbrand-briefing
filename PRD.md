# PRD — CultBrand Briefing App

**Producto:** Configurador de briefings para clientes de CultBrand  
**Propietario:** Pablo / CultBrand (Valencia, España)  
**Estado:** MVP funcional con propuesta asistida. Backend pendiente.  
**Stack:** HTML + CSS + JS vanilla. Sin frameworks. Sin backend.

---

## Problema que resuelve

CultBrand recibe proyectos de varios tipos (consultoría de marca, identidad visual, campañas, redes sociales, contenidos). Antes de preparar una propuesta necesita información estructurada del cliente. Actualmente ese proceso es manual y desordenado.

Esta app permite:
- Configurar un briefing personalizado por cliente en 2 minutos
- Enviarle un enlace con solo las preguntas relevantes a su proyecto
- Recibir la información estructurada y lista para preparar una propuesta
- Generar un borrador editable de propuesta a partir del briefing recibido
- Ajustar alcance, fases, condiciones e inversión antes de exportar

---

## Usuarios

| Usuario | Rol | Acceso |
|---|---|---|
| Pablo (CultBrand) | Admin / configurador | Panel completo |
| Cliente | Respondiente | Solo su formulario (vía enlace) |

---

## Servicios de CultBrand (scope del briefing)

1. **Consultoría estratégica de marca** — posicionamiento, arquitectura, propuesta de valor
2. **Identidad visual y Brand Book** — logo, paleta, tipografía, manual de marca
3. **Campaña de publicidad** — concepto creativo, medios, producción de piezas
4. **Redes sociales y presencia digital** — gestión de canales, contenido orgánico/paid
5. **Producción de contenidos** — fotografía, vídeo, diseño gráfico, IA generativa

> ⚠️ Web/desarrollo NO incluido. CultBrand trabaja exclusivamente con Elementor (WordPress). No ofrecer ni preguntar por desarrollo a medida.

---

## Requisitos funcionales

### RF-01: Ficha de cliente (admin)
- Campos: empresa*, contacto*, cargo, email*, teléfono, nombre proyecto, fecha envío, deadline respuesta, notas internas
- Las notas internas NO son visibles para el cliente
- Validación: empresa + contacto + email obligatorios

### RF-02: Selector de módulos (admin)
- 5 módulos disponibles: estrategia, identidad, campana, digital, contenidos
- Selección múltiple, mínimo 1 requerido
- Visual: cards con toggle (selected/unselected)

### RF-03: Generación de enlace
- El enlace codifica el payload del proyecto en Base64 dentro del hash URL
- Funciona en cualquier sesión/dispositivo sin depender del estado del admin
- Copiable con un click (clipboard API con fallback modal)

### RF-04: Vista del cliente
- Muestra solo los módulos seleccionados por el admin
- Mensaje de bienvenida personalizado con el nombre del contacto
- Barra de progreso en tiempo real
- Botón "Volver al panel" solo visible en modo preview (admin)

### RF-05: Preguntas
- Tipos: texto libre, textarea, radio (única), check (múltiple)
- Los choice-items son divs con role ARIA — sin inputs nativos
- Gestión de eventos por delegación (no onclick inline en items)

### RF-06: Footer de módulo
- Selector de urgencia: Sin urgencia / 1-3 meses / Próximas semanas / Sprint urgente
- Si Sprint: mostrar aviso de posible incremento de honorarios
- Campo de comentarios libres por módulo

### RF-07: Envío
- Botón "Enviar briefing" al final de todos los módulos
- Al enviar: estado del proyecto → "Recibido", mostrar pantalla de gracias
- Pantalla de gracias: mensaje cálido + datos de contacto de CultBrand

### RF-08: Panel de proyectos
- Tabla con: cliente, proyecto, módulos (iconos), fecha, estado, acciones
- Acciones por proyecto: "Copiar enlace" y "Ver briefing"
- Estado: Borrador / Enviado / Recibido (badges)
- Estado vacío con CTA a crear primer proyecto

### RF-09: Tema claro/oscuro
- Dark mode por defecto (identidad CultBrand)
- Toggle en header, respeta `prefers-color-scheme` como fallback
- Sin localStorage — estado en variable JS

### RF-10: Propuesta asistida
- Al recibir un briefing, el panel interno permite generar un borrador de propuesta
- El sistema mapea módulos del briefing a bloques comerciales
- El borrador incluye lectura del reto, objetivo, enfoque, servicios, entregables, timing, revisiones, exclusiones e inversión
- La propuesta es editable antes de exportarse
- La exportación genera un HTML imprimible con diseño CULTBRAND

---

## Requisitos no funcionales

- **Sin dependencias externas** de JS (solo Google Fonts CDN)
- **Responsive** desde 375px
- **Sin localStorage / sessionStorage** (iframe sandboxed)
- **Un solo archivo HTML** — portable, sin build process
- **Accesibilidad:** roles ARIA en choice items, focus-visible, keyboard nav

---

## Fase 2 — Recepción de datos por email

**Objetivo:** que cada briefing enviado llegue a `cultbrand.alicia@gmail.com`

**Solución elegida:** Formspree

**Implementación:**
1. Crear cuenta en formspree.io con `cultbrand.alicia@gmail.com`
2. Crear formulario → obtener endpoint `https://formspree.io/f/XXXXXXXX`
3. En `submitBriefing()`, recoger todos los valores del formulario y hacer POST a Formspree
4. Formspree envía email con todos los campos estructurados

**Función `collectFormData()`** (a implementar):
- Recorre todos los `.q-input` y `.q-textarea` → recoge valores
- Recorre todos los `[data-type="radio"]` → recoge el `.choice-item.checked`
- Recorre todos los `[data-type="check"]` → recoge todos los `.choice-item.checked`
- Recoge los comentarios de cada módulo (`#com-{key}`)
- Recoge la urgencia seleccionada por módulo
- Añade metadata: empresa, contacto, email, proyecto, fecha

---

## Fase 3 — Generador de propuestas avanzado

**Objetivo:** evolucionar el generador actual a un motor persistente con pricing real, versiones, PDF final y enlace privado para cliente.

**Motor de lógica:**
- Lee las respuestas guardadas en el proyecto
- Cruza con tabla de precios base (`PRICING` object, a calibrar con Pablo)
- Detecta: qué servicios, qué alcance (creación vs evolución), qué metodología, qué urgencia, cuántos mercados
- Genera líneas de propuesta con descripción + precio orientativo
- Aplica multiplicadores: sprint +30%, internacional +X%, etc.

**Output:**
- Vista "Propuesta" dentro del panel del admin
- Secciones: introducción, desglose de servicios, metodología, timing, inversión total
- Editable antes de exportar
- Exportación PDF (usando `window.print()` con estilos @media print, o librería jsPDF)

**Tabla de precios** (a rellenar con Pablo antes de implementar):
```js
const PRICING = {
  estrategia: {
    base: 0,
    workshop_presencial: 0,    // por sesión
    workshop_remoto: 0,
    entrevistas: 0,            // por entrevista
    focus_group: 0,
    mercado_internacional: 0   // % adicional
  },
  identidad: {
    base_logo: 0,
    brandbook_completo: 0,
    brandbook_basico: 0,
    naming: 0
  },
  campana: {
    concepto_creativo: 0,
    produccion_video: 0,       // por pieza
    produccion_foto: 0,        // por día
    piezas_digitales: 0,       // por pack
    planificacion_medios: 0    // si no hay agencia de medios
  },
  digital: {
    gestion_mensual: 0,        // por red social
    paid_social: 0,            // gestión mensual
    auditoria: 0
  },
  contenidos: {
    shooting_dia: 0,
    video_reel: 0,             // por pieza
    diseno_grafico: 0,         // por pieza
    suite_ia: 0                // mensual
  },
  multiplicadores: {
    sprint: 1.30,              // +30%
    mercado_internacional: 1.15
  }
}
```

---

## Estructura de archivos recomendada para Codex

```
cultbrand-briefing/
├── index.html                  ← Entry point (renombrar cultbrand-briefing.html)
├── modules.config.js           ← Módulos y preguntas (ES6 module)
├── pricing.config.js           ← Tabla de precios (a crear en Fase 3)
├── README.md                   ← Documentación técnica
├── PRD.md                      ← Este documento
└── assets/
    └── (imágenes si se añaden)
```

Para Codex se recomienda separar el JS del HTML en archivos independientes:
- `app.js` — lógica principal (state, routing, render)
- `admin.js` — funciones del panel admin
- `client.js` — funciones de la vista cliente
- `styles.css` — todos los design tokens y estilos
- `index.html` — solo estructura HTML + imports

---

## Contexto adicional

- **CultBrand** es una agencia creativa especializada en branding, creatividad y estrategia digital
- Ubicación: Valencia, España
- Web: cultbrand.es
- Trabaja con Elementor/WordPress — no ofrecer desarrollo a medida
- Tipografía de marca: **Manrope** (Google Fonts)
- Estética CULTBRAND v5: dark blue `#051216`, med blue `#103548`, offwhite `#F8FAFB` y acento lima `#DBFB54`
- Tono de comunicación: directo, profesional, sin adornos. Nada genérico.
