"use client";

import Link from "next/link";

type WorkspaceStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  tone?: "loading" | "error" | "empty";
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };
};

export function WorkspaceState({
  eyebrow,
  title,
  description,
  tone = "empty",
  primaryAction,
  secondaryAction
}: WorkspaceStateProps) {
  return (
    <section className={`panel empty-state workspace-state workspace-state-${tone}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      <div className="login-actions">
        {primaryAction ? (
          <Link href={primaryAction.href} className="button button-secondary">
            {primaryAction.label}
          </Link>
        ) : null}
        {secondaryAction ? (
          <button className="button button-primary" type="button" onClick={secondaryAction.onClick} disabled={secondaryAction.disabled}>
            {secondaryAction.label}
          </button>
        ) : null}
      </div>
    </section>
  );
}
