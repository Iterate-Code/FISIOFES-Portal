import { z } from 'zod'

export const REQUEST_BRANCHES = ['calarca', 'senior-mall', 'sin-preferencia'] as const
export const REQUEST_SCHEDULES = ['manana', 'tarde', 'sin-preferencia'] as const

/** Categories whose classes are only given at Senior's Mall. */
const MALL_ONLY = ['pilates', 'entrenamiento-funcional', 'dual', 'pareja-grupo']

export function branchesFor(serviceSlug: string): readonly string[] {
  return MALL_ONLY.includes(serviceSlug) ? ['senior-mall'] : REQUEST_BRANCHES
}

export const requestSchema = z.object({
  serviceSlug: z.string().min(1).max(60),
  branch: z.enum(REQUEST_BRANCHES),
  schedule: z.enum(REQUEST_SCHEDULES),
  // Optional preferred day, YYYY-MM-DD. Not a confirmed slot: the team confirms by WhatsApp.
  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullish(),
  note: z.string().trim().max(500).nullish(),
})

export type RequestInput = z.infer<typeof requestSchema>

/** Returns an error message, or null when the combination is acceptable. */
export function validateRequestRules(input: RequestInput): string | null {
  if (!branchesFor(input.serviceSlug).includes(input.branch)) {
    return 'Este servicio solo se presta en Senior’s Mall.'
  }
  return null
}
