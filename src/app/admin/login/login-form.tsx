"use client";

import { useActionState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { loginAction } from "@/app/admin/login/actions";
import { initialLoginState } from "@/app/admin/login/login-state";

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialLoginState,
  );

  return (
    <form action={formAction} className="admin-login-form">
      <input type="hidden" name="next" value={nextPath} />

      <div className="field-group">
        <label htmlFor="admin-email">Email address</label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          disabled={isPending}
        />
      </div>

      <div className="field-group">
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
        />
      </div>

      {state.status === "error" ? (
        <p className="form-message form-message--error" role="alert">
          {state.message}
        </p>
      ) : null}

      <button className="admin-submit" type="submit" disabled={isPending}>
        <span>{isPending ? "Signing in…" : "Sign in securely"}</span>
        {isPending ? <LockKeyhole aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
      </button>
    </form>
  );
}
