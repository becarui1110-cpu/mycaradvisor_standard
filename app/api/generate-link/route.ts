// app/api/generate-link/route.ts  (STANDARD 12h)
export const runtime = "edge";

const encoder = new TextEncoder();

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function buildLink(secret: string, durationMinutes: number) {
  const expiresAt = Date.now() + durationMinutes * 60 * 1000;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(String(expiresAt))
  );

  const signature = toBase64Url(signatureBuffer);
  const token = `${expiresAt}.${signature}`;

  const siteUrl = "https://standard.mycaradvisor.ch";
  return `${siteUrl}/?token=${token}`;
}

type JsonBody = Record<string, unknown>;

function json(body: JsonBody, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// ✅ GET (comme avant)
export async function GET() {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) return json({ error: "TOKEN_SECRET manquant dans Vercel" }, 500);

  const durationMinutes = 12 * 60; // 12h fixes
  const link = await buildLink(secret, durationMinutes);

  return json({ link });
}

// ✅ POST (pour l’admin-panel)
export async function POST(request: Request) {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) return json({ error: "TOKEN_SECRET manquant dans Vercel" }, 500);

  let durationMinutes = 12 * 60; // défaut Standard = 12h

  // body optionnel: { durationMinutes: number }
  try {
    const body = (await request.json()) as JsonBody;
    const d = Number(body.durationMinutes);
    if (Number.isFinite(d) && d > 0) durationMinutes = d;
  } catch {
    // pas de body -> on garde 12h
  }

  const link = await buildLink(secret, durationMinutes);
  return json({ link });
}
