/**
 * Contact form rules, shared by the form (instant feedback) and the server
 * action (the real check, since the action can be called directly).
 */

export const contactTopics = ["An order", "A product", "Returns", "This demo", "Something else"] as const;

export const contactLimits = {
  name: 100,
  email: 254,
  messageMin: 10,
  messageMax: 5000,
} as const;

export type ContactValues = { name: string; email: string; topic: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Control characters (other than tab and line breaks in the message) never belong in these fields.
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;
const CONTROL_CHARS_EXCEPT_WHITESPACE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

export function validateContact(v: ContactValues): ContactErrors {
  const e: ContactErrors = {};
  const name = v.name.trim();
  const email = v.email.trim();
  const message = v.message.trim();

  if (!name) e.name = "Enter your name.";
  else if (name.length > contactLimits.name) e.name = `Use ${contactLimits.name} characters or fewer for your name.`;
  else if (CONTROL_CHARS.test(name)) e.name = "Remove special characters from your name.";

  if (!email) e.email = "Enter an email address.";
  else if (email.length > contactLimits.email || !EMAIL.test(email) || CONTROL_CHARS.test(email)) {
    e.email = "Enter an email address like name@example.com.";
  }

  if (!(contactTopics as readonly string[]).includes(v.topic)) e.topic = "Choose a topic.";

  if (message.length < contactLimits.messageMin) {
    e.message = `Write a message of at least ${contactLimits.messageMin} characters.`;
  } else if (message.length > contactLimits.messageMax) {
    e.message = `Use ${contactLimits.messageMax.toLocaleString("en-US")} characters or fewer for your message.`;
  } else if (CONTROL_CHARS_EXCEPT_WHITESPACE.test(message)) {
    e.message = "Remove special characters from your message.";
  }
  return e;
}
