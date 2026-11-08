import Link from "next/link";

import type { PublicCategory } from "@/services/public/repository";

const FALLBACK_ART: Record<string, string> = {
  "kitchen-essentials": "/assets/kitchen.png",
  "bedroom-essentials": "/assets/bedroom.png",
  "bathroom-essentials": "/assets/bathroom.png",
  "home-organization": "/assets/organization.png",
};

export function CategoryCard({ category }: { category: PublicCategory }) {
  const image = category.image_url || FALLBACK_ART[category.slug];
  return (
    <Link className="category-card" href={`/categories/${category.slug}`}>
      <span className={image ? "category-card__image" : "category-card__image category-card__image--empty"}>
        {image ? (
          <span
            role="img"
            aria-label={category.alt_text || category.name}
            style={{ backgroundImage: `url(${JSON.stringify(image)})` }}
          />
        ) : null}
      </span>
      <span>{category.name}</span>
      {category.description ? <small>{category.description}</small> : null}
    </Link>
  );
}

export function defaultPublicCategories(): PublicCategory[] {
  return [
    { id: "kitchen", name: "Kitchen Essentials", slug: "kitchen-essentials", description: "Practical tools, cookware, and organizers for everyday cooking.", image_url: null, alt_text: "Warm, organized kitchen", is_featured: true },
    { id: "bedroom", name: "Bedroom Essentials", slug: "bedroom-essentials", description: "Comfort, lighting, and storage ideas for a calmer room.", image_url: null, alt_text: "Calm, comfortable bedroom", is_featured: true },
    { id: "bathroom", name: "Bathroom Essentials", slug: "bathroom-essentials", description: "Useful organizers and accessories for daily routines.", image_url: null, alt_text: "Bright, organized bathroom", is_featured: true },
    { id: "organization", name: "Home Organization", slug: "home-organization", description: "Storage and space-saving ideas for the places that work hardest.", image_url: null, alt_text: "Organized household storage", is_featured: true },
  ];
}
