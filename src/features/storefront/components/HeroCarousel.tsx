"use client";

import { useState } from "react";
import Image from "next/image";
import type { HeroSlide } from "@/features/storefront/data/mock-data";

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  const goTo = (delta: number) => {
    setIndex((current) => (current + delta + slides.length) % slides.length);
  };

  return (
    <section className="mx-auto mt-10 max-w-7xl px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="shop-display text-xs font-semibold uppercase tracking-[0.2em] text-[var(--shop-text-muted)]">
          {slide.edition} — {slide.eyebrow}
        </span>
        <h1 className="shop-display max-w-3xl text-4xl font-bold uppercase leading-[0.95] tracking-tight text-[var(--shop-text)] sm:text-6xl">
          {slide.headline}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {slide.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--shop-border)] px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-[var(--shop-text-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mt-8 overflow-hidden rounded-2xl bg-[var(--shop-ink)]">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:aspect-[21/9]">
          <Image
            src={slide.imageUrl}
            alt={slide.imageAlt}
            fill
            priority
            className="object-cover"
          />

          <div className="absolute bottom-6 left-6 max-w-sm rounded-xl bg-[var(--shop-ink)]/85 p-6 backdrop-blur-sm">
            <p className="text-sm italic text-white/85">{slide.subcopy}</p>
            <a
              href="#featured"
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-white underline underline-offset-4 transition-colors hover:text-[var(--shop-accent)]"
            >
              Explore the Collection
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="absolute bottom-6 right-6 flex items-center gap-4">
            <span className="shop-display text-xs tracking-[0.2em] text-white/60">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(slides.length).padStart(2, "0")}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => goTo(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/10"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => goTo(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/10"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
