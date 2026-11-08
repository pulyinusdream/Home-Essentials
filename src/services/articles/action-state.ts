export type ArticleActionState = {
  status: "idle" | "error";
  message: string;
  fieldErrors: Record<string, string[]>;
};

export const initialArticleActionState: ArticleActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};
