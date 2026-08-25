/* Newsletter signup — fan tribute demo endpoint.
   Accepts { email }, validates, and echoes success. No persistence. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as { email: unknown }).email).trim().toLowerCase()
      : "";

  if (!EMAIL_RE.test(email)) {
    return Response.json(
      { ok: false, error: "That email doesn't look right — check it and retry." },
      { status: 422 },
    );
  }

  /* deterministic pseudo-id so repeat signups feel remembered */
  const id = Array.from(email).reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 99991, 7);

  return Response.json({
    ok: true,
    id,
    message: `Wings granted for ${email}. First dispatch lands soon.`,
  });
}
