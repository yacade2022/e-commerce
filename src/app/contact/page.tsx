import type { Metadata } from "next";
import Link from "next/link";
import { ClockIcon, MailIcon } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with the Stockroom demo team.",
};

export default function ContactPage() {
  return (
    <div className="container-page grid gap-12 py-10 lg:grid-cols-[1fr_1.3fr] lg:py-14">
      <div className="max-w-md">
        <h1 className="text-4xl font-semibold">Contact us</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Questions about an order, a product or how this demo works? Many answers are already in the{" "}
          <Link href="/faq" className="font-medium text-spruce underline underline-offset-2">
            FAQ
          </Link>
          .
        </p>
        <dl className="mt-8 space-y-5 text-sm">
          <div className="flex gap-3">
            <MailIcon className="size-5 shrink-0 text-spruce" aria-hidden="true" />
            <div>
              <dt className="font-semibold">Email</dt>
              <dd className="text-muted-foreground">{site.supportEmail} (example address, not monitored)</dd>
            </div>
          </div>
          <div className="flex gap-3">
            <ClockIcon className="size-5 shrink-0 text-spruce" aria-hidden="true" />
            <div>
              <dt className="font-semibold">Hours</dt>
              <dd className="text-muted-foreground">{site.supportHours}</dd>
            </div>
          </div>
        </dl>
      </div>
      <ContactForm />
    </div>
  );
}
