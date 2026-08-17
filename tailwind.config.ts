import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "var(--bg-primary)",
        },
        brand: {
          core: "var(--brand-core)",
          vibrant: "var(--brand-vibrant)",
        },
        // Opacity-modifier-capable mirrors of the `--shop-*` design tokens
        // (theme.css). Tailwind can't apply a `/50` opacity modifier to an
        // arbitrary `var(--x)` value — it silently drops the class instead
        // of erroring — because it can't see inside a CSS variable at build
        // time to blend alpha into it. The documented fix is this: expose
        // each color as R-G-B channel numbers in a second `-rgb` variable,
        // then wrap it in `rgb(var(...) / <alpha-value>)` here so Tailwind's
        // own opacity-modifier machinery can substitute the alpha. Use
        // `bg-shop-ink/50` etc. — not `bg-[var(--shop-ink)]/50`, which
        // compiles to nothing.
        shop: {
          ink: "rgb(var(--shop-ink-rgb) / <alpha-value>)",
          "ink-soft": "rgb(var(--shop-ink-soft-rgb) / <alpha-value>)",
          surface: "rgb(var(--shop-surface-rgb) / <alpha-value>)",
          accent: "rgb(var(--shop-accent-rgb) / <alpha-value>)",
          "band-text": "rgb(var(--shop-band-text-rgb) / <alpha-value>)",
          danger: "rgb(var(--shop-danger-rgb) / <alpha-value>)",
          success: "rgb(var(--shop-success-rgb) / <alpha-value>)",
          warning: "rgb(var(--shop-warning-rgb) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
