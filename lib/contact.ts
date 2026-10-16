// Public contact channel of the clinic. TODO(Fisiofes): confirm the WhatsApp/phone number
// to publish (only a payment number appears in the client documents, so none is set).
// Digits only with country code, e.g. '573001234567'. When null, the UI falls back to /contacto.
export const CLINIC_WHATSAPP: string | null = null

export function whatsappUrl(message: string): string | null {
  if (!CLINIC_WHATSAPP) return null
  return `https://wa.me/${CLINIC_WHATSAPP}?text=${encodeURIComponent(message)}`
}
