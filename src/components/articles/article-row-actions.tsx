"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  changeArticleStatusAction,
  deleteArticleAction,
  duplicateArticleAction,
} from "@/services/articles/mutations";
import type { PublicationStatus } from "@/types/database.types";

export function ArticleRowActions({ id, status }: { id: string; status: PublicationStatus }) {
  return (
    <details className="row-actions">
      <summary aria-label="Open buying guide actions"><MoreHorizontal aria-hidden="true" /></summary>
      <div className="row-actions__menu">
        <Link href={`/admin/articles/${id}/edit`}><Pencil aria-hidden="true" />Edit</Link>
        <form action={duplicateArticleAction}><input type="hidden" name="articleId" value={id} /><ActionButton icon={Copy}>Duplicate</ActionButton></form>
        {status !== "published" && status !== "archived" ? <StatusAction id={id} status="published">Publish</StatusAction> : null}
        {status === "published" ? <StatusAction id={id} status="draft">Unpublish</StatusAction> : null}
        {status !== "archived" ? <StatusAction id={id} status="archived">Archive</StatusAction> : <StatusAction id={id} status="draft">Restore draft</StatusAction>}
        {status === "draft" || status === "archived" ? (
          <form action={deleteArticleAction} onSubmit={(event) => { if (!window.confirm("Permanently delete this buying guide?")) event.preventDefault(); }}>
            <input type="hidden" name="articleId" value={id} />
            <ActionButton icon={Trash2} destructive>Delete</ActionButton>
          </form>
        ) : null}
      </div>
    </details>
  );
}

function StatusAction({ id, status, children }: { id: string; status: PublicationStatus; children: string }) {
  return <form action={changeArticleStatusAction}><input type="hidden" name="articleId" value={id} /><input type="hidden" name="status" value={status} /><ActionButton>{children}</ActionButton></form>;
}

function ActionButton({ children, icon: Icon, destructive = false }: { children: string; icon?: typeof Copy; destructive?: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className={destructive ? "is-destructive" : undefined}>{Icon ? <Icon aria-hidden="true" /> : null}{pending ? "Working…" : children}</button>;
}
