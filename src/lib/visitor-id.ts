export async function visitorId(domain: string, ip: string, ua: string) {
  const salt = new TextEncoder().encode(new Date().toISOString().slice(0, 10));

  const data = new TextEncoder().encode(`${domain}-${ip}-${ua}`);

  const key = await crypto.subtle.importKey(
    "raw",
    salt,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, data);

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
