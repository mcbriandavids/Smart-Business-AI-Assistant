import React, { useCallback, useEffect, useMemo, useState } from "react";
import CustomerTable from "../../components/CustomerTable";
import { Customer } from "../../hooks/useCustomers";
import CustomerForm from "../../components/CustomerForm";
import MessageDialog from "../../components/MessageDialog";
import AgentToolActivity from "../../components/AgentToolActivity";
import AgentConversationTimeline, {
  ConversationSummary,
} from "../../components/AgentConversationTimeline";
import { api } from "../../api/client";
import { getUser } from "../../utils/auth";
import { useAssistantContext } from "../../contexts/AssistantContext";

type ActivityNavigatePayload = {
  conversationId: string | null;
  customer?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
};

type ConversationStatusFilter = "all" | "active" | "closed" | "archived";
type ConversationSortOrder = "latest" | "oldest" | "recently_created";

type ConversationFiltersState = {
  status: ConversationStatusFilter;
  from: string;
  to: string;
  search: string;
  sort: ConversationSortOrder;
};

type ToolFiltersState = {
  status: "all" | "success" | "error";
};

const normalizeCustomer = (customer: any): Customer => {
  const identityCandidate =
    customer?._id ||
    customer?.id ||
    customer?.contact?.id ||
    customer?.contact?.email ||
    customer?.contact?.phone ||
    customer?.email ||
    customer?.phone ||
    customer?.name ||
    null;

  const normalizedId = identityCandidate
    ? String(identityCandidate)
    : `temp-${Math.random().toString(36).slice(2)}`;

  const normalizedName =
    customer?.name ||
    customer?.contact?.name ||
    customer?.contact?.email ||
    customer?.email ||
    "Unnamed customer";

  return {
    ...customer,
    _id: normalizedId,
    name: String(normalizedName),
  };
};

const formatConversationTimestamp = (timestamp?: string | null) => {
  if (!timestamp) {
    return "No activity yet";
  }
  try {
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    console.warn(
      "[VendorCustomers] Failed to format conversation timestamp",
      error
    );
    return timestamp;
  }
};

const formatConversationOptionLabel = (conversation: ConversationSummary) => {
  const name = conversation.customer?.name || "Conversation";
  const summary = (conversation.summary || "").trim();
  if (summary) {
    const trimmed =
      summary.length > 60 ? `${summary.slice(0, 57)}...` : summary;
    return `${name} - ${trimmed}`;
  }

  const ratingAverage =
    typeof conversation.rating?.average === "number"
      ? `${conversation.rating.average.toFixed(1)} stars`
      : null;
  const status = conversation.status || "unknown";
  const lastUpdated = formatConversationTimestamp(conversation.lastMessageAt);

  const descriptors = [ratingAverage, status, lastUpdated].filter(Boolean);
  return `${name} - ${descriptors.join(" | ")}`;
};

const DEFAULT_CONVERSATION_FILTERS: ConversationFiltersState = {
  status: "all",
  from: "",
  to: "",
  search: "",
  sort: "latest",
};

const DEFAULT_TOOL_FILTERS: ToolFiltersState = {
  status: "all",
};

const SMALL_SCREEN_QUERY = "(max-width: 900px)";

