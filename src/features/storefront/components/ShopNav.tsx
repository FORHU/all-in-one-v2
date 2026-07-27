import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/shop" },
  { label: "Men", href: "#" },
  { label: "Women", href: "#" },
  { label: "Sale", href: "#" },
  { label: "Lookbook", href: "#" },
];

export function ShopNav() {
  return (
    <header className="border-b border-[var(--shop-border)] bg-[var(--shop-bg)]">
      <nav className="mx-auto grid max-w-7xl grid-cols-2 items-center px-6 py-5 sm:grid-cols-3">
        <div className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.1em] text-[var(--shop-text-muted)] sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-[var(--shop-text)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/shop"
          className="shop-display text-xl font-semibold uppercase tracking-[0.08em] text-[var(--shop-text)] sm:text-center"
        >
          All In One
        </Link>

        <div className="flex items-center justify-end gap-5">
          <button
            type="button"
            aria-label="Search"
            className="text-[var(--shop-text)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </button>

          <button
            type="button"
            aria-label="View wishlist"
            className="text-[var(--shop-text)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          </button>

          <button
            type="button"
            aria-label="View cart"
            className="relative text-[var(--shop-text)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.945-4.706 2.336-7.187a1.125 1.125 0 0 0-1.11-1.313H5.106M7.5 14.25 5.106 5.272M6.75 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
          </button>

          <Link
            href="/"
            aria-label="Admin login"
            className="text-[var(--shop-text)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.964 0a9 9 0 1 0-11.964 0m11.964 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          </Link>
        </div>
      </nav>
    </header>
  );
}
