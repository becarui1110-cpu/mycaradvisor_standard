export const runtime = "edge";

const encoder = new TextEncoder();

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function makeToken(secret: string, minutes: number) {
  const expiresAt = Date.now() + minutes * 60 * 1000;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(String(expiresAt))
  );

  const signature = toBase64Url(sigBuf);

  return `${expiresAt}.${signature}`;
}

export async function POST(req: Request) {
  const tokenSecret = process.env.TOKEN_SECRET;
  const siteUrl = (process.env.SITE_URL || "https://standard.mycaradvisor.ch").replace(
    /\/$/,
    ""
  );

  if (!tokenSecret) {
    return new Response(
      JSON.stringify({ error: "TOKEN_SECRET missing in Vercel" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  let durationMinutes = 60; // défaut
  try {
    const body = (await req.json()) as { duration?: number | string };
    if (body.duration) {
      durationMinutes =
        typeof body.duration === "string"
          ? Number(body.duration)
          : body.duration;
    }
  } catch {
    // pas grave, on prend 60
  }

  const token = await makeToken(tokenSecret, durationMinutes);
  const link = `${siteUrl}/?token=${encodeURIComponent(token)}`;

  return new Response(JSON.stringify({ link }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

// optionnel, pour que le navigateur ne crie pas sur GET
export async function GET() {
  return new Response(
    JSON.stringify({
      message: "Use POST with JSON body: { \"duration\": 720 }",
    }),
    { status: 405, headers: { "content-type": "application/json" } }
  );
}
