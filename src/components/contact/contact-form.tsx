"use client";

import { useRef, useState, useTransition } from "react";
import { CircleCheckIcon } from "lucide-react";
import { sendContactMessage } from "@/app/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactLimits, contactTopics, validateContact, type ContactErrors, type ContactValues } from "@/lib/contact";

type Values = ContactValues;
type Errors = ContactErrors;

const fieldOrder: (keyof Values)[] = ["name", "email", "topic", "message"];
const emptyValues = (): Values => ({ name: "", email: "", topic: contactTopics[0], message: "" });

export function ContactForm() {
  const [values, setValues] = useState<Values>(emptyValues);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const onChange =
    (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  function focusFirst(found: Errors) {
    const first = fieldOrder.find((f) => found[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`#contact-${first}`)?.focus();
  }

  if (sent) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center" role="status">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-mint text-spruce">
          <CircleCheckIcon className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-2xl font-semibold">Message ready</h2>
        <p className="mt-2 text-muted-foreground">
          In this demo, messages are checked but not delivered or stored. In a live store, the team would reply to{" "}
          {values.email.trim()}.
        </p>
        <Button
          variant="outline"
          className="mt-6 h-10 px-5"
          onClick={() => {
            setValues(emptyValues());
            setSent(false);
          }}
        >
          Write another message
        </Button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      noValidate
      className="space-y-5 rounded-xl border bg-white p-6 sm:p-8"
      aria-labelledby="contact-form-title"
      onSubmit={(e) => {
        e.preventDefault();
        if (pending) return;
        setFormError(null);
        // Instant feedback in the browser; the server repeats every check.
        const found = validateContact(values);
        setErrors(found);
        if (Object.keys(found).length > 0) {
          focusFirst(found);
          return;
        }
        startTransition(async () => {
          try {
            const result = await sendContactMessage(values);
            if (result.ok) {
              setSent(true);
              return;
            }
            if (result.fieldErrors) {
              setErrors(result.fieldErrors);
              focusFirst(result.fieldErrors);
            }
            if (result.error) setFormError(result.error);
          } catch {
            setFormError("We couldn’t reach the store. Check your connection and try again.");
          }
        });
      }}
    >
      <h2 id="contact-form-title" className="text-xl font-semibold">
        Send a message
      </h2>
      <p className="-mt-3 text-sm text-muted-foreground">Demo form: messages are checked but not delivered or stored.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Name" error={errors.name}>
          <Input id="contact-name" autoComplete="name" maxLength={contactLimits.name} value={values.name} onChange={onChange("name")} {...errProps("contact-name", errors.name)} className="h-10" />
        </Field>
        <Field id="contact-email" label="Email" error={errors.email}>
          <Input id="contact-email" type="email" autoComplete="email" maxLength={contactLimits.email} value={values.email} onChange={onChange("email")} {...errProps("contact-email", errors.email)} className="h-10" />
        </Field>
      </div>
      <Field id="contact-topic" label="What’s this about?" error={errors.topic}>
        <select
          id="contact-topic"
          value={values.topic}
          onChange={onChange("topic")}
          {...errProps("contact-topic", errors.topic)}
          className="h-10 w-full rounded-lg border border-input bg-white px-2.5 text-sm"
        >
          {contactTopics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field id="contact-message" label="Message" error={errors.message}>
        <Textarea
          id="contact-message"
          rows={6}
          maxLength={contactLimits.messageMax}
          value={values.message}
          onChange={onChange("message")}
          {...errProps("contact-message", errors.message)}
        />
      </Field>
      {formError && (
        <p role="alert" className="rounded-lg border border-sale/40 bg-sale/5 p-3 text-sm text-sale">
          {formError}
        </p>
      )}
      <Button type="submit" disabled={pending} aria-busy={pending || undefined} className="h-11 px-6 text-base">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

function errProps(id: string, error?: string) {
  return error ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` } : {};
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5">
        {label}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-sale">
          {error}
        </p>
      )}
    </div>
  );
}
