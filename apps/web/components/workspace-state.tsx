"use client";

import Link from "next/link";

type WorkspaceStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  tone?: "loading" | "error" | "empty";
  statusLabel?: string;
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
  statusLabel,
  primaryAction,
  secondaryAction
}: WorkspaceStateProps) {
  const resolvedStatusLabel =
    statusLabel ??
    (tone === "loading" ? "Loading" : tone === "error" ? "Needs attention" : "No records");

  const titlePrefix =
    tone === "loading"
      ? "Syncing the workspace"
      : tone === "error"
        ? "The runtime needs attention"
        : "The current view has no records";

  return (
    <section className={`panel empty-state workspace-state workspace-state-${tone}`}>
      <div className="workspace-state-head">
        <p className="eyebrow">{eyebrow}</p>
        <span className={`status-badge workspace-state-badge workspace-state-badge-${tone}`}>{resolvedStatusLabel}</span>
      </div>
      <h2>{title}</h2>
      <p className="workspace-state-context">{titlePrefix}</p>
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
