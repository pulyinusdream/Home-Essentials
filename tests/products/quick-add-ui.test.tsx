// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/products/mutations", () => ({
  createQuickProductAction: vi.fn(),
}));

import { QuickProductEditor } from "@/components/products/quick-product-editor";

const categories = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Bedroom Essentials",
    slug: "bedroom-essentials",
  },
];

afterEach(cleanup);

describe("QuickProductEditor", () => {
  it("shows only the essential product fields to an administrator", () => {
    render(<QuickProductEditor categories={categories} role="admin" />);

    expect(screen.getByLabelText("Product name")).toBeTruthy();
    expect(screen.getByLabelText("Category")).toBeTruthy();
    expect(screen.getByLabelText("Short recommendation")).toBeTruthy();
    expect(screen.getByLabelText("Product image URL")).toBeTruthy();
    expect(screen.getByLabelText("Amazon.com affiliate URL")).toBeTruthy();
    expect(
      screen.getByLabelText(/I generated and checked this link/i),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Publish product" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Save draft" })).toBeTruthy();

    expect(screen.queryByLabelText("Model")).toBeNull();
    expect(screen.queryByText("Specifications")).toBeNull();
    expect(screen.queryByText("Pricing")).toBeNull();
    expect(screen.queryByText("SEO & social")).toBeNull();
  });

  it("keeps draft creation available without exposing affiliate controls to editors", () => {
    render(<QuickProductEditor categories={categories} role="editor" />);

    expect(screen.queryByLabelText("Amazon.com affiliate URL")).toBeNull();
    expect(
      screen.getByText(/Only an administrator can add and verify the Amazon link/i),
    ).toBeTruthy();
    expect(
      (screen.getByRole("button", { name: "Publish product" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(
      (screen.getByRole("button", { name: "Save draft" }) as HTMLButtonElement)
        .disabled,
    ).toBe(false);
  });
});
