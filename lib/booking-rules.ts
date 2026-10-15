export type Service = "pilates" | "training";

export interface CreditPlan {
  service: Service | "dual";
  creditsRemaining: number;
  expiresAt: string;
}

export interface SlotDefinition {
  id: string;
  date: string;
  time: string;
  service: Service;
  capacity: number;
}

export type CreditDecision =
  | { ok: true }
  | { ok: false; reason: "NO_CREDITS" | "PLAN_EXPIRED" | "WRONG_SERVICE" };

const WEEKDAY_TIMES = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "16:00", "17:00", "18:00", "19:00"];
const SATURDAY_TIMES = ["08:00", "09:00", "10:00", "11:00", "12:00"];
const CAPACITY: Record<Service, number> = { pilates: 5, training: 4 };

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+57${digits}`;
  if (digits.length === 12 && digits.startsWith("57")) return `+${digits}`;
  return value.trim().startsWith("+") ? `+${digits}` : digits;
}

export function getDailySlots(date: string, service: Service): SlotDefinition[] {
  const day = new Date(`${date}T12:00:00-05:00`).getDay();
  const times = day === 0 ? [] : day === 6 ? SATURDAY_TIMES : WEEKDAY_TIMES;
  return times.map((time) => ({
    id: `${date}:${time}:${service}`,
    date,
    time,
    service,
    capacity: CAPACITY[service],
  }));
}

export function canUseCredit(plan: CreditPlan, service: Service, now = new Date()): CreditDecision {
  if (plan.creditsRemaining <= 0) return { ok: false, reason: "NO_CREDITS" };
  const endOfExpiry = new Date(`${plan.expiresAt}T23:59:59-05:00`);
  if (endOfExpiry.getTime() < now.getTime()) return { ok: false, reason: "PLAN_EXPIRED" };
  if (plan.service !== "dual" && plan.service !== service) return { ok: false, reason: "WRONG_SERVICE" };
  return { ok: true };
}

export function slotStart(date: string, time: string): Date {
  return new Date(`${date}T${time}:00-05:00`);
}

export function validateCancellation(startsAt: string, now = new Date()) {
  const hoursBefore = (new Date(startsAt).getTime() - now.getTime()) / 3_600_000;
  return { allowed: hoursBefore > 0, refundCredit: hoursBefore >= 2 };
}
