import Link from "next/link";

export function PublicFooter() {
  return (
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
        <p className="public-footer__disclosure">
          As an Amazon Associate I earn from qualifying purchases.
        </p>
      </div>
    </footer>
  );
}
