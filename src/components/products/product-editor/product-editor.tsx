"use client";

import Link from "next/link";
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
  Circle,
  ExternalLink,
  Eye,
  Link2,
  LockKeyhole,
} from "lucide-react";

import { ProductStatus } from "@/components/products/product-status";
import {
  DynamicSpecifications,
  DynamicTextList,
} from "@/components/products/product-editor/dynamic-fields";
import { validateAmazonUrl } from "@/lib/affiliate/url";
import {
  initialProductActionState,
  type ProductActionState,
} from "@/services/products/action-state";
import {
  createProductAction,
  updateProductAction,
} from "@/services/products/mutations";
import type {
  AffiliateLinkRow,
  CategoryRow,
  Json,
  ProductRow,
  StaffRole,
} from "@/types/database.types";

type EditorSection = {
  id: string;
  label: string;
  fields: string[];
};

const SECTIONS: EditorSection[] = [
  { id: "basics", label: "Basics", fields: ["name", "slug", "categoryId", "shortDescription", "description"] },
  { id: "images", label: "Images", fields: ["mainImageUrl", "mainImageAlt"] },
  { id: "specifications", label: "Specifications", fields: ["features", "specifications"] },
  { id: "amazon", label: "Amazon", fields: ["asin", "affiliateUrl", "affiliateConfirmed"] },
  { id: "recommendation", label: "Recommendation", fields: ["recommendation", "benefits", "pros", "cons"] },
  { id: "pricing", label: "Pricing", fields: ["displayPrice"] },
  { id: "seo", label: "SEO & social", fields: ["seoTitle", "seoDescription", "focusKeyword", "canonicalUrl"] },
  { id: "publishing", label: "Publishing", fields: [] },
];

type CompletionState = {
  basics: boolean;
  image: boolean;
  amazon: boolean;
  recommendation: boolean;
  seo: boolean;
};

