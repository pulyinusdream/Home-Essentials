import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ProductEditor } from "@/components/products/product-editor/product-editor";
import { ProductStatus } from "@/components/products/product-status";
import { requireStaff } from "@/lib/auth/require-role";
import {
  getProductEditorRecord,
  listProductCategories,
} from "@/services/products/queries";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; duplicated?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const [session, categories, record] = await Promise.all([
    requireStaff(),
    listProductCategories(),
    getProductEditorRecord(id),
  ]);
  if (!record) notFound();

  return (
    <div className="admin-page admin-page--editor">
      <header className="editor-page-header editor-page-header--status">
        <Link href="/admin/products">
          <ArrowLeft aria-hidden="true" />
          Products
        </Link>
        <div>
          <p className="eyebrow">Product editor</p>
          <h1>{record.product.name}</h1>
          <ProductStatus status={record.product.status} />
        </div>
      </header>
      {query.saved === "1" ? (
        <p className="admin-notice" role="status">Product saved successfully.</p>
      ) : null}
      {query.duplicated === "1" ? (
        <p className="admin-notice" role="status">
          Duplicate created as a draft. Recheck the affiliate link before publishing.
        </p>
      ) : null}
      <ProductEditor
        product={record.product}
        affiliateLink={record.affiliateLink}
        categories={categories}
        role={session.profile.role}
      />
    </div>
  );
}
