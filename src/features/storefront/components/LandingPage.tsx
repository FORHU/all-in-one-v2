import { ShopNav } from "@/features/storefront/components/ShopNav";
import { HeroCarousel } from "@/features/storefront/components/HeroCarousel";
import { GalleryStrip } from "@/features/storefront/components/GalleryStrip";
import { BrandStrip } from "@/features/storefront/components/BrandStrip";
import { ProductGrid } from "@/features/storefront/components/ProductGrid";
import {
  heroSlides,
  galleryImages,
  brands,
  featuredProducts,
} from "@/features/storefront/data/mock-data";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--shop-bg)]">
      <ShopNav />
      <HeroCarousel slides={heroSlides} />
      <GalleryStrip images={galleryImages} />
      <BrandStrip brands={brands} />
      <ProductGrid products={featuredProducts} />
    </div>
  );
}
