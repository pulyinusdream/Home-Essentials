export type ProductActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors: Record<string, string[]>;
};

export const initialProductActionState: ProductActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
