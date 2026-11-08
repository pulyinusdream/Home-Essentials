import type { ReactNode } from "react";

export function EmptyState(_props: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const { title, description, action } = _props;

  return (
    <section className="empty-state" aria-labelledby="empty-state-title">
      <h2 id="empty-state-title">{title}</h2>
      <p>{description}</p>
      {action ? <div className="empty-state__action">{action}</div> : null}
    </section>
  );
}
