export type HeroSlide = {
  id: string;
  edition: string;
  eyebrow: string;
  headline: string;
  subcopy: string;
  tags: string[];
  imageUrl: string;
  imageAlt: string;
};

export type GalleryImage = {
  id: string;
  imageUrl: string;
  alt: string;
};

export type Brand = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  description: string;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "hero-1",
    edition: "Edit No.01",
    eyebrow: "New Season",
    headline: "Style, All In One Place",
    subcopy:
      "Curated pieces from independent designers, picked for every season.",
    tags: ["New Season", "Curated Edit"],
    imageUrl: "https://picsum.photos/seed/aio-hero-1/1600/900",
    imageAlt: "Model wearing a curated seasonal outfit",
  },
  {
    id: "hero-2",
    edition: "Edit No.02",
    eyebrow: "Resort",
    headline: "Chase The Sun In Style",
    subcopy:
      "Lightweight layers and resort essentials built for warm-weather travel.",
    tags: ["Resort", "Warm Weather"],
    imageUrl: "https://picsum.photos/seed/aio-hero-2/1600/900",
    imageAlt: "Model in resort wear by the water",
  },
  {
    id: "hero-3",
    edition: "Edit No.03",
    eyebrow: "Editors' Picks",
    headline: "Obsessed With Detail",
    subcopy: "The pieces our editors keep coming back to, restocked this week.",
    tags: ["Editors' Picks", "Restocked"],
    imageUrl: "https://picsum.photos/seed/aio-hero-3/1600/900",
    imageAlt: "Close-up of a curated fashion accessory",
  },
];

export const galleryImages: GalleryImage[] = Array.from(
  { length: 8 },
  (_, i) => ({
    id: `gallery-${i + 1}`,
    imageUrl: `https://picsum.photos/seed/aio-gallery-${i + 1}/400/500`,
    alt: `Editorial gallery photo ${i + 1}`,
  }),
);

export const brands: Brand[] = [
  { id: "brand-1", name: "Marlowe & Co." },
  { id: "brand-2", name: "Solterra" },
  { id: "brand-3", name: "Hunza Field" },
  { id: "brand-4", name: "Cult Gaia" },
  { id: "brand-5", name: "Northbound" },
];

export const featuredProducts: Product[] = [
  {
    id: "product-1",
    name: "Sculpted One-Piece",
    price: 180,
    rating: 4.5,
    reviewCount: 128,
    imageUrl: "https://picsum.photos/seed/aio-product-1/500/620",
    description:
      "A structured one-piece cut from a matte, four-way stretch fabric. Moulded cups and a scooped back give it a sculpted, second-skin fit.",
  },
  {
    id: "product-2",
    name: "Textured Wrap Dress",
    price: 140,
    compareAtPrice: 175,
    rating: 3.5,
    reviewCount: 42,
    imageUrl: "https://picsum.photos/seed/aio-product-2/500/620",
    description:
      "A textured wrap dress with an adjustable tie waist. Lightweight enough for daytime, with enough drape to carry into evening.",
  },
  {
    id: "product-3",
    name: "Linen Overshirt",
    price: 95,
    rating: 4.5,
    reviewCount: 76,
    imageUrl: "https://picsum.photos/seed/aio-product-3/500/620",
    description:
      "A relaxed, boxy overshirt in washed linen. Works layered over a tee or buttoned on its own for warm-weather evenings.",
  },
  {
    id: "product-4",
    name: "Silk Slip Skirt",
    price: 130,
    compareAtPrice: 160,
    rating: 4.5,
    reviewCount: 91,
    imageUrl: "https://picsum.photos/seed/aio-product-4/500/620",
    description:
      "A bias-cut slip skirt in liquid silk. Falls just below the knee with a subtle side slit for movement.",
  },
];

export function getProductById(id: string): Product | undefined {
  return featuredProducts.find((product) => product.id === id);
}