export function ProductEditor({
  product,
  affiliateLink,
  categories,
  role,
}: {
  product: ProductRow | null;
  affiliateLink: AffiliateLinkRow | null;
  categories: Array<Pick<CategoryRow, "id" | "name" | "slug">>;
  role: StaffRole;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const action = product
    ? updateProductAction.bind(null, product.id)
    : createProductAction;
  const [state, formAction, pending] = useActionState<
    ProductActionState,
    FormData
  >(action, initialProductActionState);
  const [dirty, setDirty] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [affiliateFeedback, setAffiliateFeedback] = useState<string | null>(null);
  const [completion, setCompletion] = useState<CompletionState>(() =>
    initialCompletion(product, affiliateLink),
  );

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
    if (state.status === "error") {
      errorSummaryRef.current?.focus();
    }
  }, [state]);

  const features = jsonStringArray(product?.features);
  const benefits = jsonStringArray(product?.benefits);
  const pros = jsonStringArray(product?.pros);
  const cons = jsonStringArray(product?.cons);
  const specifications = jsonSpecifications(product?.specifications);
  const affiliateConfirmed =
    affiliateLink?.status === "active" && Boolean(affiliateLink.last_verified_at);
  const canManageAffiliate = role === "admin";

  function updateCompletion() {
    if (!formRef.current) return;
    const values = new FormData(formRef.current);
    const present = (name: string) => Boolean(String(values.get(name) ?? "").trim());
    setCompletion({
      basics:
        present("name") &&
        present("slug") &&
        present("categoryId") &&
        present("shortDescription") &&
        present("description"),
      image: present("mainImageUrl") && present("mainImageAlt"),
      amazon:
        present("asin") &&
        present("affiliateUrl") &&
        values.get("affiliateConfirmed") === "on",
      recommendation: present("recommendation"),
      seo: present("seoDescription"),
    });
  }

  function handleChange() {
    setDirty(true);
    updateCompletion();
  }

  function handleBlur(event: FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (target.name === "name") {
      setLocalErrors((current) => ({
        ...current,
        name: target.value.trim() ? "" : "Product name is required.",
      }));
    }

    if (target.name === "affiliateUrl") {
      if (!target.value.trim()) {
        setAffiliateFeedback(null);
        return;
      }
      const asin = String(new FormData(event.currentTarget).get("asin") ?? "");
      const result = validateAmazonUrl(target.value, { expectedAsin: asin });
      if (result.valid) {
        setAffiliateFeedback(
          `Amazon.com product link recognized${result.trackingId ? ` with tracking ID ${result.trackingId}` : "; add an Associates tracking ID before publishing"}.`,
        );
        setLocalErrors((current) => ({ ...current, affiliateUrl: "" }));
      } else {
        setAffiliateFeedback(null);
        setLocalErrors((current) => ({
          ...current,
          affiliateUrl: result.reason,
        }));
      }
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="product-editor"
      onChange={handleChange}
      onBlur={handleBlur}
    >
      <aside className="product-editor-nav" aria-label="Product editor sections">
        <p>Editor sections</p>
        <nav>
          {SECTIONS.map((section, index) => {
            const hasError = section.fields.some((field) => fieldErrors[field]?.[0]);
            return (
              <a key={section.id} href={`#${section.id}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {section.label}
                {hasError ? <AlertCircle aria-label="Contains an error" /> : null}
              </a>
            );
          })}
        </nav>
      </aside>

      <div className="product-editor-content">
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
                      <a href={`#field-${field}`}>{messages[0]}</a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        ) : null}

        <EditorSection id="basics" number="01" title="Basics" description="Name the product clearly and give readers enough context to understand what it is.">
          <div className="editor-field-grid editor-field-grid--two">
            <EditorField label="Product name" name="name" error={firstError(fieldErrors, "name")} required>
              <input id="field-name" name="name" defaultValue={product?.name ?? ""} maxLength={240} required />
            </EditorField>
            <EditorField label="URL slug" name="slug" error={firstError(fieldErrors, "slug")} hint="Generated from the name when left blank.">
              <input id="field-slug" name="slug" defaultValue={product?.slug ?? ""} placeholder="expandable-drawer-organizer" />
            </EditorField>
            <EditorField label="Category" name="categoryId" error={firstError(fieldErrors, "categoryId")}>
              <select id="field-categoryId" name="categoryId" defaultValue={product?.category_id ?? ""}>
                <option value="">Choose a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </EditorField>
            <EditorField label="Subcategory" name="subcategory">
              <input id="field-subcategory" name="subcategory" defaultValue={product?.subcategory ?? ""} placeholder="Drawer organization" />
            </EditorField>
            <EditorField label="Brand" name="brand">
              <input id="field-brand" name="brand" defaultValue={product?.brand ?? ""} />
            </EditorField>
            <EditorField label="Model" name="model">
              <input id="field-model" name="model" defaultValue={product?.model ?? ""} />
            </EditorField>
            <EditorField label="Internal reference" name="internalReference" hint="Private identifier, such as HE-KIT-001.">
              <input id="field-internalReference" name="internalReference" defaultValue={product?.internal_reference ?? ""} />
            </EditorField>
          </div>
          <EditorField label="Short description" name="shortDescription" error={firstError(fieldErrors, "shortDescription")} hint="Used on product cards and search previews.">
            <textarea id="field-shortDescription" name="shortDescription" rows={3} maxLength={500} defaultValue={product?.short_description ?? ""} />
          </EditorField>
          <EditorField label="Full description" name="description" error={firstError(fieldErrors, "description")}>
            <textarea id="field-description" name="description" rows={7} defaultValue={product?.description ?? ""} />
          </EditorField>
        </EditorSection>

        <EditorSection id="images" number="02" title="Images" description="Use an image you are authorized to publish and describe it for people using assistive technology.">
          <EditorField label="Primary image URL" name="mainImageUrl" error={firstError(fieldErrors, "mainImageUrl")} hint="Paste a public HTTPS image URL that you are authorized to use.">
            <input id="field-mainImageUrl" name="mainImageUrl" type="url" inputMode="url" defaultValue={product?.main_image_url ?? ""} placeholder="https://…" />
          </EditorField>
          <EditorField label="Image alt text" name="mainImageAlt" error={firstError(fieldErrors, "mainImageAlt")} hint="Describe the product and relevant setting; do not start with ‘image of’.">
            <input id="field-mainImageAlt" name="mainImageAlt" defaultValue={product?.main_image_alt ?? ""} maxLength={300} />
          </EditorField>
        </EditorSection>

        <EditorSection id="specifications" number="03" title="Specifications" description="Keep product facts structured so comparisons stay consistent.">
          <DynamicTextList name="feature" label="Key features" addLabel="Add feature" placeholder="Expandable width" initialValues={features} />
          <DynamicSpecifications initialValues={specifications} />
        </EditorSection>

        <EditorSection id="amazon" number="04" title="Amazon" description="Paste the exact Amazon Associates link. The platform never fabricates or rewrites affiliate destinations.">
          {!canManageAffiliate ? (
            <div className="editor-permission-note">
              <LockKeyhole aria-hidden="true" />
              Only an administrator can change or verify affiliate links.
            </div>
          ) : null}
          <div className="editor-field-grid editor-field-grid--amazon">
            <EditorField label="ASIN" name="asin" error={firstError(fieldErrors, "asin")}>
              <input id="field-asin" name="asin" defaultValue={affiliateLink?.asin ?? ""} maxLength={10} readOnly={!canManageAffiliate} />
            </EditorField>
            <EditorField label="Amazon.com affiliate URL" name="affiliateUrl" error={firstError(fieldErrors, "affiliateUrl")}>
              <input id="field-affiliateUrl" name="affiliateUrl" type="url" inputMode="url" defaultValue={affiliateLink?.affiliate_url ?? ""} placeholder="https://www.amazon.com/dp/…?tag=…" readOnly={!canManageAffiliate} />
            </EditorField>
          </div>
          {affiliateFeedback ? <p className="affiliate-feedback"><Check aria-hidden="true" />{affiliateFeedback}</p> : null}
          {affiliateLink?.affiliate_url ? (
            <div className="exact-link-preview">
              <div><Link2 aria-hidden="true" /><span>Exact saved destination</span></div>
              <code>{affiliateLink.affiliate_url}</code>
              <a href={affiliateLink.affiliate_url} target="_blank" rel="noopener noreferrer">Open and verify <ExternalLink aria-hidden="true" /></a>
            </div>
          ) : null}
          {canManageAffiliate ? (
            <label className="confirmation-check" id="field-affiliateConfirmed">
              <input type="checkbox" name="affiliateConfirmed" defaultChecked={affiliateConfirmed} />
              <span>I generated this link in Amazon Associates and checked that it opens the correct product.</span>
            </label>
          ) : (
            <input type="hidden" name="affiliateConfirmed" value={affiliateConfirmed ? "on" : ""} />
          )}
          <FieldError message={firstError(fieldErrors, "affiliateConfirmed")} />
        </EditorSection>

        <EditorSection id="recommendation" number="05" title="Recommendation" description="Explain who the product is for, why it is useful, and what readers should consider before buying.">
          <EditorField label="Editorial recommendation" name="recommendation" error={firstError(fieldErrors, "recommendation")}>
            <textarea id="field-recommendation" name="recommendation" rows={6} defaultValue={product?.recommendation ?? ""} />
          </EditorField>
          <div className="editor-field-grid editor-field-grid--two">
            <DynamicTextList name="benefit" label="Benefits" addLabel="Add benefit" placeholder="Makes utensils easier to find" initialValues={benefits} />
            <DynamicTextList name="pro" label="Pros" addLabel="Add pro" placeholder="Adjustable width" initialValues={pros} />
            <DynamicTextList name="con" label="Things to weigh" addLabel="Add consideration" placeholder="Measure the drawer first" initialValues={cons} />
          </div>
          <div className="editor-field-grid editor-field-grid--two">
            <EditorField label="Ideal for" name="idealFor"><textarea id="field-idealFor" name="idealFor" rows={4} defaultValue={product?.ideal_for ?? ""} /></EditorField>
            <EditorField label="Things to consider" name="thingsToConsider"><textarea id="field-thingsToConsider" name="thingsToConsider" rows={4} defaultValue={product?.things_to_consider ?? ""} /></EditorField>
          </div>
          <EditorField label="Recommended use" name="recommendedUse"><textarea id="field-recommendedUse" name="recommendedUse" rows={4} defaultValue={product?.recommended_use ?? ""} /></EditorField>
        </EditorSection>

        <EditorSection id="pricing" number="06" title="Pricing" description="Amazon prices can change frequently, so manual prices never appear on the public website.">
          <div className="price-safeguard">
            <LockKeyhole aria-hidden="true" />
            <div>
              <h3>Price display is API-controlled</h3>
              <p>Prices remain hidden until a future approved Amazon API connection supplies an amount, currency, and fresh verification timestamp.</p>
            </div>
          </div>
        </EditorSection>

        <EditorSection id="seo" number="07" title="SEO & social" description="Write accurate search copy. Ratings and review schema are intentionally not supported.">
          <div className="editor-field-grid editor-field-grid--two">
            <EditorField label="SEO title" name="seoTitle"><input id="field-seoTitle" name="seoTitle" defaultValue={product?.seo_title ?? ""} maxLength={240} /></EditorField>
            <EditorField label="Focus keyword" name="focusKeyword"><input id="field-focusKeyword" name="focusKeyword" defaultValue={product?.focus_keyword ?? ""} maxLength={160} /></EditorField>
          </div>
          <EditorField label="SEO description" name="seoDescription" error={firstError(fieldErrors, "seoDescription")} hint="Aim for a clear, useful summary rather than keyword repetition.">
            <textarea id="field-seoDescription" name="seoDescription" rows={4} maxLength={500} defaultValue={product?.seo_description ?? ""} />
          </EditorField>
          <EditorField label="Canonical URL" name="canonicalUrl"><input id="field-canonicalUrl" name="canonicalUrl" type="url" defaultValue={product?.canonical_url ?? ""} placeholder="https://…" /></EditorField>
          <div className="editor-field-grid editor-field-grid--two">
            <EditorField label="Social title" name="socialTitle"><input id="field-socialTitle" name="socialTitle" defaultValue={product?.social_title ?? ""} /></EditorField>
            <EditorField label="Social image URL" name="socialImageUrl"><input id="field-socialImageUrl" name="socialImageUrl" type="url" defaultValue={product?.social_image_url ?? ""} placeholder="https://…" /></EditorField>
          </div>
          <EditorField label="Social description" name="socialDescription"><textarea id="field-socialDescription" name="socialDescription" rows={3} defaultValue={product?.social_description ?? ""} /></EditorField>
        </EditorSection>

        <EditorSection id="publishing" number="08" title="Publishing" description="Save early as a draft. Publish only when every required check is complete.">
          <div className="publishing-panel">
            <div>
              <p>Current status</p>
              <ProductStatus status={product?.status ?? "draft"} />
            </div>
            <ul>
              <CompletionItem complete={completion.basics}>Basics and category</CompletionItem>
              <CompletionItem complete={completion.image}>Primary image and alt text</CompletionItem>
              <CompletionItem complete={completion.amazon}>Verified Amazon link</CompletionItem>
              <CompletionItem complete={completion.recommendation}>Editorial recommendation</CompletionItem>
              <CompletionItem complete={completion.seo}>SEO description</CompletionItem>
            </ul>
          </div>
        </EditorSection>
      </div>

      <footer className="product-editor-actions">
        <div>
          <span className={dirty ? "unsaved-state is-dirty" : "unsaved-state"}>
            {dirty ? "Unsaved changes" : "No unsaved changes"}
          </span>
          {product ? (
            <Link href={`/admin/products/${product.id}/preview`}>
              <Eye aria-hidden="true" /> Preview
            </Link>
          ) : null}
        </div>
        <div>
          <button type="submit" name="intent" value="draft" disabled={pending} className="editor-button editor-button--secondary">
            {pending ? "Saving…" : "Save draft"}
          </button>
          <button type="submit" name="intent" value="review" disabled={pending} className="editor-button editor-button--secondary">Send to review</button>
          <button type="submit" name="intent" value="publish" disabled={pending} className="editor-button editor-button--primary">Publish</button>
        </div>
      </footer>
    </form>
  );
}

function EditorSection({ id, number, title, description, children }: { id: string; number: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="editor-section" id={id} aria-labelledby={`${id}-title`}>
      <header><span>{number}</span><div><h2 id={`${id}-title`}>{title}</h2><p>{description}</p></div></header>
      <div className="editor-section__body">{children}</div>
    </section>
  );
}

function EditorField({ label, name, hint, error, required = false, children }: { label: string; name: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className={error ? "editor-field has-error" : "editor-field"} htmlFor={`field-${name}`}>
      <span>{label}{required ? <em>Required</em> : null}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
      <FieldError message={error} />
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error"><AlertCircle aria-hidden="true" />{message}</span> : null;
}

function CompletionItem({ complete, children }: { complete: boolean; children: React.ReactNode }) {
  return <li className={complete ? "is-complete" : undefined}>{complete ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}<span>{children}</span></li>;
}

function firstError(errors: Record<string, string[]>, field: string) {
  return errors[field]?.[0] || undefined;
}

function jsonStringArray(value: Json | undefined) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function jsonSpecifications(value: Json | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value).flatMap(([name, specification]) =>
    typeof specification === "string" ? [{ name, value: specification }] : [],
  );
}

function initialCompletion(product: ProductRow | null, affiliateLink: AffiliateLinkRow | null): CompletionState {
  return {
    basics: Boolean(product?.name && product.slug && product.category_id && product.short_description && product.description),
    image: Boolean(product?.main_image_url && product.main_image_alt),
    amazon: Boolean(affiliateLink?.asin && affiliateLink.affiliate_url && affiliateLink.status === "active"),
    recommendation: Boolean(product?.recommendation),
    seo: Boolean(product?.seo_description),
  };
}
