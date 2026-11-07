"use client";

import { useRef, useState } from "react";
import { CircleCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Values = { name: string; email: string; topic: string; message: string };
type Errors = Partial<Record<keyof Values, string>>;

const topics = ["An order", "A product", "Returns", "This demo", "Something else"];

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Enter your name.";
  if (!v.email.trim()) e.email = "Enter an email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter an email address like name@example.com.";
  if (v.message.trim().length < 10) e.message = "Write a message of at least 10 characters.";
  return e;
}

export function ContactForm() {
  const [values, setValues] = useState<Values>({ name: "", email: "", topic: topics[0], message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const onChange =
    (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }));

  if (sent) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center" role="status">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-mint text-spruce">
          <CircleCheckIcon className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-2xl font-semibold">Message ready</h2>
        <p className="mt-2 text-muted-foreground">
          In this demo, messages aren’t sent anywhere. In a live store, the team would reply to {values.email}.
        </p>
        <Button
          variant="outline"
          className="mt-6 h-10 px-5"
          onClick={() => {
            setValues({ name: "", email: "", topic: topics[0], message: "" });
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
        const found = validate(values);
        setErrors(found);
        const first = (Object.keys(found) as (keyof Values)[])[0];
        if (first) {
          formRef.current?.querySelector<HTMLElement>(`#contact-${first}`)?.focus();
          return;
        }
        setSent(true);
      }}
    >
      <h2 id="contact-form-title" className="text-xl font-semibold">
        Send a message
      </h2>
      <p className="-mt-3 text-sm text-muted-foreground">Demo form: messages are not sent or stored.</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Name" error={errors.name}>
          <Input id="contact-name" autoComplete="name" value={values.name} onChange={onChange("name")} {...errProps("contact-name", errors.name)} className="h-10" />
        </Field>
        <Field id="contact-email" label="Email" error={errors.email}>
          <Input id="contact-email" type="email" autoComplete="email" value={values.email} onChange={onChange("email")} {...errProps("contact-email", errors.email)} className="h-10" />
        </Field>
      </div>
      <Field id="contact-topic" label="What’s this about?">
        <select
          id="contact-topic"
          value={values.topic}
          onChange={onChange("topic")}
          className="h-10 w-full rounded-lg border border-input bg-white px-2.5 text-sm"
        >
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field id="contact-message" label="Message" error={errors.message}>
        <Textarea
          id="contact-message"
          rows={6}
          value={values.message}
          onChange={onChange("message")}
          {...errProps("contact-message", errors.message)}
        />
      </Field>
      <Button type="submit" className="h-11 px-6 text-base">
        Send message
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
