import type { Metadata } from "next";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqSections } from "@/data/site";

export const metadata: Metadata = {
  title: "Help & FAQ",
  description: "Answers about shipping, returns and how the Stockroom demo works.",
};

export default function FaqPage() {
  return (
    <div className="container-page grid gap-10 py-10 lg:grid-cols-[14rem_1fr] lg:py-14">
      <div>
        <h1 className="text-4xl font-semibold">Help & FAQ</h1>
        <nav aria-label="FAQ sections" className="mt-6 hidden lg:block">
          <ul className="space-y-2 text-sm">
            {faqSections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-muted-foreground hover:text-foreground hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="max-w-3xl space-y-12">
        {faqSections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-6">
            <h2 id={`${section.id}-title`} className="text-2xl font-semibold">
              {section.title}
            </h2>
            <Accordion className="mt-4 rounded-xl border px-5">
              {section.entries.map((entry) => (
                <AccordionItem key={entry.id} value={entry.id}>
                  <AccordionTrigger className="py-4 text-base">{entry.question}</AccordionTrigger>
                  <AccordionContent className="pb-4 text-[0.95rem] leading-relaxed text-muted-foreground">
                    <p>{entry.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}

        <section className="rounded-xl bg-shelf p-6" aria-labelledby="still-title">
          <h2 id="still-title" className="text-xl font-semibold">
            Didn’t find your answer?
          </h2>
          <p className="mt-1 text-muted-foreground">
            Send us a message and we’ll point you in the right direction.{" "}
            <Link href="/contact" className="font-medium text-spruce underline underline-offset-2">
              Contact us
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
