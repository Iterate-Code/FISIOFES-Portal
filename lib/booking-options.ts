import { canUseCredit, type Service } from './booking-rules.ts'

export type PlanInfo = {
  planService: Service | 'dual'
  creditsRemaining: number
  planExpiresAt: string
}

export type ServiceOption = {
  id: string
  /** `class`: instant booking with a credit. `request`: the team confirms by WhatsApp. */
  mode: 'class' | 'request'
  slug: string
  service?: Service
  title: string
}

export const CLASS_SLUG_TO_SERVICE: Record<string, Service> = {
  pilates: 'pilates',
  'entrenamiento-funcional': 'training',
}

/**
 * Options for the first step. A class category becomes an instant booking only when the
 * client's plan covers it; otherwise it stays a request (e.g. the first-class offer).
 */
export function buildServiceOptions(
  categories: { slug: string; title: string }[],
  plan: PlanInfo | null,
  now = new Date(),
): ServiceOption[] {
  return categories.map((category) => {
    const service = CLASS_SLUG_TO_SERVICE[category.slug]
    const covered =
      service !== undefined &&
      plan !== null &&
      canUseCredit(
        {
          service: plan.planService,
          creditsRemaining: plan.creditsRemaining,
          expiresAt: plan.planExpiresAt,
        },
        service,
        now,
      ).ok
    return covered
      ? {
          id: `class:${category.slug}`,
          mode: 'class',
          slug: category.slug,
          service,
          title: category.title,
        }
      : {
          id: `request:${category.slug}`,
          mode: 'request',
          slug: category.slug,
          title: category.title,
        }
  })
}
