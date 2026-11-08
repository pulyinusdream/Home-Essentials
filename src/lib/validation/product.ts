import { z } from "zod";

import { validateAmazonUrl } from "@/lib/affiliate/url";

const emptyToNull = (value: unknown) => {
  if (value === undefined || value === null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
};

const optionalText = (maximum = 10_000) =>
  z.preprocess(
    emptyToNull,
    z.string().trim().max(maximum).nullable().default(null),
  );

const optionalHttpsUrl = z.preprocess(
  emptyToNull,
  z
    .string()
    .url()
    .refine((value) => new URL(value).protocol === "https:", {
      message: "Use a secure HTTPS URL.",
    })
    .nullable()
    .default(null),
);

const optionalUuid = z.preprocess(
  emptyToNull,
  z.string().uuid().nullable().default(null),
);

const stringList = z
  .array(z.string().trim().min(1).max(500))
  .default([]);

const productBaseSchema = z.object({
  name: z.string().trim().min(1, "Product name is required.").max(240),
  slug: z
    .preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug.")
        .nullable()
        .default(null),
    ),
  categoryId: optionalUuid,
  brand: optionalText(160),
  model: optionalText(160),
  internalReference: optionalText(160),
  subcategory: optionalText(160),
  shortDescription: optionalText(500),
  description: optionalText(20_000),
  features: stringList,
  specifications: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(160),
        value: z.string().trim().min(1).max(500),
      }),
    )
    .default([]),
  recommendation: optionalText(5_000),
  benefits: stringList,
  pros: stringList,
  cons: stringList,
  idealFor: optionalText(2_000),
  thingsToConsider: optionalText(2_000),
  recommendedUse: optionalText(2_000),
  mainImageUrl: optionalHttpsUrl,
  mainImageAlt: optionalText(300),
  asin: z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{10}$/, "ASIN must contain 10 letters or numbers.")
      .nullable()
      .default(null),
  ),
  affiliateUrl: optionalText(2_000),
  affiliateConfirmed: z
    .preprocess(
      (value) => value === true || value === "true" || value === "on",
      z.boolean(),
    )
    .default(false),
  displayPrice: z.preprocess(
    emptyToNull,
    z.coerce.number().nonnegative().nullable().default(null),
  ),
  priceSource: z.enum(["none", "amazon_api"]).default("none"),
  seoTitle: optionalText(240),
  seoDescription: optionalText(500),
  focusKeyword: optionalText(160),
  canonicalUrl: optionalHttpsUrl,
  socialTitle: optionalText(240),
  socialDescription: optionalText(500),
  socialImageUrl: optionalHttpsUrl,
});

type ProductBaseInput = z.infer<typeof productBaseSchema>;

function addCommonProductIssues(
  value: ProductBaseInput,
  context: z.RefinementCtx,
) {
  if (value.displayPrice !== null && value.priceSource === "none") {
    context.addIssue({
      code: "custom",
      path: ["displayPrice"],
      message: "Manual prices cannot be published or saved as live price data.",
    });
  }

  if (value.affiliateUrl) {
    const affiliateResult = validateAmazonUrl(value.affiliateUrl, {
      expectedAsin: value.asin,
    });
    if (!affiliateResult.valid) {
      context.addIssue({
        code: "custom",
        path: ["affiliateUrl"],
        message: affiliateResult.reason,
      });
    }
  }
}

export const productDraftSchema = productBaseSchema.superRefine(
  addCommonProductIssues,
);

export const productPublishSchema = productBaseSchema.superRefine(
  (value, context) => {
    addCommonProductIssues(value, context);

    const required: Array<
      [keyof ProductBaseInput, string]
    > = [
      ["slug", "A URL slug is required before publishing."],
      ["categoryId", "Choose an active category before publishing."],
      ["shortDescription", "Add a short description before publishing."],
      ["description", "Add a complete description before publishing."],
      ["recommendation", "Add an editorial recommendation before publishing."],
      ["mainImageUrl", "Add a primary image before publishing."],
      ["mainImageAlt", "Add useful image alt text before publishing."],
      ["asin", "Add the Amazon ASIN before publishing."],
      ["affiliateUrl", "Add a verified Amazon.com link before publishing."],
      ["seoDescription", "Add an SEO description before publishing."],
    ];

    for (const [field, message] of required) {
      if (!value[field]) {
        context.addIssue({ code: "custom", path: [field], message });
      }
    }

    if (!value.affiliateConfirmed) {
      context.addIssue({
        code: "custom",
        path: ["affiliateConfirmed"],
        message: "Confirm that you generated and checked the affiliate link.",
      });
    }

    if (value.affiliateUrl) {
      const affiliateResult = validateAmazonUrl(value.affiliateUrl, {
        expectedAsin: value.asin,
        requireTrackingId: true,
      });
      if (!affiliateResult.valid) {
        context.addIssue({
          code: "custom",
          path: ["affiliateUrl"],
          message: affiliateResult.reason,
        });
      }
    }
  },
);

export type ProductDraftInput = z.infer<typeof productDraftSchema>;
export type ProductPublishInput = z.infer<typeof productPublishSchema>;
