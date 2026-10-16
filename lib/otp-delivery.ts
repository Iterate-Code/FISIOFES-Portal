// Delivers the one-time code to the patient (WhatsApp via an automation webhook).
// Configure OTP_WEBHOOK_URL (and OTP_WEBHOOK_SECRET) with the n8n / WhatsApp provider endpoint.
// The webhook receives { phone, code, message } and must send `message` to `phone`.

export type Delivery = { devCode?: string }

export function otpMessage(code: string): string {
  return `Tu código de Fisiofes es ${code}. Vence en 10 minutos. No lo compartas con nadie.`
}

export async function sendCode(phone: string, code: string): Promise<Delivery> {
  const url = process.env.OTP_WEBHOOK_URL
  if (url) {
    const secret = process.env.OTP_WEBHOOK_SECRET
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(secret ? { authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify({ phone, code, message: otpMessage(code) }),
    })
    if (!response.ok) throw new Error(`OTP webhook failed with status ${response.status}`)
    return {}
  }
  // Never fall back to returning codes in production.
  if (process.env.NODE_ENV === 'development') return { devCode: code }
  throw new Error('OTP_WEBHOOK_URL is not configured')
}
