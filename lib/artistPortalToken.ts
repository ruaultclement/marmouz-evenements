import { createHmac, timingSafeEqual } from "crypto";

type TokenPayload = {
  candidatureId: string;
  email: string;
  exp: number;
};

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSecret() {
  const secret = process.env.ARTIST_PORTAL_SECRET;
  if (!secret) {
    throw new Error("ARTIST_PORTAL_SECRET manquant.");
  }
  return secret;
}

function sign(payloadBase64: string, secret: string) {
  return createHmac("sha256", secret).update(payloadBase64).digest("base64url");
}

export function createArtistPortalToken(input: {
  candidatureId: string;
  email: string;
  expiresInDays?: number;
}) {
  const secret = getSecret();
  const expiresInDays = input.expiresInDays ?? 45;
  const payload: TokenPayload = {
    candidatureId: input.candidatureId,
    email: input.email,
    exp: Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60,
  };

  const payloadBase64 = toBase64Url(JSON.stringify(payload));
  const signature = sign(payloadBase64, secret);
  return `${payloadBase64}.${signature}`;
}

export function verifyArtistPortalToken(token: string, candidatureId: string) {
  const secret = getSecret();
  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) {
    return { ok: false as const, reason: "invalid-format" };
  }

  const expected = sign(payloadBase64, secret);
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
    return { ok: false as const, reason: "invalid-signature" };
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadBase64)) as TokenPayload;
    if (!payload.candidatureId || !payload.email || !payload.exp) {
      return { ok: false as const, reason: "invalid-payload" };
    }

    if (payload.candidatureId !== candidatureId) {
      return { ok: false as const, reason: "wrong-candidature" };
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return { ok: false as const, reason: "expired" };
    }

    return { ok: true as const, payload };
  } catch {
    return { ok: false as const, reason: "invalid-json" };
  }
}

export function buildArtistPortalUrl(candidatureId: string, token: string) {
  const base = process.env.APP_BASE_URL || "https://booking.laguinguettedesmarmouz.fr";
  return `${base.replace(/\/$/, "")}/suivi/${candidatureId}?token=${encodeURIComponent(token)}`;
}
