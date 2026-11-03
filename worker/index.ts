import { SITE } from "../src/data/site";
import { notification, validate, type FieldErrors } from "./inquiry";

interface Env {
  ASSETS: Fetcher;
  INQUIRY_MAIL: SendEmail;
  INQUIRY_LIMIT: RateLimit;
  MAIL_FROM: string;
  MAIL_TO: string;
  TURNSTILE_HOSTNAMES: string;
  TURNSTILE_SECRET: string;
}

type Result = { ok: true } | { ok: false; error: string; fields?: FieldErrors };

const MAX_BODY = 20_000;

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/api/contact") return env.ASSETS.fetch(request);
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });

    // The page posts JSON; a browser without script posts the form itself.
    const wantsJson = (request.headers.get("Accept") ?? "").includes("application/json");
    const reply = (status: number, result: Result) =>
      wantsJson ? Response.json(result, { status }) : formReply(status, result, url.origin);

    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) return reply(403, { ok: false, error: "This form only accepts messages from karakoa.dev." });

    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const { success: underLimit } = await env.INQUIRY_LIMIT.limit({ key: ip });
    if (!underLimit) return reply(429, { ok: false, error: "Too many messages in a short time. Wait a minute and try again." });

    const input = await readBody(request);
    if (!input) return reply(400, { ok: false, error: "The message could not be read. Try again." });

    // Honeypot: a field people never see. Only bots fill it.
    if (input.botcheck) return reply(400, { ok: false, error: "Your message could not be sent." });

    const checked = validate(input);
    if ("errors" in checked) return reply(422, { ok: false, error: "Check the highlighted fields.", fields: checked.errors });

    const hostnames = env.TURNSTILE_HOSTNAMES.split(",").map((h) => h.trim());
    const human = await verifyTurnstile(String(input["cf-turnstile-response"] ?? ""), ip, hostnames, env.TURNSTILE_SECRET);
    if (!human) return reply(403, { ok: false, error: "The spam check did not pass. Reload the page and try again." });

    const { inquiry } = checked;
    const mail = notification(inquiry, new Date());
    try {
      await env.INQUIRY_MAIL.send({
        from: { email: env.MAIL_FROM, name: "karakoa.dev contact form" },
        to: env.MAIL_TO,
        replyTo: { email: inquiry.email, name: inquiry.name },
        subject: mail.subject,
        text: mail.text,
      });
    } catch (err) {
      console.error("contact form: send failed", err instanceof Error ? err.message : err);
      return reply(502, { ok: false, error: "Your message could not be sent." });
    }
    return reply(200, { ok: true });
  },
} satisfies ExportedHandler<Env>;

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  const length = Number(request.headers.get("Content-Length") ?? 0);
  if (length > MAX_BODY) return null;
  const type = request.headers.get("Content-Type") ?? "";
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY) return null;
    if (type.includes("application/json")) {
      const data: unknown = JSON.parse(raw);
      return data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, unknown>) : null;
    }
    if (type.includes("application/x-www-form-urlencoded")) return Object.fromEntries(new URLSearchParams(raw));
  } catch {
    return null;
  }
  return null;
}

// Tokens are single use and record the page they were solved on; only the
// site's own hostnames (TURNSTILE_HOSTNAMES) and this form's action pass.
async function verifyTurnstile(token: string, ip: string, hostnames: string[], secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip !== "unknown") body.append("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const outcome: { success?: boolean; hostname?: string; action?: string; "error-codes"?: string[] } = await res.json();
    const passed = outcome.success === true && hostnames.includes(outcome.hostname ?? "") && outcome.action === "contact";
    if (!passed) console.warn("contact form: turnstile refused", outcome["error-codes"], outcome.hostname, outcome.action);
    return passed;
  } catch (err) {
    console.error("contact form: turnstile check failed", err instanceof Error ? err.message : err);
    return false;
  }
}

// Without script there is no page to update, so answer with a page.
function formReply(status: number, result: Result, origin: string): Response {
  if (result.ok) return Response.redirect(`${origin}/contact/thanks/`, 303);
  const problems = result.fields ? Object.values(result.fields) : [result.error];
  const items = problems.map((p) => `<li>${escapeHtml(p ?? "")}</li>`).join("");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Message not sent | Karakoa</title></head><body style="font-family:system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1.25rem;line-height:1.6;color:#0b2c44"><h1>Your message was not sent</h1><ul>${items}</ul><p><a href="/#message">Go back to the form</a> or email <a href="mailto:${SITE.email}">${SITE.email}</a>.</p></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
