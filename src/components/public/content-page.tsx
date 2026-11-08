import type { ReactNode } from "react";

import { PublicShell } from "@/components/public/public-shell";

export function ContentPage({
  meta,
  title,
  introduction,
  children,
}: {
  meta?: string;
  title: string;
  introduction: string;
  children: ReactNode;
}) {
  return (
    <PublicShell>
      <header className="public-page-hero public-page-hero--compact page-width">
        <h1>{title}</h1>
        <p>{introduction}</p>
        {meta ? <p className="public-page-meta">{meta}</p> : null}
      </header>
      <article className="public-prose page-width">{children}</article>
    </PublicShell>
  );
}
