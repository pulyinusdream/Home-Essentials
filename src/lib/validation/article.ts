import { z } from "zod";

const blockId = z.string().uuid();
const secureUrl = z
  .string()
  .url()
  .refine((value) => new URL(value).protocol === "https:", "Use a secure HTTPS URL.");

export const paragraphBlockSchema = z.object({
  id: blockId,
  type: z.literal("paragraph"),
  text: z.string().trim().min(1).max(10_000),
});

export const headingBlockSchema = z.object({
  id: blockId,
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text: z.string().trim().min(1).max(240),
});

export const listBlockSchema = z.object({
  id: blockId,
  type: z.literal("list"),
  style: z.enum(["bulleted", "numbered"]),
  items: z.array(z.string().trim().min(1).max(500)).min(1).max(50),
});

export const imageBlockSchema = z.object({
  id: blockId,
  type: z.literal("image"),
  url: secureUrl,
  alt: z.string().trim().min(1).max(300),
  caption: z.string().trim().max(500).optional().default(""),
});

export const productBlockSchema = z.object({
  id: blockId,
  type: z.literal("product"),
  productId: z.string().uuid(),
  note: z.string().trim().max(2_000).optional().default(""),
});

export const relatedArticleBlockSchema = z.object({
  id: blockId,
  type: z.literal("relatedArticle"),
  articleId: z.string().uuid(),
  label: z.string().trim().max(240).optional().default(""),
});

export const articleBlockSchema = z.discriminatedUnion("type", [
  paragraphBlockSchema,
  headingBlockSchema,
  listBlockSchema,
  imageBlockSchema,
  productBlockSchema,
  relatedArticleBlockSchema,
]);

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

const optionalUuid = z.preprocess(
  emptyToNull,
  z.string().uuid().nullable().default(null),
);

const optionalUrl = z.preprocess(
  emptyToNull,
  secureUrl.nullable().default(null),
);

const articleBaseSchema = z.object({
  title: z.string().trim().min(1, "Guide title is required.").max(240),
  slug: z.preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug.")
      .nullable()
      .default(null),
  ),
  excerpt: optionalText(700),
  content: z.array(articleBlockSchema).default([]),
  featuredImageUrl: optionalUrl,
  featuredImageAlt: optionalText(300),
  categoryId: optionalUuid,
  seoTitle: optionalText(240),
  seoDescription: optionalText(500),
  focusKeyword: optionalText(160),
  canonicalUrl: optionalUrl,
  socialTitle: optionalText(240),
  socialDescription: optionalText(500),
});

export const articleDraftSchema = articleBaseSchema;

export const articlePublishSchema = articleBaseSchema.superRefine(
  (value, context) => {
    const required: Array<[keyof typeof value, string]> = [
      ["slug", "A URL slug is required before publishing."],
      ["excerpt", "Add a useful guide summary before publishing."],
      ["categoryId", "Choose a category before publishing."],
      ["featuredImageUrl", "Add a cover image before publishing."],
      ["featuredImageAlt", "Add cover-image alt text before publishing."],
      ["seoDescription", "Add an SEO description before publishing."],
    ];
    for (const [field, message] of required) {
      if (!value[field]) {
        context.addIssue({ code: "custom", path: [field], message });
      }
    }
    if (value.content.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["content"],
        message: "Add at least one useful content block before publishing.",
      });
    }
  },
);

export type ArticleBlock = z.infer<typeof articleBlockSchema>;
export type ArticleDraftInput = z.infer<typeof articleDraftSchema>;
export type ArticlePublishInput = z.infer<typeof articlePublishSchema>;
