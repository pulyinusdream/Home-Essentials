import type { Metadata } from "next";
import Link from "next/link";
import { PackagePlus, Search } from "lucide-react";

import { AdminDataTable } from "@/components/admin/data-table";
import { ProductRowActions } from "@/components/products/product-row-actions";
import { ProductStatus } from "@/components/products/product-status";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { listProductCategories, listProducts } from "@/services/products/queries";

export const metadata: Metadata = {
  title: "Products",
  robots: { index: false, follow: false },
};

const NOTICE: Record<string, string> = {
  "status-updated": "Product status updated.",
  deleted: "Product permanently deleted.",
  "publish-incomplete": "Complete the required editor sections before publishing.",
  "archive-before-delete": "Archive or return the product to draft before deleting it.",
  "duplicate-failed": "The product could not be duplicated.",
  "status-failed": "The product status could not be changed.",
  "invalid-transition": "That status change is not allowed.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    category?: string;
    page?: string;
    notice?: string;
  }>;
}) {
  const parameters = await searchParams;
  const loaded = await Promise.all([
      listProducts(parameters),
      listProductCategories(),
    ])
    .then(([result, categories]) => ({ result, categories }))
    .catch(() => null);

  if (!loaded) {
    return (
      <div className="admin-page">
        <ErrorState
          title="Products could not be loaded"
          description="Check the Supabase connection and try this page again. No product data was changed."
        />
      </div>
    );
  }

  const { result, categories } = loaded;
  const notice = parameters.notice ? NOTICE[parameters.notice] : null;

  return (
      <div className="admin-page product-list-page">
        <header className="admin-page-header admin-page-header--actions">
          <div>
            <p className="eyebrow">Catalog</p>
            <h1>Products</h1>
            <p>
              Build useful recommendations first, then publish only after the
              Amazon link and compliance checks are ready.
            </p>
          </div>
          <Link className="admin-primary-action" href="/admin/products/new">
            <PackagePlus aria-hidden="true" />
            Add product
          </Link>
        </header>

        {notice ? (
          <p className="admin-notice" role="status">
            {notice}
          </p>
        ) : null}

        <form className="product-filters" method="get">
          <label className="search-field">
            <span className="sr-only">Search products</span>
            <Search aria-hidden="true" />
            <input
              type="search"
              name="search"
              defaultValue={parameters.search}
              placeholder="Search product name"
            />
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select name="status" defaultValue={parameters.status ?? "all"}>
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_review">In review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <select name="category" defaultValue={parameters.category ?? ""}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Apply filters</button>
          <Link href="/admin/products">Reset</Link>
        </form>

        {result.items.length === 0 ? (
          <EmptyState
            title={parameters.search ? "No matching products" : "No products yet"}
            description={
              parameters.search
                ? "Try a different name or clear the current filters."
                : "Create the first product as a draft. Nothing goes public until you publish it."
            }
            action={
              <Link className="button button--primary" href="/admin/products/new">
                Add first product
              </Link>
            }
          />
        ) : (
          <>
            <AdminDataTable
              caption="Home Essentials products"
              headers={["Product", "Category", "Status", "Updated", "Actions"]}
            >
              {result.items.map((product) => (
                <tr key={product.id}>
                  <th scope="row">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <span>{product.name}</span>
                      <small>{product.brand || product.slug}</small>
                    </Link>
                  </th>
                  <td>{product.category?.name ?? "Uncategorized"}</td>
                  <td>
                    <ProductStatus status={product.status} />
                  </td>
                  <td>
                    <time dateTime={product.updated_at}>
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(product.updated_at))}
                    </time>
                  </td>
                  <td>
                    <ProductRowActions productId={product.id} status={product.status} />
                  </td>
                </tr>
              ))}
            </AdminDataTable>

            <nav className="admin-pagination" aria-label="Product pages">
              <span>
                {result.total} {result.total === 1 ? "product" : "products"}
              </span>
              <div>
                {result.page > 1 ? (
                  <Link href={pageHref(parameters, result.page - 1)}>Previous</Link>
                ) : (
                  <span aria-disabled="true">Previous</span>
                )}
                <span>
                  Page {result.page} of {result.totalPages}
                </span>
                {result.page < result.totalPages ? (
                  <Link href={pageHref(parameters, result.page + 1)}>Next</Link>
                ) : (
                  <span aria-disabled="true">Next</span>
                )}
              </div>
            </nav>
          </>
        )}
      </div>
  );
}

function pageHref(
  parameters: Record<string, string | undefined>,
  page: number,
) {
  const query = new URLSearchParams();
  for (const key of ["search", "status", "category"] as const) {
    if (parameters[key]) query.set(key, parameters[key]);
  }
  query.set("page", String(page));
  return `/admin/products?${query.toString()}`;
}
