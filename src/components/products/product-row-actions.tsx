"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  changeProductStatusAction,
  deleteProductAction,
  duplicateProductAction,
} from "@/services/products/mutations";
import { canDeleteProduct } from "@/services/products/workflow";
import type { PublicationStatus } from "@/types/database.types";

export function ProductRowActions({
  productId,
  status,
}: {
  productId: string;
  status: PublicationStatus;
}) {
  return (
    <details className="row-actions">
      <summary aria-label="Open product actions">
        <MoreHorizontal aria-hidden="true" />
      </summary>
      <div className="row-actions__menu">
        <Link href={`/admin/products/${productId}/edit`}>
          <Pencil aria-hidden="true" />
          Edit
        </Link>

        <form action={duplicateProductAction}>
          <input type="hidden" name="productId" value={productId} />
          <RowActionButton icon={Copy}>Duplicate</RowActionButton>
        </form>

        {status !== "published" && status !== "archived" ? (
          <StatusAction productId={productId} status="published">
            Publish
          </StatusAction>
        ) : null}
        {status === "published" ? (
          <StatusAction productId={productId} status="draft">
            Unpublish
          </StatusAction>
        ) : null}
        {status !== "archived" ? (
          <StatusAction productId={productId} status="archived">
            Archive
          </StatusAction>
        ) : (
          <StatusAction productId={productId} status="draft">
            Restore draft
          </StatusAction>
        )}

        {canDeleteProduct(status) ? (
          <form
            action={deleteProductAction}
            onSubmit={(event) => {
              if (!window.confirm("Permanently delete this product?")) {
                event.preventDefault();
              }
            }}
          >
            <input type="hidden" name="productId" value={productId} />
            <RowActionButton icon={Trash2} destructive>
              Delete
            </RowActionButton>
          </form>
        ) : null}
      </div>
    </details>
  );
}

function StatusAction({
  productId,
  status,
  children,
}: {
  productId: string;
  status: PublicationStatus;
  children: string;
}) {
  return (
    <form action={changeProductStatusAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="status" value={status} />
      <RowActionButton>{children}</RowActionButton>
    </form>
  );
}

function RowActionButton({
  children,
  icon: Icon,
  destructive = false,
}: {
  children: string;
  icon?: typeof Copy;
  destructive?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={destructive ? "is-destructive" : undefined}
    >
      {Icon ? <Icon aria-hidden="true" /> : null}
      {pending ? "Working…" : children}
    </button>
  );
}
