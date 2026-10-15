import { headers } from "next/headers";

export function jsonError(error: string, status = 400, details?: Record<string, unknown>) {
  return Response.json({ error, ...details }, { status });
}

export async function requireAdmin() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email")?.toLowerCase();
  const configured = process.env.FISIOFES_ADMIN_EMAIL?.toLowerCase();
  return Boolean(email && configured && email === configured);
}
