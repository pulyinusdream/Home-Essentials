// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/products/mutations", () => ({
  createQuickProductAction: vi.fn(),
}));

import { QuickProductEditor } from "@/components/products/quick-product-editor";
import { createQuickProductAction } from "@/services/products/mutations";

const categories = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Bedroom Essentials",
    slug: "bedroom-essentials",
  },
];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

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

  it("keeps entered values when server validation returns an error", async () => {
    vi.mocked(createQuickProductAction).mockResolvedValueOnce({
      status: "error",
      message: "Review the highlighted sections before saving.",
      fieldErrors: {
        recommendation: ["Add an editorial recommendation before publishing."],
      },
    });
    render(<QuickProductEditor categories={categories} role="admin" />);

    const name = screen.getByLabelText("Product name") as HTMLInputElement;
    const recommendation = screen.getByLabelText(
      "Short recommendation",
    ) as HTMLTextAreaElement;
    fireEvent.change(name, { target: { value: "Accessible overbed table" } });
    fireEvent.change(recommendation, {
      target: { value: "Useful beside a bed or couch." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Publish product" }));

    await waitFor(() => expect(createQuickProductAction).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(name.value).toBe("Accessible overbed table");
    expect(recommendation.value).toBe("Useful beside a bed or couch.");
  });
});
