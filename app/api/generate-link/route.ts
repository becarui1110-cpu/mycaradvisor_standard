// app/api/generate-link/route.ts  (STANDARD)
export const runtime = "edge";

const encoder = new TextEncoder();
const DEFAULT_DURATION_MINUTES = 12 * 60; // 12h par défaut
const MAX_DURATION_MINUTES = 12 * 60;     // optionnel: cap à 12h

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function GET(request: Request) {
  const secret = process.env.TOKEN_SECRET;
  if (!secret) {
    return new Response(
      JSON.stringify({ error: "TOKEN_SECRET manquant dans Vercel" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const { searchParams } = new URL(request.url);

  // ✅ durée choisie dans l’admin, sinon défaut 12h
  let durationMinutes = Number(searchParams.get("duration") || DEFAULT_DURATION_MINUTES);

  // ✅ sécurité : éviter NaN / valeurs négatives
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    durationMinutes = DEFAULT_DURATION_MINUTES;
  }

  // ✅ optionnel: on limite à 12h max pour Standard
  durationMinutes = Math.min(durationMinutes, MAX_DURATION_MINUTES);

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
  const link = `${siteUrl}/?token=${token}`;

  return new Response(JSON.stringify({ link, durationMinutes }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
