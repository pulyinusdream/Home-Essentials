import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="page-width public-footer__grid">
        <div className="public-footer__intro">
          <p className="public-footer__name">Home Essentials</p>
          <p>Reviewed home essentials and useful buying guides for everyday living.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms-of-use">Terms</Link>
          <Link href="/affiliate-disclosure">Affiliate disclosure</Link>
        </nav>
        <div className="public-footer__notes">
          <p>Amazon.com recommendations for US shoppers.</p>
          <p className="public-footer__disclosure">
            As an Amazon Associate I earn from qualifying purchases.
          </p>
        </div>
      </div>
    </footer>
  );
}
