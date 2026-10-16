import { and, asc, eq, gte } from 'drizzle-orm'
import { getDb } from '../../../../db'
import { bookings, classSlots } from '../../../../db/schema'
import { jsonError } from '../../../../lib/api'
import { getSessionClient } from '../../../../lib/auth-session'

export async function GET(request: Request) {
  const client = await getSessionClient(request)
  if (!client) return jsonError('Inicia sesión para continuar.', 401)

  const upcoming = await getDb()
    .select({
      id: bookings.id,
      service: classSlots.service,
      date: classSlots.date,
      time: classSlots.time,
      cancellationToken: bookings.cancellationToken,
    })
    .from(bookings)
    .innerJoin(classSlots, eq(classSlots.id, bookings.slotId))
    .where(
      and(
        eq(bookings.clientId, client.id),
        eq(bookings.status, 'confirmed'),
        gte(classSlots.startsAt, new Date().toISOString()),
      ),
    )
    .orderBy(asc(classSlots.startsAt))
    .limit(20)

  return Response.json({
    client: {
      id: client.id,
      name: client.name,
      phone: client.phone,
      planService: client.planService,
      creditsRemaining: client.creditsRemaining,
      planExpiresAt: client.planExpiresAt,
    },
    upcoming,
  })
}
