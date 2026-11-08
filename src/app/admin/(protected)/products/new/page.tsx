import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ProductEditor } from "@/components/products/product-editor/product-editor";
import { requireStaff } from "@/lib/auth/require-role";
import { listProductCategories } from "@/services/products/queries";

export const metadata: Metadata = {
  title: "Add product",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const [session, categories] = await Promise.all([
    requireStaff(),
    listProductCategories(),
  ]);

  return (
    <div className="admin-page admin-page--editor">
      <header className="editor-page-header">
        <Link href="/admin/products">
          <ArrowLeft aria-hidden="true" />
          Products
        </Link>
        <div>
          <p className="eyebrow">New recommendation</p>
          <h1>Add a product</h1>
          <p>Start with a name, save a draft, and complete each section before publishing.</p>
        </div>
      </header>
      <ProductEditor
        product={null}
        affiliateLink={null}
        categories={categories}
        role={session.profile.role}
      />
    </div>
  );
}
