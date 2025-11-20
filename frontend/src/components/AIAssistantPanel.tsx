import { FormEvent, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useAssistantContext } from "../contexts/AssistantContext";

type Props = {
  variant?: "page" | "widget";
  onClose?: () => void;
  preferredConversationId?: string | null;
  preferredCustomerId?: string | null;
};

type ChatMessage = {
  role: "vendor" | "agent" | "system" | "tool" | "customer";
  content: string;
  toolName?: string;
  metadata?: Record<string, unknown>;
};

const SUPPORTED_MESSAGE_ROLES: ChatMessage["role"][] = [
  "vendor",
  "agent",
  "system",
  "tool",
  "customer",
];

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const icons = {
  close: (
    <svg {...iconProps}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  ),
  send: (
    <svg {...iconProps}>
      <path d="M3 3l18 9-18 9 4.5-9L3 3z" />
    </svg>
  ),
};

const normaliseRole = (rawRole?: string | null): ChatMessage["role"] => {
  if (!rawRole) {
    return "system";
  }
  if (rawRole === "assistant") {
    return "agent";
  }
  if (SUPPORTED_MESSAGE_ROLES.includes(rawRole as ChatMessage["role"])) {
    return rawRole as ChatMessage["role"];
  }
  return "system";
};

const roleLabel = (role: ChatMessage["role"]): string => {
  switch (role) {
    case "vendor":
      return "You";
    case "agent":
      return "AI";
    case "tool":
      return "Tool";
    case "customer":
      return "Customer";
    default:
      return "System";
  }
};

const stringifyArgs = (args: unknown) => {
  try {
    return JSON.stringify(args, null, 2);
  } catch (err) {
    return String(args);
  }
};

