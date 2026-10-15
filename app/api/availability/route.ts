import { inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { classSlots } from "../../../db/schema";
import { getDailySlots, type Service } from "../../../lib/booking-rules";
import { jsonError } from "../../../lib/api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date") ?? "";
  const service = url.searchParams.get("service") as Service;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !["pilates", "training"].includes(service)) {
    return jsonError("Fecha o servicio inválido.");
  }

  const definitions = getDailySlots(date, service);
  if (!definitions.length) return Response.json({ slots: [] });
  const db = getDb();
  const stored = await db.select().from(classSlots).where(inArray(classSlots.id, definitions.map((slot) => slot.id)));
  const byId = new Map(stored.map((slot) => [slot.id, slot]));
  const slots = definitions.map((slot) => {
    const row = byId.get(slot.id);
    const booked = row?.bookedCount ?? 0;
    return { ...slot, instructor: row?.instructor ?? null, available: !row?.cancelled && booked < slot.capacity, spotsRemaining: Math.max(0, slot.capacity - booked) };
  });
  return Response.json({ slots });
}
