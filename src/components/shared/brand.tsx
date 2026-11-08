import Link from "next/link";

export function Brand({ admin = false }: { admin?: boolean }) {
  return (
    <Link className="brand" href={admin ? "/admin" : "/"} aria-label="Home Essentials home">
      <span className="brand__mark" aria-hidden="true">HE</span>
      <span className="brand__name">Home Essentials</span>
    </Link>
  );
}
