"use client";

import {
  type FormEvent,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  Check,
  CircleDollarSign,
  Link2,
  LockKeyhole,
} from "lucide-react";

import { validateAmazonUrl } from "@/lib/affiliate/url";
import {
  initialProductActionState,
  type ProductActionState,
} from "@/services/products/action-state";
import { createQuickProductAction } from "@/services/products/mutations";
import type { CategoryRow, StaffRole } from "@/types/database.types";

export function QuickProductEditor({
  categories,
  role,
}: {
  categories: Array<Pick<CategoryRow, "id" | "name" | "slug">>;
  role: StaffRole;
}) {
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const [state, formAction, pending] = useActionState<
    ProductActionState,
    FormData
  >(createQuickProductAction, initialProductActionState);
  const [dirty, setDirty] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [affiliateFeedback, setAffiliateFeedback] = useState<string | null>(null);
  const canManageAffiliate = role === "admin";

  const fieldErrors = useMemo(() => {
    const combined = { ...state.fieldErrors };
    for (const [field, message] of Object.entries(localErrors)) {
      if (message) combined[field] = [message];
      else delete combined[field];
    }
    return combined;
  }, [localErrors, state.fieldErrors]);

  useEffect(() => {
    const warnBeforeLeave = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeave);
    return () => window.removeEventListener("beforeunload", warnBeforeLeave);
  }, [dirty]);

  useEffect(() => {
    if (state.status !== "error") return;
    errorSummaryRef.current?.focus();
  }, [state]);

  function handleBlur(event: FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement;
    if (target.name === "name") {
      setLocalErrors((current) => ({
        ...current,
        name: target.value.trim() ? "" : "Product name is required.",
      }));
    }

    if (target.name !== "affiliateUrl") return;
    if (!target.value.trim()) {
      setAffiliateFeedback(null);
      setLocalErrors((current) => ({ ...current, affiliateUrl: "" }));
      return;
    }

    const result = validateAmazonUrl(target.value);
    if (!result.valid) {
      setAffiliateFeedback(null);
      setLocalErrors((current) => ({
        ...current,
        affiliateUrl: result.reason,
      }));
      return;
    }

    setLocalErrors((current) => ({ ...current, affiliateUrl: "" }));
    setAffiliateFeedback(
      result.trackingId
        ? `Product ${result.asin} recognized with tracking ID ${result.trackingId}.`
        : `Product ${result.asin} recognized. Add your Associates tracking ID before publishing.`,
    );
  }

  return (
    <form
      action={formAction}
      className="quick-product-editor"
      onBlur={handleBlur}
      onChange={() => setDirty(true)}
    >
      {state.status === "error" ? (
        <div
          className="editor-error-summary"
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
        >
          <AlertCircle aria-hidden="true" />
          <div>
            <h2>{state.message}</h2>
            {Object.entries(fieldErrors).length > 0 ? (
              <ul>
                {Object.entries(fieldErrors).map(([field, messages]) => (
                  <li key={field}>
                    <a href={`#quick-field-${field}`}>{messages[0]}</a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}

      <section className="quick-product-fields" aria-labelledby="quick-product-fields-title">
        <header className="quick-product-fields__header">
          <div>
            <h2 id="quick-product-fields-title">Product essentials</h2>
            <p>Enter the useful facts once. The ASIN, page address, descriptions, image text, and search summary are generated for you.</p>
          </div>
          <span>6 quick inputs</span>
        </header>

        <div className="quick-product-grid">
          <QuickField
            label="Product name"
            name="name"
            error={firstError(fieldErrors, "name")}
            required
          >
            <input
              id="quick-field-name"
              name="name"
              maxLength={240}
              placeholder="Vaunn Adjustable Overbed Table"
              required
            />
          </QuickField>

          <QuickField
            label="Category"
            name="categoryId"
            error={firstError(fieldErrors, "categoryId")}
            publishRequired
          >
            <select id="quick-field-categoryId" name="categoryId" defaultValue="">
              <option value="">Choose a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </QuickField>
        </div>

        <QuickField
          label="Short recommendation"
          name="recommendation"
          error={firstError(fieldErrors, "recommendation")}
          hint="In a few original sentences, explain who it helps, why it is useful, and one thing to consider."
          publishRequired
        >
          <textarea
            id="quick-field-recommendation"
            name="recommendation"
            rows={5}
            maxLength={5_000}
            placeholder="A practical choice for…"
          />
        </QuickField>

        <QuickField
          label="Product image URL"
          name="mainImageUrl"
          error={firstError(fieldErrors, "mainImageUrl")}
          hint="Use a public HTTPS image URL that you are authorized to publish."
          publishRequired
        >
          <input
            id="quick-field-mainImageUrl"
            name="mainImageUrl"
            type="url"
            inputMode="url"
            placeholder="https://…"
          />
        </QuickField>

        <div className="quick-product-amazon">
          <div className="quick-product-amazon__heading">
            <Link2 aria-hidden="true" />
            <div>
              <h2>Amazon destination</h2>
              <p>The product ASIN and tracking ID are read from the exact link.</p>
            </div>
          </div>

          {canManageAffiliate ? (
            <>
              <QuickField
                label="Amazon.com affiliate URL"
                name="affiliateUrl"
                error={firstError(fieldErrors, "affiliateUrl")}
                hint="Paste the long product link generated by SiteStripe."
                publishRequired
              >
                <input
                  id="quick-field-affiliateUrl"
                  name="affiliateUrl"
                  type="url"
                  inputMode="url"
                  placeholder="https://www.amazon.com/dp/…?tag=…"
                />
              </QuickField>
              {affiliateFeedback ? (
                <p className="affiliate-feedback" role="status">
                  <Check aria-hidden="true" />
                  {affiliateFeedback}
                </p>
              ) : null}
              <label className="confirmation-check" id="quick-field-affiliateConfirmed">
                <input type="checkbox" name="affiliateConfirmed" />
                <span>I generated and checked this link in Amazon Associates.</span>
              </label>
              <FieldError message={firstError(fieldErrors, "affiliateConfirmed")} />
            </>
          ) : (
            <div className="editor-permission-note">
              <LockKeyhole aria-hidden="true" />
              <div>
                <strong>Administrator review required</strong>
                <p>Only an administrator can add and verify the Amazon link. Save this product as a draft for review.</p>
              </div>
            </div>
          )}
        </div>

        <p className="quick-product-price-note">
          <CircleDollarSign aria-hidden="true" />
          Price is left blank because Amazon prices can change. You can add optional product details after saving.
        </p>
      </section>

      <footer className="quick-product-actions">
        <span className={dirty ? "unsaved-state is-dirty" : "unsaved-state"}>
          {dirty ? "Unsaved changes" : "Ready for your first entry"}
        </span>
        <div>
          <button
            type="submit"
            name="intent"
            value="draft"
            disabled={pending}
            className="editor-button editor-button--secondary"
          >
            {pending ? "Working…" : "Save draft"}
          </button>
          <button
            type="submit"
            name="intent"
            value="publish"
            disabled={pending || !canManageAffiliate}
            className="editor-button editor-button--primary"
            title={!canManageAffiliate ? "An administrator must add and verify the Amazon link." : undefined}
          >
            {pending ? "Working…" : "Publish product"}
          </button>
        </div>
      </footer>
    </form>
  );
}

function QuickField({
  label,
  name,
  hint,
  error,
  required = false,
  publishRequired = false,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
  publishRequired?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={error ? "editor-field has-error" : "editor-field"}>
      <span className="editor-field__label-row">
        <label htmlFor={`quick-field-${name}`}>{label}</label>
        {required ? <em>Required</em> : null}
        {!required && publishRequired ? (
          <em>Required to publish</em>
        ) : null}
      </span>
      {children}
      {hint ? <small>{hint}</small> : null}
      <FieldError message={error} />
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? (
    <span className="field-error">
      <AlertCircle aria-hidden="true" />
      {message}
    </span>
  ) : null;
}

function firstError(errors: Record<string, string[]>, field: string) {
  return errors[field]?.[0] || undefined;
}
