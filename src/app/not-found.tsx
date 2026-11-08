import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-width" style={{ paddingBlock: "96px" }}>
      <section className="empty-state">
        <h1 style={{ margin: 0 }}>Page not found</h1>
        <p>The page may have moved, or the address may be incorrect.</p>
        <Link className="button button--primary" href="/">Return home</Link>
      </section>
    </main>
  );
}
