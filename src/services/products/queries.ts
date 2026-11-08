import "server-only";

import { requireStaff } from "@/lib/auth/require-role";
import {
  fetchActiveProductCategories,
  fetchProductEditorRecord,
  fetchProductList,
} from "@/services/products/repository";
import { normalizeProductListFilters } from "@/services/products/workflow";

export async function listProducts(
  input: {
    search?: string;
    status?: string;
    category?: string;
    page?: string | number;
    perPage?: string | number;
  },
) {
  await requireStaff();
  return fetchProductList(normalizeProductListFilters(input));
}

export async function listProductCategories() {
  await requireStaff();
  return fetchActiveProductCategories();
}

export async function getProductEditorRecord(id: string) {
  await requireStaff();
  return fetchProductEditorRecord(id);
}