export default function AIAssistantPanel({
  variant = "page",
  onClose,
  preferredConversationId = null,
  preferredCustomerId = null,
}: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [agentMode, setAgentMode] = useState<"live" | "mock">("live");
  const initRequestToken = useRef<symbol | null>(null);
  const hydratedConversationRef = useRef<string | null>(null);
  const {
    customerId: contextCustomerId,
    setAssistantTarget,
    notifyConversationUpdated,
  } = useAssistantContext();

  const isWidget = variant === "widget";
  const panelClassName = isWidget
    ? "assistant-panel assistant-panel--widget"
    : "assistant-panel assistant-panel--page glass-panel glass-panel--gradient";

  useEffect(() => {
    let isMounted = true;
    const initSession = async () => {
      if (preferredConversationId) {
        setConversationId(preferredConversationId);
        setSessionLoading(false);
        setError("");
        setMessages([]);
        initRequestToken.current = null;
        return;
      }

      setSessionLoading(true);
      setError("");
      let requestToken: symbol | null = null;
      try {
        requestToken = Symbol("assistant-init");
        initRequestToken.current = requestToken;
        const payloadBody: Record<string, unknown> = {};
        if (preferredCustomerId) {
          payloadBody.customerId = preferredCustomerId;
        }
        const res = await api.post("/api/agent-sessions", payloadBody);
        const payload = res.data?.data ?? {};
        const convo =
          payload?.conversation ?? res.data?.conversation ?? payload;
        const id =
          payload?.["conversation-id"] ||
          convo?.id ||
          convo?._id ||
          payload?.id ||
          payload?._id;
        if (isMounted && initRequestToken.current === requestToken && id) {
          const derivedCustomerId =
            preferredCustomerId ??
            contextCustomerId ??
            (convo?.customer?.id || convo?.customer?._id || null);
          setConversationId(id);
          hydratedConversationRef.current = null;
          setAssistantTarget({
            conversationId: id,
            customerId: derivedCustomerId ? String(derivedCustomerId) : null,
          });
          notifyConversationUpdated();
        }
        const modeValue = (payload?.mode || "live").toString().toLowerCase();
        if (isMounted && initRequestToken.current === requestToken) {
          setAgentMode(modeValue === "mock" ? "mock" : "live");
        }
      } catch (err: any) {
        if (isMounted && initRequestToken.current === requestToken) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to start AI session"
          );
        }
      } finally {
        if (!isMounted) {
          return;
        }
        if (!requestToken) {
          setSessionLoading(false);
          initRequestToken.current = null;
          return;
        }
        if (initRequestToken.current === requestToken) {
          setSessionLoading(false);
          initRequestToken.current = null;
        }
      }
    };

    initSession();
    return () => {
      isMounted = false;
    };
  }, [
    preferredConversationId,
    preferredCustomerId,
    contextCustomerId,
    setAssistantTarget,
    notifyConversationUpdated,
  ]);

  useEffect(() => {
    if (preferredConversationId) {
      setConversationId(preferredConversationId);
      setMessages([]);
      setSessionLoading(false);
      setError("");
      hydratedConversationRef.current = null;
      setAssistantTarget({
        conversationId: preferredConversationId,
        customerId: preferredCustomerId ?? contextCustomerId ?? null,
      });
    }
  }, [
    preferredConversationId,
    preferredCustomerId,
    contextCustomerId,
    setAssistantTarget,
  ]);

  useEffect(() => {
    const targetId = conversationId;
    if (!targetId) {
      return;
    }

    if (hydratedConversationRef.current === targetId) {
      return;
    }

    let cancelled = false;

    const hydrateConversation = async () => {
      setSessionLoading(true);
      try {
        const response = await api.get("/api/agent-sessions/conversations", {
          params: {
            conversationId: targetId,
            includeMessages: true,
            messageLimit: 50,
          },
        });

        if (cancelled) {
          return;
        }

        const data = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        const conversation = data[0] as
          | {
              messages?: Array<{
                role?: string | null;
                content?: string | null;
                toolName?: string | null;
                metadata?: Record<string, unknown> | null;
              }>;
              customer?: {
                id?: string | null;
                _id?: string | null;
              } | null;
            }
          | undefined;

        if (conversation?.messages) {
          const mappedMessages: ChatMessage[] = conversation.messages.map(
            (message) => ({
              role: normaliseRole(message.role),
              content: message.content ?? "",
              toolName: message.toolName ?? undefined,
              metadata: (message.metadata as Record<string, unknown>) ?? {},
            })
          );
          setMessages(mappedMessages);
          const conversationCustomerId =
            conversation.customer?.id || conversation.customer?._id || null;
          if (conversationCustomerId) {
            setAssistantTarget({
              conversationId: targetId,
              customerId: String(conversationCustomerId),
            });
          }
        } else {
          setMessages([]);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn(
            "[AIAssistantPanel] Failed to hydrate conversation",
            err
          );
        }
      } finally {
        if (!cancelled) {
          setSessionLoading(false);
          hydratedConversationRef.current = targetId;
        }
      }
    };

    hydrateConversation();

    return () => {
      cancelled = true;
    };
  }, [conversationId, setAssistantTarget]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    setAssistantTarget({
      conversationId,
      customerId: preferredCustomerId ?? contextCustomerId ?? null,
    });
  }, [
    conversationId,
    preferredCustomerId,
    contextCustomerId,
    setAssistantTarget,
  ]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (!conversationId) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (!conversationId) {
      setError("AI session is not ready. Please try again.");
      return;
    }

    const outbound = input;
    setMessages((prev) => [
      ...prev,
      {
        role: "vendor",
        content: outbound,
        metadata: { timestamp: Date.now() },
      },
    ]);
    setLoading(true);
    setError("");
    try {
      const res = await api.post(
        `/api/agent-sessions/${conversationId}/actions`,
        {
          input: outbound,
        }
      );
      const reply = res.data?.data?.reply || res.data?.reply;
      const modeValue =
        res.data?.data?.mode || res.data?.mode || agentMode || "live";
      setAgentMode(
        modeValue && modeValue.toString().toLowerCase() === "mock"
          ? "mock"
          : "live"
      );
      const toolExecutions = Array.isArray(res.data?.data?.tools)
        ? res.data?.data?.tools
        : [];

      setMessages((prev) => {
        const next = [...prev];
        toolExecutions.forEach((tool: any) => {
          const prettyResult = tool?.result
            ? JSON.stringify(tool.result, null, 2)
            : tool?.error?.message || tool?.status || "No output";
          next.push({
            role: "tool",
            toolName: tool?.name,
            content: prettyResult,
            metadata: {
              args: tool?.args,
              status: tool?.status,
              result: tool?.result,
              error: tool?.error,
            },
          });
        });

        if (reply) {
          next.push({
            role: "agent",
            content: reply,
            metadata: { timestamp: Date.now() },
          });
        }

        return next;
      });
      setInput("");
      notifyConversationUpdated();
      hydratedConversationRef.current = conversationId;
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err?.message ||
          "Failed to get response"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSend();
  };

  return (
    <div className={panelClassName} data-variant={variant}>
      <header className="assistant-panel__header">
        <div className="assistant-panel__heading">
          <span className="assistant-panel__title">AI Business Assistant</span>
          <span className="assistant-panel__meta">
            {agentMode === "mock" ? "Mock mode" : "Live mode"}
          </span>
        </div>
        {isWidget && (
          <button
            type="button"
            className="assistant-panel__close"
            aria-label="Close assistant"
            onClick={onClose}
          >
            {icons.close}
          </button>
        )}
      </header>

      <div className="assistant-panel__messages" aria-live="polite">
        {sessionLoading && (
          <div className="assistant-panel__status">
            <span className="assistant-spinner" aria-hidden="true" />
            <span>Initialising agent…</span>
          </div>
        )}

        <div className="assistant-thread">
          {messages.length === 0 && !sessionLoading ? (
            <div className="assistant-panel__empty">
              Ask anything about your customers and the agent will respond with
              live or simulated insights.
            </div>
          ) : null}

          {messages.map((msg, idx) => {
            if (msg.role === "tool") {
              const meta = msg.metadata as Record<string, unknown> | undefined;
              const argsValue = meta?.["args"];
              const statusValue = meta?.["status"] ?? "completed";
              return (
                <div
                  key={`${idx}-${msg.toolName || "tool"}`}
                  className="assistant-message assistant-message--tool"
                >
                  <div className="assistant-message__actor">
                    Tool • {msg.toolName || "Unnamed"} ({String(statusValue)})
                  </div>
                  <pre className="assistant-message__code">{msg.content}</pre>
                  {argsValue ? (
                    <pre className="assistant-message__code assistant-message__code--muted">
                      Args: {stringifyArgs(argsValue)}
                    </pre>
                  ) : null}
                </div>
              );
            }

            const role = msg.role;
            const label = roleLabel(role);
            const roleClass = `assistant-message assistant-message--${role}`;
            return (
              <div key={`${idx}-${role}`} className={roleClass}>
                <span className="assistant-message__actor">{label}</span>
                <div className="assistant-message__bubble">{msg.content}</div>
              </div>
            );
          })}

          {loading ? (
            <div className="assistant-panel__status assistant-panel__status--pending">
              <span className="assistant-spinner" aria-hidden="true" />
              <span>Thinking…</span>
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="assistant-panel__error" role="alert">
          {error}
        </div>
      ) : null}

      {agentMode === "mock" ? (
        <div className="assistant-panel__banner" role="status">
          Responses are generated in mock mode. Supply OPENAI_API_KEY and set
          AGENT_MODE=live to enable live replies.
        </div>
      ) : null}

      <form className="assistant-composer" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="assistant-input">
          Ask the AI assistant
        </label>
        <textarea
          id="assistant-input"
          className="assistant-composer__input"
          placeholder="Ask the AI assistant..."
          rows={isWidget ? 2 : 3}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={loading || sessionLoading}
        />
        <button
          type="submit"
          className="assistant-composer__send"
          disabled={loading || sessionLoading || !input.trim()}
        >
          <span>Send</span>
          {icons.send}
        </button>
      </form>
    </div>
  );
}
