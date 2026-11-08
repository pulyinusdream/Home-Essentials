import { Menu, Search } from "lucide-react";
import Link from "next/link";

import { Brand } from "@/components/shared/brand";

const links = [
  ["Home", "/"],
  ["Categories", "/categories"],
  ["Home Finds", "/products"],
  ["Guides", "/guides"],
  ["About", "/about"],
] as const;

export function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-header__inner">
        <Brand />
        <nav aria-label="Primary navigation" className="public-nav">
          {links.map(([label, href]) => (
            <Link href={href} key={href}>{label}</Link>
          ))}
        </nav>
        <div className="public-header__actions">
          <Link className="icon-link" href="/products#product-search" aria-label="Search Home Essentials">
            <Search size={19} strokeWidth={1.6} aria-hidden="true" />
          </Link>
          <details className="mobile-menu">
            <summary className="icon-link" aria-label="Open navigation">
              <Menu size={20} strokeWidth={1.6} aria-hidden="true" />
            </summary>
            <nav aria-label="Mobile navigation" className="mobile-menu__panel">
              {links.map(([label, href]) => (
                <Link href={href} key={href}>{label}</Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
