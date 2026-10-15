import { and, eq, gt, gte, or, sql } from "drizzle-orm";
import { getDb } from "../../../db";
import { bookings, classSlots, clients } from "../../../db/schema";
import { canUseCredit, getDailySlots, normalizePhone, slotStart, type Service } from "../../../lib/booking-rules";
import { jsonError } from "../../../lib/api";
import { verifyPin } from "../../../lib/security";

export async function POST(request: Request) {
  const payload = await request.json() as { name?: string; phone?: string; pin?: string; service?: Service; date?: string; time?: string };
  const name = payload.name?.trim() ?? "";
  const phone = normalizePhone(payload.phone ?? "");
  const pin = payload.pin ?? "";
  const service = payload.service as Service;
  const date = payload.date ?? "";
  const time = payload.time ?? "";
  const slot = ["pilates", "training"].includes(service) ? getDailySlots(date, service).find((item) => item.time === time) : undefined;
  if (!name || !/^\+57\d{10}$/.test(phone) || !slot) return jsonError("Datos de reserva inválidos.");
  if (slotStart(date, time).getTime() <= Date.now()) return jsonError("Selecciona una clase futura.");

  const db = getDb();
  let [client] = await db.select().from(clients).where(eq(clients.phone, phone)).limit(1);
  if (!client) {
    [client] = await db.insert(clients).values({ name, phone }).returning();
    return jsonError("Tu perfil fue creado. Fisiofes debe activar un plan y entregarte un PIN antes de reservar.", 402, { code: "PLAN_REQUIRED" });
  }
  if (!client.active || !(await verifyPin(pin, client.accessPinHash))) return jsonError("Teléfono o PIN incorrecto.", 401);
  const credit = canUseCredit({ service: client.planService, creditsRemaining: client.creditsRemaining, expiresAt: client.planExpiresAt }, service);
  if (!credit.ok) return jsonError("Tu plan no permite esta reserva. Contacta a Fisiofes para renovarlo o ajustarlo.", 402, { code: credit.reason });

  await db.insert(classSlots).values({ ...slot, startsAt: slotStart(date, time).toISOString() }).onConflictDoNothing();
  const [existing] = await db.select({ id: bookings.id }).from(bookings).where(and(eq(bookings.clientId, client.id), eq(bookings.slotId, slot.id))).limit(1);
  if (existing) return jsonError("Ya tienes una reserva para esta clase.", 409);

  const debited = await db.update(clients).set({ creditsRemaining: sql`${clients.creditsRemaining} - 1`, updatedAt: new Date().toISOString() }).where(and(eq(clients.id, client.id), gt(clients.creditsRemaining, 0), gte(clients.planExpiresAt, new Date().toISOString().slice(0, 10)), or(eq(clients.planService, service), eq(clients.planService, "dual")))).returning({ id: clients.id, creditsRemaining: clients.creditsRemaining });
  if (!debited.length) return jsonError("No fue posible validar el crédito. Intenta nuevamente.", 409);

  const reserved = await db.update(classSlots).set({ bookedCount: sql`${classSlots.bookedCount} + 1` }).where(and(eq(classSlots.id, slot.id), eq(classSlots.cancelled, false), gt(classSlots.capacity, classSlots.bookedCount))).returning();
  if (!reserved.length) {
    await db.update(clients).set({ creditsRemaining: sql`${clients.creditsRemaining} + 1` }).where(eq(clients.id, client.id));
    return jsonError("La clase acaba de llenarse. El crédito no fue consumido.", 409);
  }

  const id = crypto.randomUUID();
  const cancellationToken = crypto.randomUUID();
  try {
    await db.insert(bookings).values({ id, clientId: client.id, slotId: slot.id, cancellationToken });
  } catch {
    await db.update(classSlots).set({ bookedCount: Math.max(0, reserved[0].bookedCount - 1) }).where(eq(classSlots.id, slot.id));
    await db.update(clients).set({ creditsRemaining: sql`${clients.creditsRemaining} + 1` }).where(eq(clients.id, client.id));
    return jsonError("No pudimos completar la reserva. El crédito fue restaurado.", 409);
  }

  return Response.json({ booking: { id, service, date, time, cancellationToken }, creditsRemaining: debited[0].creditsRemaining }, { status: 201 });
}
