// CultBrand Briefing — Tabla de precios base
// ⚠️ PENDIENTE: rellenar con Pablo antes de implementar Fase 3
// Todos los valores en EUR

export const PRICING = {
  estrategia: {
    base: 0,                    // Consultoría base (diagnóstico + estrategia)
    workshop_presencial: 0,     // Por sesión (½ día o día completo)
    workshop_remoto: 0,         // Por sesión videollamada
    entrevistas_internas: 0,    // Por entrevista (stakeholders)
    focus_group: 0,             // Panel consumidores
    mercados_adicionales: 0     // Por mercado adicional (fuera de España)
  },
  identidad: {
    logo_basico: 0,             // Logotipo + variantes
    identidad_completa: 0,      // Logo + paleta + tipografía + iconografía
    brandbook_completo: 0,      // Manual completo de identidad corporativa
    brandbook_basico: 0,        // Guía básica digital
    naming: 0                   // Proceso de naming (si aplica)
  },
  campana: {
    concepto_creativo: 0,       // Desarrollo de concepto + línea gráfica
    produccion_video_spot: 0,   // Spot completo (rodaje + postproducción)
    produccion_reels: 0,        // Pack de reels (x unidades)
    produccion_foto_dia: 0,     // Shooting fotográfico (por día)
    piezas_digitales_pack: 0,   // Pack de banners/piezas para campaña
    planificacion_medios: 0,    // Planificación + compra de medios (si no hay agencia)
    landing_campana: 0          // Landing page de campaña (Elementor)
  },
  digital: {
    auditoria: 0,               // Auditoría de presencia digital
    setup_perfiles: 0,          // Optimización/creación de perfiles
    gestion_1red: 0,            // Gestión mensual 1 red social
    gestion_2redes: 0,          // Gestión mensual 2 redes
    gestion_3redes: 0,          // Gestión mensual 3+ redes
    paid_social_gestion: 0      // Gestión mensual de paid social (sin inversión)
  },
  contenidos: {
    shooting_medio_dia: 0,      // Shooting fotográfico ½ día
    shooting_dia_completo: 0,   // Shooting fotográfico día completo
    video_reel_unitario: 0,     // Reel individual
    pack_reels_mensual: 0,      // Pack mensual de reels
    diseno_graficos_pack: 0,    // Pack mensual de piezas de diseño
    ilustracion: 0,             // Por ilustración
    suite_ia_mensual: 0         // Generación de imágenes con IA (mensual)
  },
  multiplicadores: {
    sprint_urgente: 1.30,       // +30% si el cliente selecciona sprint
    internacional: 1.15,        // +15% si opera en mercados fuera de España
    sin_material_propio: 1.00   // A determinar según proyecto
  }
};

export default PRICING;
