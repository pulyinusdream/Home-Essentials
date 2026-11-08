import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HomePage from "../src/app/page";
import { metadata } from "../src/app/layout";
import { EmptyState } from "../src/components/shared/empty-state";

describe("application shell", () => {
  it("identifies the publication in default metadata", () => {
    expect(metadata.title).toEqual({
      default: "Home Essentials",
      template: "%s | Home Essentials",
    });
  });

  it("renders an actionable empty state with semantic headings", () => {
    const html = renderToStaticMarkup(
      <EmptyState
        title="No products yet"
        description="Create the first verified product recommendation."
        action={<a href="/admin/products/new">Add product</a>}
      />,
    );

    expect(html).toContain("<h2");
    expect(html).toContain("No products yet");
    expect(html).toContain('href="/admin/products/new"');
  });

  it("renders the editorial promise and the required affiliate disclosure", async () => {
    const homePage = await HomePage();
    const html = renderToStaticMarkup(homePage);

    expect(html).toContain("Make Your Home Feel More Like Home.");
    expect(html).toContain(
      "As an Amazon Associate I earn from qualifying purchases.",
    );
  });
});
