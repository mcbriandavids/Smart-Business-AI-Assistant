import React, { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

type ToolActivityItem = {
  id: string;
  toolName: string;
  status: "success" | "error";
  args: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  error?: Record<string, unknown> | null;
  executedAt: string;
  conversationId?: string | null;
  summary?: string | null;
  tags?: string[];
  customer?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
};

type Props = {
  limit?: number;
  conversationId?: string | null;
  customerId?: string | null;
  statusFilter?: "success" | "error" | "all";
  fromDate?: string | null;
  toDate?: string | null;
  onSelectConversation?: (payload: {
    conversationId: string | null;
    customer?: ToolActivityItem["customer"];
  }) => void;
  refreshKey?: number;
};

const formatTimestamp = (timestamp: string) => {
  try {
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    console.warn("[AgentToolActivity] Failed to format date", error);
    return timestamp;
  }
};

const previewJson = (value: unknown) => {
  if (value === null || value === undefined) {
    return "No output";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    const json = JSON.stringify(value, null, 2);
    return json.length > 600 ? `${json.slice(0, 600)}…` : json;
  } catch (error) {
    console.warn("[AgentToolActivity] Failed to stringify preview", error);
    return String(value);
  }
};

const RefreshIcon = () => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.38-3.36L23 10M1 14l5.11 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

const AgentToolActivity: React.FC<Props> = ({
  limit = 10,
  conversationId,
  customerId,
  statusFilter = "all",
  fromDate,
  toDate,
  onSelectConversation,
  refreshKey,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ToolActivityItem[]>([]);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { limit };
      if (conversationId) {
        params.conversationId = conversationId;
      } else if (customerId) {
        params.customerId = customerId;
      }
      if (statusFilter && statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (fromDate) {
        params.from = fromDate;
      }
      if (toDate) {
        params.to = toDate;
      }
      const response = await api.get("/api/agent-sessions/tools", {
        params,
      });
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      setItems(
        data.map((entry: Record<string, unknown>) => ({
          id: String(entry.id ?? entry._id ?? Math.random().toString(36)),
          toolName: String(entry.toolName ?? "Unknown tool"),
          status:
            entry.status === "error" || entry.status === "success"
              ? (entry.status as "success" | "error")
              : "success",
          args: (entry.args as Record<string, unknown>) ?? null,
          result: (entry.result as Record<string, unknown>) ?? null,
          error: (entry.error as Record<string, unknown>) ?? null,
          executedAt: String(entry.executedAt ?? new Date().toISOString()),
          conversationId: entry.conversationId
            ? String(entry.conversationId)
            : null,
          summary: (entry.summary as string) ?? null,
          tags: Array.isArray(entry.tags)
            ? (entry.tags as string[])
            : undefined,
          customer: entry.customer as ToolActivityItem["customer"],
        }))
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load tool activity"
      );
    } finally {
      setLoading(false);
    }
  }, [limit, conversationId, customerId, statusFilter, fromDate, toDate]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity, refreshKey]);

  useEffect(() => {
    setItems([]);
  }, [conversationId, customerId, statusFilter, fromDate, toDate]);

  const content = useMemo(() => {
    if (loading && items.length === 0) {
      return (
        <div className="assistant-panel__status assistant-panel__status--pending">
          <span className="assistant-spinner" /> Loading tool activity…
        </div>
      );
    }

    if (!loading && items.length === 0) {
      return (
        <div className="empty-state">
          {conversationId || customerId
            ? "No tool executions for this selection yet."
            : "No recent agent tool executions yet."}
        </div>
      );
    }

    return (
      <div className="tool-activity">
        {items.map((item) => {
          const customerLine = item.customer?.name
            ? `Customer: ${item.customer.name}`
            : null;
          const contactLine = item.customer?.email || item.customer?.phone;
          const statusClass = `tool-status-badge${
            item.status === "error" ? " tool-status-badge--error" : ""
          }`;

          return (
            <article key={item.id} className="tool-activity__item">
              <header className="tool-activity__header">
                <div>
                  <h4 className="panel-title" style={{ fontSize: "1rem" }}>
                    {item.toolName}
                  </h4>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    {formatTimestamp(item.executedAt)}
                  </div>
                  {item.conversationId ? (
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      Conversation: {item.conversationId}
                    </div>
                  ) : null}
                  {customerLine ? (
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {customerLine}
                    </div>
                  ) : null}
                  {contactLine ? (
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      {contactLine}
                    </div>
                  ) : null}
                  {item.tags && item.tags.length > 0 ? (
                    <div className="filter-chips" style={{ marginTop: 10 }}>
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="filter-chip filter-chip--active"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <span className={statusClass}>
                  {item.status === "success" ? "Success" : "Error"}
                </span>
              </header>
              {item.summary ? (
                <p className="text-muted" style={{ margin: 0 }}>
                  {item.summary}
                </p>
              ) : null}
              <div
                className="panel-actions"
                style={{ justifyContent: "flex-end" }}
              >
                <button
                  type="button"
                  className="vendor-button vendor-button--ghost"
                  onClick={() =>
                    onSelectConversation?.({
                      conversationId: item.conversationId || null,
                      customer: item.customer,
                    })
                  }
                  disabled={!item.conversationId}
                >
                  View conversation
                </button>
              </div>
              <div>
                <div className="panel-eyebrow" style={{ marginBottom: 6 }}>
                  Result preview
                </div>
                <pre
                  className="assistant-message__code"
                  style={{ marginTop: 0 }}
                >
                  {previewJson(
                    item.error && Object.keys(item.error || {}).length
                      ? item.error
                      : item.result
                  )}
                </pre>
              </div>
              {item.args && Object.keys(item.args || {}).length > 0 ? (
                <div>
                  <div className="panel-eyebrow" style={{ marginBottom: 6 }}>
                    Arguments
                  </div>
                  <pre
                    className="assistant-message__code assistant-message__code--muted"
                    style={{ marginTop: 0 }}
                  >
                    {previewJson(item.args)}
                  </pre>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    );
  }, [items, loading, conversationId, customerId, onSelectConversation]);

  return (
    <section className="glass-panel">
      <div className="panel-header">
        <div>
          <div className="panel-eyebrow">Agent Signals</div>
          <h3 className="panel-title">Recent Tool Activity</h3>
          <p className="panel-subtitle">
            Most recent executions performed by the AI agent for the selected
            conversation or customer.
          </p>
        </div>
        <div className="panel-actions">
          <button
            type="button"
            className="vendor-button vendor-button--ghost"
            onClick={fetchActivity}
            disabled={loading}
          >
            <RefreshIcon /> Refresh
          </button>
        </div>
      </div>

      <div className="filter-chips">
        {conversationId ? (
          <span className="filter-chip filter-chip--active">
            Conversation {conversationId}
          </span>
        ) : null}
        {!conversationId && customerId ? (
          <span className="filter-chip">Selected customer</span>
        ) : null}
        {statusFilter !== "all" ? (
          <span className="filter-chip">Status · {statusFilter}</span>
        ) : null}
        {fromDate ? (
          <span className="filter-chip">From · {fromDate}</span>
        ) : null}
        {toDate ? <span className="filter-chip">To · {toDate}</span> : null}
      </div>

      {error ? (
        <div className="callout callout--error" role="alert">
          {error}
        </div>
      ) : null}

      {content}
    </section>
  );
};

export default AgentToolActivity;
