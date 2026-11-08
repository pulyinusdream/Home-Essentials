import { AlertTriangle } from "lucide-react";

export function ErrorState({
  title = "Something went wrong",
  description,
  retry,
}: {
  title?: string;
  description: string;
  retry?: () => void;
}) {
  return (
    <section className="error-state" role="alert" aria-labelledby="error-state-title">
      <AlertTriangle aria-hidden="true" size={18} strokeWidth={1.75} />
      <div>
        <h2 id="error-state-title">{title}</h2>
        <p>{description}</p>
        {retry ? (
          <button type="button" className="text-action" onClick={retry}>
            Try again
          </button>
        ) : null}
      </div>
    </section>
  );
}
