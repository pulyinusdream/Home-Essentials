import type { ReactNode } from "react";

import { PublicShell } from "@/components/public/public-shell";

export function ContentPage({
  eyebrow,
  title,
  introduction,
  children,
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  children: ReactNode;
}) {
  return (
    <PublicShell>
      <header className="public-page-hero public-page-hero--compact page-width">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{introduction}</p>
      </header>
      <article className="public-prose page-width">{children}</article>
    </PublicShell>
  );
}
