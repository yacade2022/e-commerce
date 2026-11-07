"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const go = (next: number) => setIndex((next + count) % count);

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {count > 1 && (
        <ul className="flex gap-2 overflow-x-auto md:flex-col" aria-label="Product images">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-md border-2 bg-shelf md:size-18",
                  i === index ? "border-spruce" : "border-transparent hover:border-input",
                )}
              >
                <Image src={src} alt="" fill sizes="72px" className="object-contain p-1 mix-blend-multiply" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div
        className="relative aspect-square flex-1 overflow-hidden rounded-xl bg-shelf"
        role="group"
        aria-roledescription="carousel"
        aria-label={`${title} images`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(index + 1);
          if (e.key === "ArrowLeft") go(index - 1);
        }}
      >
        <Image
          key={images[index]}
          src={images[index]}
          alt={count > 1 ? `${title}, image ${index + 1} of ${count}` : title}
          fill
          preload={index === 0}
          loading={index === 0 ? undefined : "eager"}
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-contain p-6 mix-blend-multiply sm:p-10"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous image"
              className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white"
            >
              <ChevronLeftIcon className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next image"
              className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white"
            >
              <ChevronRightIcon className="size-5" aria-hidden="true" />
            </button>
            <p className="tabular absolute right-3 bottom-3 rounded bg-white/90 px-2 py-0.5 text-xs" aria-hidden="true">
              {index + 1} / {count}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
