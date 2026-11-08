import Image from "next/image";
import Link from "next/link";

import { PublicHeader } from "@/components/public/public-header";
import { EmptyState } from "@/components/shared/empty-state";
import { getPublicEnvironment } from "@/lib/environment";

const categories = [
  { name: "Kitchen Essentials", href: "/categories/kitchen-essentials", image: "/assets/kitchen.png" },
  { name: "Bedroom Essentials", href: "/categories/bedroom-essentials", image: "/assets/bedroom.png" },
  { name: "Bathroom Essentials", href: "/categories/bathroom-essentials", image: "/assets/bathroom.png" },
  { name: "Home Organization", href: "/categories/home-organization", image: "/assets/organization.png" },
] as const;

export default function HomePage() {
  const environment = getPublicEnvironment();

  return (
    <>
      <PublicHeader />
      <main>
        <section className="hero page-width">
          <div className="hero__copy">
            <h1>Make Your Home Feel More Like Home.</h1>
            <p>
              Discover thoughtful home finds, practical essentials, and simple ideas for everyday living.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary" href="/products">Explore Home Finds</Link>
              <Link className="text-link" href="/categories">Browse Categories</Link>
            </div>
          </div>
          <div className="hero__media">
            <Image
              src="/assets/kitchen.png"
              alt="Warm kitchen interior with uncluttered counters"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 55vw"
            />
            <p className="hero__caption">Ideas for rooms that work beautifully every day.</p>
          </div>
        </section>

        <section className="category-section page-width" aria-labelledby="category-heading">
          <div className="section-heading">
            <h2 id="category-heading">Shop by category</h2>
            <Link className="text-link" href="/categories">See all categories</Link>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <Link className="category-card" href={category.href} key={category.href}>
                <span className="category-card__image">
                  <Image src={category.image} alt="" fill sizes="(max-width: 760px) 50vw, 25vw" />
                </span>
                <span>{category.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="finds-section page-width" aria-labelledby="finds-heading">
          <div className="section-heading section-heading--stacked">
            <h2 id="finds-heading">Useful finds, carefully considered</h2>
            <p>Published recommendations will appear here only after their product facts and Amazon destination are verified.</p>
          </div>
          <EmptyState
            title={environment.configured ? "No published products yet" : "Connect Supabase to publish products"}
            description={
              environment.configured
                ? "The catalog is ready for the first reviewed recommendation."
                : "The public shell is ready. Add the project URL and anon key, then publish from the private dashboard."
            }
          />
        </section>
      </main>
      <footer className="public-footer">
        <div className="page-width public-footer__grid">
          <div>
            <p className="public-footer__name">Home Essentials</p>
            <p>Practical home finds and thoughtful guidance for everyday living.</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/terms-of-use">Terms</Link>
            <Link href="/affiliate-disclosure">Affiliate disclosure</Link>
          </nav>
          <p className="public-footer__disclosure">As an Amazon Associate I earn from qualifying purchases.</p>
        </div>
      </footer>
    </>
  );
}