const VendorCustomersPage: React.FC = () => {
  const vendorUser = useMemo(() => getUser(), []);
  const storageKey = useMemo(() => {
    const identifier =
      vendorUser?._id ||
      vendorUser?.id ||
      vendorUser?.sub ||
      vendorUser?.email ||
      "default";
    return `vendor-agent-insights:${identifier}`;
  }, [vendorUser]);
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia(SMALL_SCREEN_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(SMALL_SCREEN_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      setIsSmallScreen(event.matches);
    };

    setIsSmallScreen(media.matches);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handleChange);
    } else {
      media.addListener(handleChange);
    }

    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", handleChange);
      } else {
        media.removeListener(handleChange);
      }
    };
  }, []);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [startingConversation, setStartingConversation] = useState(false);
  const {
    conversationId: contextConversationId,
    customerId: contextCustomerId,
    setAssistantTarget,
    conversationUpdateToken,
    notifyConversationUpdated,
  } = useAssistantContext();

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/customers");
      const rawCustomers = Array.isArray(res.data?.data) ? res.data.data : [];
      const normalizedCustomers = rawCustomers.map((entry: any) =>
        normalizeCustomer(entry)
      );
      setCustomers(normalizedCustomers);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [conversationOptions, setConversationOptions] = useState<
    ConversationSummary[]
  >([]);
  const [conversationOptionsLoading, setConversationOptionsLoading] =
    useState(false);

  const [conversationFilters, setConversationFilters] = useState(() => {
    try {
      const raw = storageKey ? localStorage.getItem(storageKey) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_CONVERSATION_FILTERS,
          ...(parsed?.conversationFilters || {}),
        };
      }
    } catch (storageError) {
      console.warn(
        "[VendorCustomers] Failed to read saved conversation filters",
        storageError
      );
    }
    return { ...DEFAULT_CONVERSATION_FILTERS };
  });

  const [toolFilters, setToolFilters] = useState(() => {
    try {
      const raw = storageKey ? localStorage.getItem(storageKey) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_TOOL_FILTERS,
          ...(parsed?.toolFilters || {}),
        };
      }
    } catch (storageError) {
      console.warn(
        "[VendorCustomers] Failed to read saved tool filters",
        storageError
      );
    }
    return { ...DEFAULT_TOOL_FILTERS };
  });
  const [filtersExpanded, setFiltersExpanded] = useState(!isSmallScreen);
  const [agentPanelTab, setAgentPanelTab] = useState<"timeline" | "tools">(
    "timeline"
  );

  useEffect(() => {
    setFiltersExpanded(!isSmallScreen);
  }, [isSmallScreen]);

  useEffect(() => {
    if (!isSmallScreen) {
      setAgentPanelTab("timeline");
    }
  }, [isSmallScreen]);

  // State for editing
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  // Handler for edit
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setSelectedCustomer(customer);
  };
  // Handler for delete
  const handleDelete = async (customer: Customer) => {
    if (!customer._id) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/api/customers/${customer._id}`);
      setSuccess("Customer deleted");
      fetchCustomers();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete customer");
    } finally {
      setLoading(false);
    }
  };
  // Handler for cancel edit
  const handleCancelEdit = () => {
    setEditingCustomer(null);
  };
  // Handler for save edit
  const handleSaveEdit = async () => {
    setEditingCustomer(null);
    fetchCustomers();
    setSuccess("Customer updated");
  };
  useEffect(() => {
    if (customers.length === 0) {
      setSelectedCustomer(null);
      setActiveConversationId(null);
      return;
    }

    setSelectedCustomer((prev: Customer | null) => {
      if (!prev) {
        return customers[0];
      }
      const stillExists = customers.find((c) => c._id === prev._id);
      return stillExists || customers[0];
    });
  }, [customers]);

  useEffect(() => {
    if (contextCustomerId) {
      const matchingCustomer = customers.find(
        (customer) => customer._id === contextCustomerId
      );
      if (matchingCustomer) {
        setSelectedCustomer((prev: Customer | null) =>
          prev && prev._id === matchingCustomer._id ? prev : matchingCustomer
        );
      }
    }

    if (contextConversationId) {
      setActiveConversationId((prev) =>
        prev === contextConversationId ? prev : contextConversationId
      );
    }
  }, [contextCustomerId, contextConversationId, customers]);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setActiveConversationId(null);
    setConversationOptions([]);
  };

  const handleConversationChange = useCallback(
    (conversation: ConversationSummary | null) => {
      setActiveConversationId(conversation?.id ?? null);
      if (conversation?.customer?.id) {
        const matchingCustomer = customers.find(
          (c) =>
            c._id === conversation.customer?.id ||
            c._id === (conversation.customer as any)?._id
        );
        if (matchingCustomer) {
          setSelectedCustomer(matchingCustomer);
        }
      }
      if (conversation) {
        setConversationOptions((prev) => {
          if (prev.some((item) => item.id === conversation.id)) {
            return prev;
          }
          return [conversation, ...prev].slice(0, 10);
        });
      }
    },
    [customers]
  );

  const handleActivityNavigate = useCallback(
    (payload: ActivityNavigatePayload) => {
      const payloadCustomerId = payload.customer?.id;
      if (payloadCustomerId) {
        const matchingCustomer = customers.find(
          (c) => c._id === payloadCustomerId
        );
        if (matchingCustomer) {
          setSelectedCustomer(matchingCustomer);
        }
      }
      setActiveConversationId(payload.conversationId || null);
    },
    [customers]
  );

  const selectedCustomerId = selectedCustomer?._id ?? null;
  const conversationStatus = conversationFilters.status;
  const conversationSearch = conversationFilters.search;
  const conversationSort = conversationFilters.sort;
  const conversationFrom = conversationFilters.from;
  const conversationTo = conversationFilters.to;

  const fetchConversationOptions = useCallback(async () => {
    if (!selectedCustomerId) {
      setConversationOptions([]);
      return;
    }

    setConversationOptionsLoading(true);
    try {
      const params: Record<string, unknown> = {
        customerId: selectedCustomerId,
        limit: 10,
      };

      if (conversationStatus && conversationStatus !== "all") {
        params.status = conversationStatus;
      }
      if (conversationSearch.trim()) {
        params.search = conversationSearch.trim();
      }
      if (conversationSort && conversationSort !== "latest") {
        params.sort = conversationSort;
      }
      if (conversationFrom) {
        params.from = conversationFrom;
      }
      if (conversationTo) {
        params.to = conversationTo;
      }

      const response = await api.get("/api/agent-sessions/conversations", {
        params,
      });

      const data = Array.isArray(response.data?.data)
        ? (response.data.data as ConversationSummary[])
        : [];

      setConversationOptions((prev) => {
        const merged = new Map<string, ConversationSummary>();
        data.forEach((conversation) => {
          merged.set(conversation.id, conversation);
        });
        prev.forEach((conversation) => {
          if (!merged.has(conversation.id)) {
            merged.set(conversation.id, conversation);
          }
        });

        if (activeConversationId && !merged.has(activeConversationId)) {
          const activeConversation = prev.find(
            (item) => item.id === activeConversationId
          );
          if (activeConversation) {
            merged.set(activeConversation.id, activeConversation);
          }
        }

        return Array.from(merged.values()).slice(0, 10);
      });
    } catch (fetchError) {
      console.warn(
        "[VendorCustomers] Failed to load conversation options",
        fetchError
      );
    } finally {
      setConversationOptionsLoading(false);
    }
  }, [
    activeConversationId,
    conversationFrom,
    conversationSearch,
    conversationSort,
    conversationStatus,
    conversationTo,
    selectedCustomerId,
  ]);

  useEffect(() => {
    fetchConversationOptions();
  }, [fetchConversationOptions, conversationUpdateToken]);

  useEffect(() => {
    setAssistantTarget({
      conversationId: activeConversationId,
      customerId: selectedCustomerId,
    });
  }, [activeConversationId, selectedCustomerId, setAssistantTarget]);

  useEffect(() => {
    if (!success || typeof window === "undefined") {
      return;
    }
    const timer = window.setTimeout(() => setSuccess(null), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  useEffect(() => {
    if (!error || typeof window === "undefined") {
      return;
    }
    const timer = window.setTimeout(() => setError(null), 4000);
    return () => window.clearTimeout(timer);
  }, [error]);

  const handleStartConversation = useCallback(async () => {
    if (!selectedCustomerId) {
      return;
    }

    setStartingConversation(true);
    setError(null);
    try {
      const response = await api.post("/api/agent-sessions", {
        customerId: selectedCustomerId,
      });

      const payload = response.data?.data ?? response.data ?? {};
      const conversationPayload =
        payload?.conversation || payload?.data || payload || {};

      const newConversationId =
        payload?.["conversation-id"] ||
        conversationPayload?.id ||
        conversationPayload?._id ||
        payload?.id ||
        payload?._id ||
        null;

      if (newConversationId) {
        const idAsString = String(newConversationId);
        setActiveConversationId(idAsString);
        setAssistantTarget({
          conversationId: idAsString,
          customerId: selectedCustomerId,
        });
      }

      await fetchConversationOptions();
      notifyConversationUpdated();
      setSuccess("New conversation started");
    } catch (startError: any) {
      setError(
        startError?.response?.data?.message ||
          startError?.message ||
          "Failed to start conversation"
      );
    } finally {
      setStartingConversation(false);
    }
  }, [
    fetchConversationOptions,
    selectedCustomerId,
    setAssistantTarget,
    notifyConversationUpdated,
  ]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    if (conversationOptions.some((item) => item.id === activeConversationId)) {
      return;
    }

    let cancelled = false;

    const loadConversation = async () => {
      try {
        const response = await api.get("/api/agent-sessions/conversations", {
          params: {
            conversationId: activeConversationId,
            limit: 1,
          },
        });

        const data = Array.isArray(response.data?.data)
          ? (response.data.data as ConversationSummary[])
          : [];

        if (cancelled || data.length === 0) {
          return;
        }

        const [conversation] = data;

        setConversationOptions((prev) => {
          if (prev.some((item) => item.id === conversation.id)) {
            return prev;
          }
          return [conversation, ...prev].slice(0, 10);
        });
      } catch (error) {
        console.warn(
          "[VendorCustomers] Failed to hydrate focused conversation",
          error
        );
      }
    };

    loadConversation();

    return () => {
      cancelled = true;
    };
  }, [activeConversationId, conversationOptions]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const payload = {
        conversationFilters,
        toolFilters,
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (storageError) {
      console.warn("[VendorCustomers] Failed to persist filters", storageError);
    }
  }, [storageKey, conversationFilters, toolFilters]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.conversationFilters) {
        setConversationFilters((prev: ConversationFiltersState) => ({
          ...prev,
          ...parsed.conversationFilters,
        }));
      }
      if (parsed?.toolFilters) {
        setToolFilters((prev: ToolFiltersState) => ({
          ...prev,
          ...parsed.toolFilters,
        }));
      }
    } catch (storageError) {
      console.warn("[VendorCustomers] Failed to hydrate filters", storageError);
    }
  }, [storageKey]);

  const resetFilters = () => {
    setConversationFilters({ ...DEFAULT_CONVERSATION_FILTERS });
    setToolFilters({ ...DEFAULT_TOOL_FILTERS });
  };

  const conversationFilterSummary = useMemo(() => {
    const parts: string[] = [];
    if (conversationFilters.status !== "all") {
      parts.push(`Status: ${conversationFilters.status}`);
    }
    if (conversationFilters.search.trim()) {
      parts.push(`Search: "${conversationFilters.search.trim()}"`);
    }
    if (conversationFilters.from) {
      parts.push(`From ${conversationFilters.from}`);
    }
    if (conversationFilters.to) {
      parts.push(`To ${conversationFilters.to}`);
    }
    if (conversationFilters.sort !== "latest") {
      parts.push(`Sorted: ${conversationFilters.sort}`);
    }
    if (toolFilters.status !== "all") {
      parts.push(`Tool status: ${toolFilters.status}`);
    }
    return parts.join(" · ") || "Showing latest updates";
  }, [conversationFilters, toolFilters]);

  const shouldShowFilterForm = !isSmallScreen || filtersExpanded;
  const timelineTabId = "agent-panel-tab-timeline";
  const toolsTabId = "agent-panel-tab-tools";
  const timelinePanelId = "agent-panel-panel-timeline";
  const toolsPanelId = "agent-panel-panel-tools";

  return (
    <div className="stack stack--loose">
      <header className="page-header">
        <div>
          <div className="panel-eyebrow">Vendor operations</div>
          <h1 className="page-title">Customer Management</h1>
          <p className="page-subtitle">
            Manage customer records, align agent conversations, and monitor
            outcomes.
          </p>
        </div>
      </header>

      {error ? (
        <div className="callout callout--error" role="alert">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
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

      {success ? (
        <div className="callout callout--success" role="status">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span>{success}</span>
            <button
              type="button"
              className="vendor-button vendor-button--ghost"
              onClick={() => setSuccess(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <section className="glass-panel">
        <div className="panel-header">
          <div>
            <div className="panel-eyebrow">Agent insights filters</div>
            <h3 className="panel-title">Conversation controls</h3>
            <p className="panel-subtitle">{conversationFilterSummary}</p>
          </div>
          <div className="panel-actions">
            {isSmallScreen ? (
              <button
                type="button"
                className="vendor-button vendor-button--ghost"
                onClick={() => setFiltersExpanded((prev) => !prev)}
                aria-expanded={filtersExpanded}
              >
                {filtersExpanded ? "Hide filters" : "Show filters"}
              </button>
            ) : null}
            <button
              type="button"
              className="vendor-button vendor-button--ghost"
              onClick={resetFilters}
            >
              Reset filters
            </button>
          </div>
        </div>

        {shouldShowFilterForm ? (
          <div className="stack stack--tight">
            <div className="form-grid form-grid--two">
              <div className="form-field">
                <label
                  className="form-label"
                  htmlFor="filter-conversation-status"
                >
                  Conversation status
                </label>
                <select
                  id="filter-conversation-status"
                  className="form-input"
                  value={conversationFilters.status}
                  onChange={(event) =>
                    setConversationFilters(
                      (prev: ConversationFiltersState) => ({
                        ...prev,
                        status: event.target.value as ConversationStatusFilter,
                      })
                    )
                  }
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="filter-tool-status">
                  Tool status
                </label>
                <select
                  id="filter-tool-status"
                  className="form-input"
                  value={toolFilters.status}
                  onChange={(event) =>
                    setToolFilters({
                      status: event.target.value as ToolFiltersState["status"],
                    })
                  }
                >
                  <option value="all">All</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="filter-from">
                  From
                </label>
                <input
                  id="filter-from"
                  type="date"
                  className="form-input"
                  value={conversationFilters.from}
                  onChange={(event) =>
                    setConversationFilters(
                      (prev: ConversationFiltersState) => ({
                        ...prev,
                        from: event.target.value,
                      })
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="filter-to">
                  To
                </label>
                <input
                  id="filter-to"
                  type="date"
                  className="form-input"
                  value={conversationFilters.to}
                  onChange={(event) =>
                    setConversationFilters(
                      (prev: ConversationFiltersState) => ({
                        ...prev,
                        to: event.target.value,
                      })
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="filter-search">
                  Search conversation notes or tags
                </label>
                <input
                  id="filter-search"
                  type="search"
                  className="form-input"
                  placeholder="e.g. onboarding, escalation"
                  value={conversationFilters.search}
                  onChange={(event) =>
                    setConversationFilters(
                      (prev: ConversationFiltersState) => ({
                        ...prev,
                        search: event.target.value,
                      })
                    )
                  }
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="filter-sort">
                  Sort
                </label>
                <select
                  id="filter-sort"
                  className="form-input"
                  value={conversationFilters.sort}
                  onChange={(event) =>
                    setConversationFilters(
                      (prev: ConversationFiltersState) => ({
                        ...prev,
                        sort: event.target.value as ConversationSortOrder,
                      })
                    )
                  }
                >
                  <option value="latest">Latest update first</option>
                  <option value="oldest">Oldest update first</option>
                  <option value="recently_created">Recently created</option>
                </select>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <div className="layout-grid layout-grid--two">
        <div className="stack stack--loose">
          {editingCustomer ? (
            <section className="glass-panel glass-panel--gradient">
              <div className="panel-header">
                <div>
                  <div className="panel-eyebrow">Edit customer</div>
                  <h3 className="panel-title">
                    {editingCustomer.name || "Update customer"}
                  </h3>
                  <p className="panel-subtitle">
                    Update customer details to keep your records aligned.
                  </p>
                </div>
              </div>
              <CustomerForm
                initialData={editingCustomer}
                onSuccess={handleSaveEdit}
                onCancel={handleCancelEdit}
              />
            </section>
          ) : null}

          <section className="glass-panel">
            <div className="panel-header">
              <div>
                <div className="panel-eyebrow">Directory</div>
                <h3 className="panel-title">Customers</h3>
                <p className="panel-subtitle">
                  Select a customer to focus the conversation insights.
                </p>
              </div>
            </div>
            {loading ? (
              <div className="assistant-panel__status assistant-panel__status--pending">
                <span className="assistant-spinner" /> Loading customers…
              </div>
            ) : (
              <CustomerTable
                customers={customers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSelect={handleSelectCustomer}
                selectedCustomerId={selectedCustomer?._id ?? null}
              />
            )}
          </section>
        </div>

        <div className="stack stack--loose">
          <section className="glass-panel">
            <div className="panel-header">
              <div>
                <div className="panel-eyebrow">Conversation focus</div>
                <h3 className="panel-title">
                  {selectedCustomer?.name || "Conversation focus"}
                </h3>
                <p className="panel-subtitle">
                  {selectedCustomer
                    ? "Tie insights to a specific thread for this customer."
                    : "Select a customer to explore their latest interactions."}
                </p>
              </div>
              <div className="panel-actions">
                <button
                  type="button"
                  className="vendor-button vendor-button--primary"
                  onClick={handleStartConversation}
                  disabled={
                    !selectedCustomerId || startingConversation || loading
                  }
                >
                  {startingConversation ? (
                    <>
                      <span className="assistant-spinner" />
                      <span style={{ marginLeft: 10 }}>Starting…</span>
                    </>
                  ) : (
                    "Start conversation"
                  )}
                </button>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="conversation-select">
                Conversation
              </label>
              <select
                id="conversation-select"
                className="form-input"
                value={activeConversationId || ""}
                disabled={!selectedCustomer}
                onChange={(event) =>
                  setActiveConversationId(
                    event.target.value ? event.target.value : null
                  )
                }
              >
                <option value="">Newest for selected customer</option>
                {conversationOptionsLoading ? (
                  <option value="" disabled>
                    Loading conversations…
                  </option>
                ) : null}
                {conversationOptions.map((conversation) => (
                  <option key={conversation.id} value={conversation.id}>
                    {formatConversationOptionLabel(conversation)}
                  </option>
                ))}
              </select>
              <p className="form-helper">
                Tie the timeline to a specific thread to guide the agent.
              </p>
            </div>
          </section>

          {isSmallScreen ? (
            <div className="stack stack--tight">
              <div
                className="tab-switcher"
                role="tablist"
                aria-label="Agent insights panels"
              >
                <button
                  type="button"
                  role="tab"
                  id={timelineTabId}
                  aria-controls={timelinePanelId}
                  aria-selected={agentPanelTab === "timeline"}
                  className={`tab-switcher__button${
                    agentPanelTab === "timeline"
                      ? " tab-switcher__button--active"
                      : ""
                  }`}
                  onClick={() => setAgentPanelTab("timeline")}
                >
                  Conversation
                </button>
                <button
                  type="button"
                  role="tab"
                  id={toolsTabId}
                  aria-controls={toolsPanelId}
                  aria-selected={agentPanelTab === "tools"}
                  className={`tab-switcher__button${
                    agentPanelTab === "tools"
                      ? " tab-switcher__button--active"
                      : ""
                  }`}
                  onClick={() => setAgentPanelTab("tools")}
                >
                  Tool activity
                </button>
              </div>
              <div
                role="tabpanel"
                id={
                  agentPanelTab === "timeline" ? timelinePanelId : toolsPanelId
                }
                aria-labelledby={
                  agentPanelTab === "timeline" ? timelineTabId : toolsTabId
                }
              >
                {agentPanelTab === "timeline" ? (
                  <AgentConversationTimeline
                    conversationId={activeConversationId}
                    customerId={selectedCustomer?._id ?? null}
                    onConversationChange={handleConversationChange}
                    statusFilter={conversationFilters.status}
                    searchTerm={conversationFilters.search}
                    sortOrder={conversationFilters.sort}
                    fromDate={conversationFilters.from || null}
                    toDate={conversationFilters.to || null}
                    refreshKey={conversationUpdateToken}
                  />
                ) : (
                  <AgentToolActivity
                    limit={8}
                    conversationId={activeConversationId}
                    customerId={selectedCustomer?._id ?? null}
                    statusFilter={toolFilters.status}
                    fromDate={conversationFilters.from || null}
                    toDate={conversationFilters.to || null}
                    onSelectConversation={handleActivityNavigate}
                    refreshKey={conversationUpdateToken}
                  />
                )}
              </div>
            </div>
          ) : (
            <>
              <AgentConversationTimeline
                conversationId={activeConversationId}
                customerId={selectedCustomer?._id ?? null}
                onConversationChange={handleConversationChange}
                statusFilter={conversationFilters.status}
                searchTerm={conversationFilters.search}
                sortOrder={conversationFilters.sort}
                fromDate={conversationFilters.from || null}
                toDate={conversationFilters.to || null}
                refreshKey={conversationUpdateToken}
              />
              <AgentToolActivity
                limit={8}
                conversationId={activeConversationId}
                customerId={selectedCustomer?._id ?? null}
                statusFilter={toolFilters.status}
                fromDate={conversationFilters.from || null}
                toDate={conversationFilters.to || null}
                onSelectConversation={handleActivityNavigate}
                refreshKey={conversationUpdateToken}
              />
            </>
          )}
        </div>
      </div>

      <MessageDialog />
    </div>
  );
};

export default VendorCustomersPage;
