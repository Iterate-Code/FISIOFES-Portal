export async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function verifyPin(pin: string, expectedHash: string): Promise<boolean> {
  if (!/^\d{4,8}$/.test(pin) || !expectedHash) return false;
  return (await sha256(pin)) === expectedHash;
}
