import {
  FormEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api/client";

type ConversationMessage = {
  role: "agent" | "vendor" | "customer" | "tool" | "system";
  content: string;
  toolName?: string | null;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

export type ConversationSummary = {
  id: string;
  status: string;
  channel?: string;
  summary?: string | null;
  lastMessageAt?: string;
  tags?: string[];
  rating?: {
    average?: number | null;
    count?: number;
    lastRatedAt?: string | null;
  } | null;
  feedbackCount?: number;
  openQaFlags?: number;
  customer?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  messages?: ConversationMessage[];
};

type Props = {
  conversationId?: string | null;
  customerId?: string | null;
  messageLimit?: number;
  onConversationChange?: (conversation: ConversationSummary | null) => void;
  statusFilter?: "active" | "closed" | "archived" | "all";
  searchTerm?: string;
  sortOrder?: "latest" | "oldest" | "recently_created";
  fromDate?: string | null;
  toDate?: string | null;
  refreshKey?: number;
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

const previewJson = (value: unknown) => {
  if (value === null || value === undefined) {
    return "No details provided";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    const json = JSON.stringify(value, null, 2);
    return json.length > 600 ? `${json.slice(0, 600)}…` : json;
  } catch (error) {
    console.warn(
      "[AgentConversationTimeline] Failed to stringify payload",
      error
    );
    return String(value);
  }
};

const roleLabels: Record<ConversationMessage["role"], string> = {
  agent: "AI Agent",
  vendor: "Vendor",
  customer: "Customer",
  tool: "Tool",
  system: "System",
};

const AgentConversationTimeline: React.FC<Props> = ({
  conversationId,
  customerId,
  messageLimit = 40,
  onConversationChange,
  statusFilter = "all",
  searchTerm,
  sortOrder = "latest",
  fromDate,
  toDate,
  refreshKey,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationSummary | null>(
    null
  );
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<string>("");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackEscalate, setFeedbackEscalate] = useState(false);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const fetchConversation = useCallback(async () => {
    if (!conversationId && !customerId) {
      setConversation(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {
        limit: 1,
        includeMessages: true,
        messageLimit,
      };

      if (conversationId) {
        params.conversationId = conversationId;
      } else if (customerId) {
        params.customerId = customerId;
        if (statusFilter && statusFilter !== "all") {
          params.status = statusFilter;
        }
        if (searchTerm) {
          params.search = searchTerm;
        }
        if (sortOrder && sortOrder !== "latest") {
          params.sort = sortOrder;
        }
        if (fromDate) {
          params.from = fromDate;
        }
        if (toDate) {
          params.to = toDate;
        }
      }

      const response = await api.get("/api/agent-sessions/conversations", {
        params,
      });
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      if (data.length === 0) {
        setConversation(null);
        if (conversationId) {
          setError("Conversation not found or unavailable.");
        }
        return;
      }
      setConversation(data[0] as ConversationSummary);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load conversation"
      );
    } finally {
      setLoading(false);
    }
  }, [
    conversationId,
    customerId,
    messageLimit,
    statusFilter,
    searchTerm,
    sortOrder,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation, refreshKey]);

  useEffect(() => {
    onConversationChange?.(conversation);
  }, [conversation, onConversationChange]);

  useEffect(() => {
    if (!feedbackBanner) return;
    const timer = setTimeout(() => setFeedbackBanner(null), 4000);
    return () => clearTimeout(timer);
  }, [feedbackBanner]);

  useEffect(() => {
    setShowFeedbackForm(false);
    setFeedbackRating("");
    setFeedbackComment("");
    setFeedbackEscalate(false);
    setFeedbackError(null);
  }, [conversation?.id]);

  const handleOpenFeedbackForm = useCallback(() => {
    if (!conversation) return;
    setShowFeedbackForm(true);
    setFeedbackRating("");
    setFeedbackComment("");
    setFeedbackEscalate(false);
    setFeedbackError(null);
  }, [conversation]);

  const handleCancelFeedback = () => {
    if (feedbackSubmitting) return;
    setShowFeedbackForm(false);
    setFeedbackRating("");
    setFeedbackComment("");
    setFeedbackEscalate(false);
    setFeedbackError(null);
  };

  const handleSubmitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!conversation?.id) {
      setFeedbackError("Select a conversation before logging feedback.");
      return;
    }
    if (!feedbackRating) {
      setFeedbackError("Choose a rating between 1 and 5.");
      return;
    }

    const ratingValue = Number(feedbackRating);
    if (Number.isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      setFeedbackError("Rating must be a number between 1 and 5.");
      return;
    }

    setFeedbackSubmitting(true);
    setFeedbackError(null);
    try {
      await api.post(`/api/agent-sessions/${conversation.id}/feedback`, {
        rating: ratingValue,
        comment: feedbackComment.trim(),
        followUpRequired: feedbackEscalate,
        source: "vendor",
      });
      setShowFeedbackForm(false);
      setFeedbackBanner(
        feedbackEscalate
          ? "Feedback recorded and flagged for follow-up"
          : "Feedback recorded successfully"
      );
      setFeedbackRating("");
      setFeedbackComment("");
      setFeedbackEscalate(false);
      await fetchConversation();
    } catch (err: any) {
      setFeedbackError(
        err?.response?.data?.message || "Failed to submit feedback"
      );
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const timeline = useMemo(() => {
    if (!conversation) {
      if (loading) {
        return (
          <div className="assistant-panel__status assistant-panel__status--pending">
            <span className="assistant-spinner" /> Loading timeline…
          </div>
        );
      }
      return (
        <div className="empty-state">
          Select a conversation to view history.
        </div>
      );
    }

    const messages = Array.isArray(conversation.messages)
      ? conversation.messages
      : [];

    if (messages.length === 0) {
      return <div className="empty-state">No messages recorded yet.</div>;
    }

    return (
      <div className="timeline-card">
        {messages.map((message, index) => {
          const label = roleLabels[message.role] ?? message.role;
          const timestamp = formatTimestamp(message.createdAt);

          return (
            <div
              key={`${message.createdAt || index}-${index}`}
              className="timeline-item"
            >
              <div className="timeline-item__timestamp">{timestamp}</div>
              <div className="timeline-item__role">{label}</div>
              <div className="timeline-item__content">
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                  {message.content}
                </p>
                {message.toolName ? (
                  <p className="text-muted" style={{ margin: "8px 0 0" }}>
                    Tool: {message.toolName}
                  </p>
                ) : null}
                {message.metadata && (
                  <pre
                    className="assistant-message__code assistant-message__code--muted"
                    style={{ marginTop: 12 }}
                  >
                    {previewJson(message.metadata)}
                  </pre>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [conversation, loading]);

  const summaryChips = useMemo(() => {
    if (!conversation) return null;

    const chips: ReactNode[] = [];
    const ratingValue =
      typeof conversation.rating?.average === "number"
        ? conversation.rating.average
        : NaN;
    const ratingCount = conversation.rating?.count ?? 0;
    const lastUpdated = formatTimestamp(conversation.lastMessageAt);
    const lastRated = conversation.rating?.lastRatedAt
      ? formatTimestamp(conversation.rating.lastRatedAt)
      : null;
    const feedbackCount = conversation.feedbackCount ?? 0;
    const openQaFlags = conversation.openQaFlags ?? 0;

    chips.push(
      <span key="status" className="filter-chip filter-chip--active">
        Status · {conversation.status}
      </span>
    );

    if (!Number.isNaN(ratingValue)) {
      chips.push(
        <span key="rating" className="filter-chip">
          Rating · {ratingValue.toFixed(1)} ({ratingCount})
        </span>
      );
    }

    if (lastUpdated) {
      chips.push(
        <span key="updated" className="filter-chip">
          Updated · {lastUpdated}
        </span>
      );
    }

    if (lastRated) {
      chips.push(
        <span key="last-rated" className="filter-chip">
          Last rated · {lastRated}
        </span>
      );
    }

    if (feedbackCount > 0) {
      chips.push(
        <span key="feedback" className="filter-chip">
          {feedbackCount} feedback
        </span>
      );
    }

    if (openQaFlags > 0) {
      chips.push(
        <span key="qa" className="filter-chip">
          {openQaFlags} QA flags
        </span>
      );
    }

    if (conversation.channel) {
      chips.push(
        <span key="channel" className="filter-chip">
          Channel · {conversation.channel}
        </span>
      );
    }

    conversation.tags?.forEach((tag) => {
      chips.push(
        <span key={`tag-${tag}`} className="filter-chip filter-chip--active">
          {tag}
        </span>
      );
    });

    return chips.length > 0 ? chips : null;
  }, [conversation]);

  return (
    <section className="glass-panel">
      <div className="panel-header">
        <div>
          <div className="panel-eyebrow">Conversation Timeline</div>
          <h3 className="panel-title">
            {conversation?.customer?.name || "Conversation"}
          </h3>
          <p className="panel-subtitle">
            {conversation?.summary ||
              "Monitor interactions between your team, the agent, and customers."}
          </p>
        </div>
        <div className="panel-actions">
          <button
            type="button"
            className="vendor-button vendor-button--ghost"
            onClick={fetchConversation}
            disabled={loading}
          >
            <RefreshIcon /> Refresh
          </button>
          <button
            type="button"
            className="vendor-button vendor-button--primary"
            onClick={handleOpenFeedbackForm}
            disabled={!conversation}
          >
            Log feedback
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
          <span className="filter-chip">Status filter · {statusFilter}</span>
        ) : null}
        {searchTerm ? (
          <span className="filter-chip">Search · “{searchTerm}”</span>
        ) : null}
        {sortOrder && sortOrder !== "latest" ? (
          <span className="filter-chip">Sort · {sortOrder}</span>
        ) : null}
        {fromDate ? (
          <span className="filter-chip">From · {fromDate}</span>
        ) : null}
        {toDate ? <span className="filter-chip">To · {toDate}</span> : null}
      </div>

      {feedbackBanner ? (
        <div className="callout callout--success" role="status">
          {feedbackBanner}
        </div>
      ) : null}

      {error ? (
        <div className="callout callout--error" role="alert">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span>{error}</span>
            <button
              type="button"
              className="vendor-button vendor-button--ghost"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {showFeedbackForm ? (
        <form className="callout" onSubmit={handleSubmitFeedback}>
          <div className="panel-eyebrow" style={{ marginBottom: 12 }}>
            Rate this conversation
          </div>
          <div className="form-grid form-grid--two">
            <div className="form-field">
              <label className="form-label" htmlFor="feedback-rating">
                Rating
              </label>
              <select
                id="feedback-rating"
                className="form-input"
                value={feedbackRating}
                onChange={(event) => setFeedbackRating(event.target.value)}
                disabled={feedbackSubmitting}
              >
                <option value="">Select</option>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} star{value > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="feedback-escalate">
                Follow-up
              </label>
              <label
                htmlFor="feedback-escalate"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                  color: "rgba(229, 236, 255, 0.75)",
                }}
              >
                <input
                  id="feedback-escalate"
                  type="checkbox"
                  checked={feedbackEscalate}
                  onChange={(event) =>
                    setFeedbackEscalate(event.target.checked)
                  }
                  disabled={feedbackSubmitting}
                />
                Flag for follow-up
              </label>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="feedback-comment">
              Notes
            </label>
            <textarea
              id="feedback-comment"
              className="form-input form-textarea"
              placeholder="Share context or next steps for your team"
              value={feedbackComment}
              onChange={(event) => setFeedbackComment(event.target.value)}
              disabled={feedbackSubmitting}
            />
            <p className="form-helper">
              Comments are optional but help keep the agent aligned with vendor
              expectations.
            </p>
          </div>
          {feedbackError ? (
            <div
              className="callout callout--error"
              role="alert"
              style={{ marginTop: 12 }}
            >
              {feedbackError}
            </div>
          ) : null}
          <div className="form-actions">
            <button
              type="button"
              className="vendor-button vendor-button--ghost"
              onClick={handleCancelFeedback}
              disabled={feedbackSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="vendor-button vendor-button--primary"
              disabled={feedbackSubmitting}
            >
              {feedbackSubmitting ? "Saving…" : "Submit feedback"}
            </button>
          </div>
        </form>
      ) : null}

      {summaryChips ? <div className="filter-chips">{summaryChips}</div> : null}

      {timeline}
    </section>
  );
};

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    console.warn("[AgentConversationTimeline] Failed to format date", error);
    return timestamp;
  }
};

export default AgentConversationTimeline;
