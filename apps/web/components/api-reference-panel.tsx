"use client";

import { getApiReferenceHref, getApiReferenceTopics, getOpenApiJsonHref } from "../lib/api-reference";

type ApiReferencePanelProps = {
  workspace: "buyer" | "pickup" | "admin-buyers" | "admin-disputes" | "seller-billing";
  title: string;
  description: string;
};

export function ApiReferencePanel({ workspace, title, description }: ApiReferencePanelProps) {
  const topics = getApiReferenceTopics(workspace);

  return (
    <aside className="panel api-reference-panel">
      <p className="eyebrow">API reference</p>
      <h2>{title}</h2>
      <p className="muted">{description}</p>

      <div className="status-timeline">
        {topics.map((topic) => (
          <div key={topic.endpoint} className="timeline-step timeline-step-complete">
            <span className="timeline-step-marker" />
            <div>
              <strong>{topic.label}</strong>
              <p className="muted">{topic.endpoint}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="login-actions">
        <a className="button button-secondary" href={getApiReferenceHref()} target="_blank" rel="noreferrer">
          Open /reference
        </a>
        <a className="button button-secondary" href={getOpenApiJsonHref()} target="_blank" rel="noreferrer">
          Open openapi.json
        </a>
      </div>
    </aside>
  );
}
