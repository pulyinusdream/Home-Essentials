"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/shared/error-state";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <main className="page-width" style={{ paddingBlock: "72px" }}>
      <ErrorState
        description="The page could not be loaded. Check your connection and try again."
        retry={reset}
      />
    </main>
  );
}
