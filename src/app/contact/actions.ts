"use server";

import { headers } from "next/headers";
import { validateContact, type ContactErrors, type ContactValues } from "@/lib/contact";
import { checkContactRateLimit, clientIp, retryMessage } from "@/lib/rate-limit";

export type SendContactResult =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: ContactErrors };

/**
 * Checks a contact message on the server. Server Functions can be called with a
 * direct POST, so the input is treated as untrusted. In this demo the message
 * is not sent, stored or logged; a live store would deliver it here.
 */
export async function sendContactMessage(input: unknown): Promise<SendContactResult> {
  // Checked first so invalid submissions also use up attempts.
  const { limited, retryAfter } = await checkContactRateLimit(clientIp(await headers()));
  if (limited) {
    return { ok: false, error: `You’ve sent several messages recently. Try again in ${retryMessage(retryAfter)}.` };
  }

  const values = parseContact(input);
  if (!values) {
    return { ok: false, error: "Your message couldn’t be read. Refresh the page and try again." };
  }

  const fieldErrors = validateContact(values);
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  // Demo: nothing is delivered or kept. A live store would send the trimmed values
  // to its help desk here — never put the message itself in server logs.
  return { ok: true };
}

/** Accepts only a plain object with exactly the expected string fields. */
function parseContact(input: unknown): ContactValues | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const r = input as Record<string, unknown>;
  const fields = ["name", "email", "topic", "message"] as const;
  if (!fields.every((f) => typeof r[f] === "string")) return null;
  // Rough size guard before validating; the real limits are in validateContact.
  if (fields.some((f) => (r[f] as string).length > 20_000)) return null;
  return { name: r.name as string, email: r.email as string, topic: r.topic as string, message: r.message as string };
}
