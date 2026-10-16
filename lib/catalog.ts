// Single source of truth for services shown on the public site.
// Exact prices stay in this file ONLY to compute the public "Desde" value.
// Never render `priceCop` of an individual offer in the UI.

export type Offer = {
  name: string
  summary: string
  /** Exact price in COP. Internal: used only to derive the category "desde". */
  priceCop?: number
}

export type Category = {
  slug: string
  eyebrow: string
  title: string
  description: string
  /** Detail page, when one exists. Otherwise the category lives under /precios#slug. */
  href: string
  offers: Offer[]
  /** Public text about packages, without prices. */
  packagesNote?: string
  /** Cheapest package, used only when the category has no priced single offer. */
  packageFromCop?: number
  /** Shown instead of a price when nothing is confirmed yet. */
  consultNote?: string
}

export const CATALOG: Category[] = [
  {
    slug: 'valoracion-funcional-longevidad',
    eyebrow: 'PUNTO DE PARTIDA',
    title: 'Valoración funcional y longevidad',
    description: 'Datos claros sobre tu fuerza, equilibrio y movilidad para empezar con seguridad.',
    href: '/servicios/valoracion-funcional-longevidad',
    offers: [
      {
        name: 'Valoración funcional del movimiento y longevidad',
        summary: 'Composición corporal, fuerza, equilibrio, resistencia y plan personalizado.',
      },
    ],
    consultNote: 'Consulta la tarifa con el equipo.',
  },
  {
    slug: 'fisioterapia',
    eyebrow: 'FISIOTERAPIA',
    title: 'Fisioterapia y rehabilitación',
    description: 'Sesiones y valoraciones para disminuir el dolor y recuperar función.',
    href: '/servicios/fisioterapia',
    offers: [
      {
        name: 'Valoración osteomuscular',
        summary: 'Historia clínica, valoración física y plan de tratamiento.',
        priceCop: 60_000,
      },
      {
        name: 'Valoración de ATM',
        summary: 'Valoración de la articulación temporomandibular.',
        priceCop: 100_000,
      },
      {
        name: 'Valoración con ecografía osteomuscular',
        summary: 'Ecografía del segmento afectado y valoración completa.',
      },
      {
        name: 'Sesión de fisioterapia integral',
        summary: 'Medios físicos, terapia manual, movilidad y fortalecimiento.',
        priceCop: 80_000,
      },
      {
        name: 'Sesión integral con punción seca',
        summary: 'Sesión integral con terapia manual y punción seca.',
        priceCop: 90_000,
      },
      {
        name: 'Sesión integral con terapia neural',
        summary: 'Sesión integral con punción seca y terapia neural.',
        priceCop: 120_000,
      },
      {
        name: 'Vendaje neuromuscular',
        summary: 'Aplicación de Kinematik Tape como complemento o servicio aparte.',
      },
    ],
    packagesNote: 'Paquetes de 5, 10, 12, 15, 20 y 30 sesiones con ahorro por volumen.',
  },
  {
    slug: 'pilates',
    eyebrow: 'PILATES',
    title: 'Pilates',
    description: 'Movimiento guiado, control y fuerza en grupos reducidos, a cualquier edad.',
    href: '/servicios/pilates',
    offers: [
      {
        name: 'Primera clase de Pilates',
        summary: 'Oferta de entrada para conocernos. Reserva sin pago anticipado.',
        priceCop: 40_000,
      },
      {
        name: 'Clase de Pilates',
        summary: 'Reformer, Mat, Contemporáneo, Clásico, Stretching y Jam, con implementos.',
        priceCop: 60_000,
      },
    ],
    packagesNote: 'Paquetes de 4, 8 y 12 clases con vigencia de un mes.',
  },
  {
    slug: 'entrenamiento-funcional',
    eyebrow: 'ENTRENAMIENTO',
    title: 'Entrenamiento funcional',
    description: 'Fuerza, capacidad y confianza para tu vida real.',
    href: '/servicios/entrenamiento-funcional',
    offers: [
      {
        name: 'Clase individual de entrenamiento',
        summary: 'Full Core, Full Body, Spring Wall, TRX, Power Flow y Hyrox, adaptado a tu nivel.',
        priceCop: 50_000,
      },
    ],
    packagesNote: 'Paquetes de 4, 8 y 12 clases con vigencia de un mes.',
  },
  {
    slug: 'dual',
    eyebrow: 'DUAL',
    title: 'Pilates + Entrenamiento',
    description: 'Combina control, movilidad y fuerza en un mismo paquete de clases.',
    href: '/precios#dual',
    offers: [
      {
        name: 'Paquete Dual',
        summary: 'Clases de Pilates y de Entrenamiento funcional en una sola ruta.',
      },
    ],
    packagesNote: 'Paquetes de 4, 8, 12 y 16 clases con vigencia de un mes.',
    packageFromCop: 220_000,
  },
  {
    slug: 'pareja-grupo',
    eyebrow: 'EN COMPAÑÍA',
    title: 'Planes para pareja o grupo',
    description: 'Comparte una ruta Dual con tu pareja o con un grupo de hasta 3 personas.',
    href: '/precios#pareja-grupo',
    offers: [
      {
        name: 'Plan Dual para pareja o grupo',
        summary: 'Para 2 o 3 personas, con Pilates y Entrenamiento funcional.',
      },
    ],
    packagesNote: 'Paquetes de 16, 24 y 40 clases con vigencia de un mes.',
    packageFromCop: 700_000,
  },
  {
    slug: 'bienestar',
    eyebrow: 'BIENESTAR',
    title: 'Terapias especializadas',
    description: 'Recuperación, descarga y relajación para sentirte mejor.',
    href: '/precios#bienestar',
    offers: [
      {
        name: 'Descarga muscular',
        summary: 'Masaje deportivo, liberación miofascial, cupping y estiramiento.',
        priceCop: 85_000,
      },
      {
        name: 'Terapia descontracturante',
        summary: 'Masaje terapéutico, liberación manual y estiramiento.',
        priceCop: 80_000,
      },
      {
        name: 'Terapia de relajación',
        summary: 'Cuerpo completo con musicoterapia, aromaterapia y masaje suave.',
        priceCop: 130_000,
      },
      {
        name: 'Terapia para corredores y ciclistas',
        summary: 'Miembros inferiores con botas de compresión y masaje deportivo.',
        priceCop: 90_000,
      },
    ],
  },
  {
    slug: 'procedimientos',
    eyebrow: 'PROCEDIMIENTOS',
    title: 'Medicina especializada',
    description: 'Procedimientos con valoración previa y consentimiento informado.',
    href: '/precios#procedimientos',
    offers: [
      {
        name: 'Sueroterapia',
        summary: 'Sueros multivitamínicos con valoración previa.',
        priceCop: 170_000,
      },
      {
        name: 'Plasma rico en plaquetas (PRP)',
        summary: 'Extracción de sangre propia, centrifugado y aplicación en la zona a tratar.',
        priceCop: 250_000,
      },
      {
        name: 'Electrólisis percutánea intratisular',
        summary: 'Tratamiento para lesiones de tejidos blandos, previa valoración.',
      },
    ],
    packagesNote: 'Paquetes de sueroterapia y PRP con ahorro por volumen.',
  },
  {
    slug: 'tensamax',
    eyebrow: 'TENSAMAX',
    title: 'Tensamax',
    description: 'Tecnología para posoperatorio y tratamientos faciales o corporales.',
    href: '/precios#tensamax',
    offers: [
      {
        name: 'Tensamax',
        summary: 'Se agenda con una valoración previa para definir el tratamiento.',
      },
    ],
    consultNote: 'Consulta la tarifa con el equipo.',
  },
  {
    slug: 'empresas',
    eyebrow: 'EMPRESAS',
    title: 'Bienestar corporativo',
    description: 'Programas de movimiento y pausas activas para los equipos de tu empresa.',
    href: '/precios#empresas',
    offers: [
      {
        name: 'Programas para empresas',
        summary: 'Paquetes a la medida de tu equipo.',
      },
    ],
    consultNote: 'Solicita una propuesta para tu empresa.',
  },
  {
    slug: 'boutique-ortopedica',
    eyebrow: 'BOUTIQUE',
    title: 'Boutique ortopédica',
    description: 'Productos ortopédicos y de apoyo para tu recuperación.',
    href: '/precios#boutique-ortopedica',
    offers: [
      {
        name: 'Productos ortopédicos',
        summary: 'Pregunta por la disponibilidad en tu sede.',
      },
    ],
    consultNote: 'Consulta productos y disponibilidad con el equipo.',
  },
]

/** Cheapest confirmed price of a category, or null when nothing is confirmed. */
export function startingPriceCop(category: Category): number | null {
  const prices = category.offers.flatMap((offer) =>
    offer.priceCop === undefined ? [] : [offer.priceCop],
  )
  if (prices.length) return Math.min(...prices)
  return category.packageFromCop ?? null
}

export function formatCop(value: number): string {
  return `$${value.toLocaleString('es-CO')}`
}

export function getCategory(slug: string): Category {
  const category = CATALOG.find((item) => item.slug === slug)
  if (!category) throw new Error(`Unknown catalog category: ${slug}`)
  return category
}
