import type { Database } from "../src/types/database.types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const productShape: Pick<ProductRow, "id" | "slug" | "status" | "price_source"> = {
  id: "00000000-0000-4000-8000-000000000010",
  slug: "verified-product",
  status: "draft",
  price_source: "none",
};

const articleShape: Pick<ArticleRow, "id" | "content" | "status"> = {
  id: "00000000-0000-4000-8000-000000000011",
  content: [],
  status: "draft",
};

const profileShape: Pick<ProfileRow, "id" | "role"> = {
  id: "00000000-0000-4000-8000-000000000012",
  role: "editor",
};

void [productShape, articleShape, profileShape];
