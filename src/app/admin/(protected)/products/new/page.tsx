import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { QuickProductEditor } from "@/components/products/quick-product-editor";
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
          <h1>Add a product</h1>
          <p>Add the essentials now. Product details, specifications, and advanced search fields remain available after saving.</p>
        </div>
      </header>
      <QuickProductEditor
        categories={categories}
        role={session.profile.role}
      />
    </div>
  );
}
