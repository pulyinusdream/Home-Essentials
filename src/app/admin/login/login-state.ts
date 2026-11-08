export type LoginActionState = {
  status: "idle" | "error";
  message: string;
};

export const initialLoginState: LoginActionState = {
  status: "idle",
  message: "",
};
