/**
 * Agent Controller
 * ----------------
 * Provides session initialisation and action endpoints for the vendor-facing AI agent.
 * Current implementation stubs tool orchestration while persisting conversations
 * for future expansion.
 */
const OpenAI = require("openai");
const AgentConversation = require("../models/agent-conversation.model");
const Customer = require("../models/customer.model");
const AgentToolAudit = require("../models/agent-tool-audit.model");
const {
  agentToolRegistry,
  AgentToolExecutionError,
} = require("../services/agent-tool-registry");

const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiClient = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const agentModePreference = (process.env.AGENT_MODE || "auto").toLowerCase();
const agentRuntimeMode =
  agentModePreference === "mock" ? "mock" : openaiClient ? "live" : "mock";

if (
  agentRuntimeMode === "mock" &&
  agentModePreference === "live" &&
  !openaiClient
) {
  console.warn(
    "[Agent] OPENAI_API_KEY missing while AGENT_MODE=live. Falling back to mock responses."
  );
}

const readField = (obj = {}, keys = [], fallback) => {
  for (const key of keys) {
    if (
      Object.prototype.hasOwnProperty.call(obj, key) &&
      obj[key] !== undefined
    ) {
      return obj[key];
    }
  }
  return fallback;
};

const buildMockReply = (input, conversation) => {
  const hints = [
    ...agentToolRegistry.getMockSuggestions(input, { conversation }),
  ];

  if (!hints.length) {
    hints.push(
      "Summarise the customer's need, propose a clear next action, and offer to craft the reply."
    );
  }

  const recentVendorMessage = conversation?.messages
    ?.slice()
    .reverse()
    .find((msg) => msg.role === "vendor");

  const base =
    "Here’s a suggested next step based on your request:" +
    hints.map((hint, idx) => `\n${idx + 1}. ${hint}`).join("");

  const followUp = recentVendorMessage
    ? "\n\nNeed anything else? I can help you draft a customer reply or plan the next action."
    : "\n\nLet me know if you want me to draft a customer response or explore another angle.";

  return `${base}${followUp}`;
};

const getResponseMode = () => agentRuntimeMode;

const extractNumbers = (input = "") =>
  (input.match(/\d+(?:\.\d+)?/g) || []).map((value) => Number(value));

const deriveProductName = (input = "") => {
  const explicit = input.match(
    /(?:for|about|regarding|on|of)\s+([a-z0-9][\w\s-]{2,50})/i
  );
  if (explicit) {
    return explicit[1].trim().replace(/\s+/g, " ");
  }
  const titleCaseWord = input.match(/[A-Z][a-z0-9]{2,}/g);
  if (titleCaseWord) {
    return titleCaseWord[0];
  }
  return "Featured Product";
};

const buildMockToolArgs = ({ toolName, input, conversation, vendor }) => {
  const lower = input.toLowerCase();
  const numbers = extractNumbers(input);
  switch (toolName) {
    case "calculate_pricing": {
      const basePrice = numbers[0] ?? 49.5;
      const quantity =
        numbers.length > 1 ? numbers[1] : lower.includes("units") ? 2 : 1;
      const discountCandidate =
        numbers.length > 2 ? numbers[2] : lower.includes("discount") ? 10 : 0;
      const discountPercentage = Math.max(0, Math.min(discountCandidate, 80));
      return {
        basePrice,
        quantity,
        discountPercentage,
      };
    }
    case "lookup_inventory": {
      return {
        productName: deriveProductName(input),
        businessId:
          vendor?.business?.toString?.() ||
          vendor?.businessId ||
          conversation?.vendor?.toString?.() ||
          undefined,
      };
    }
    case "draft_promotion": {
      const offerMatch = input.match(/(\d+%[^\s,.]+)/i);
      const offerText = offerMatch ? offerMatch[1] : "20% weekend sale";
      const audience = lower.includes("vip")
        ? "VIP customers"
        : lower.includes("new")
        ? "new subscribers"
        : "loyal customers";
      const channel = lower.includes("email")
        ? "email"
        : lower.includes("sms")
        ? "sms"
        : "in_app";
      return {
        offer: offerText,
        audience,
        channel,
      };
    }
    case "summarise_customer_context": {
      const customerId =
        conversation?.customer?.toString?.() ||
        conversation?.customer?._id?.toString?.() ||
        conversation?.customer ||
        null;
      return customerId ? { customerId } : {};
    }
    case "estimate_delivery": {
      return {
        destinationZone: lower.includes("west")
          ? "west_hub"
          : lower.includes("north")
          ? "north_hub"
          : "local",
        urgency: lower.includes("express") ? "express" : "standard",
      };
    }
    case "dispatch_message": {
      const channel = lower.includes("email")
        ? "email"
        : lower.includes("sms")
        ? "sms"
        : "in_app";
      return {
        channel,
        to:
          channel === "in_app"
            ? conversation?.customer?.toString?.() || undefined
            : "customer@example.com",
        subject:
          channel === "email" ? "Follow-up from Smart Business AI" : undefined,
        body: "Mock dispatch: confirming we are on top of your request. This message is not actually sent.",
      };
    }
    default:
      return {};
  }
};

const selectMockToolsForInput = (input = "") => {
  const lower = input.toLowerCase();
  const matched = agentToolRegistry.list().filter((tool) => {
    if (!tool.mock) return false;
    if (typeof tool.mock.shouldSuggest === "function") {
      try {
        return tool.mock.shouldSuggest({ lower, context: {} });
      } catch (error) {
        console.warn("[Agent] mock shouldSuggest failed", error);
        return false;
      }
    }
    if (Array.isArray(tool.mock.keywords)) {
      return tool.mock.keywords.some((keyword) => lower.includes(keyword));
    }
    return false;
  });

  if (matched.length === 0) {
    const fallback = agentToolRegistry.get("calculate_pricing");
    return fallback ? [fallback] : [];
  }

  return matched;
};

const simulateMockToolRuns = async ({ input, conversation, vendor }) => {
  const matches = selectMockToolsForInput(input).slice(0, 2);
  const executed = [];

  for (const tool of matches) {
    const toolCallId = `mock-${tool.name}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const args = buildMockToolArgs({
      toolName: tool.name,
      input,
      conversation,
      vendor,
    });

    let status = "success";
    let result = null;
    let errorInfo = null;

    try {
      result = await agentToolRegistry.execute(tool.name, {
        args,
        vendor,
        conversation,
      });
    } catch (error) {
      status = "error";
      errorInfo = {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode,
      };
      console.warn("[Agent] Mock tool execution failed", tool.name, error);
    }

    try {
      await conversation.appendMessage({
        role: "tool",
        content:
          status === "success"
            ? JSON.stringify(result, null, 2)
            : errorInfo?.message || "Tool execution failed",
        toolName: tool.name,
        toolCallId,
        metadata: {
          args,
          result,
          error: errorInfo || undefined,
          status,
          mock: true,
        },
      });
    } catch (messageError) {
      console.warn(
        "[Agent] Failed to append mock tool message",
        tool.name,
        messageError
      );
    }

    try {
      await AgentToolAudit.create({
        vendor: vendor?._id || vendor?.id,
        conversation: conversation?._id || conversation?.id,
        toolName: tool.name,
        status,
        args,
        result: status === "success" ? result : null,
        error: status === "error" ? errorInfo : null,
        executedAt: new Date(),
      });
    } catch (auditError) {
      console.warn(
        "[Agent] Failed to persist mock tool audit",
        tool.name,
        auditError
      );
    }

    executed.push({
      id: toolCallId,
      name: tool.name,
      args,
      status,
      result,
      error: errorInfo || undefined,
    });
  }

  return executed;
};

const mapConversationMessageToOpenAi = (message) => {
  if (message.role === "agent") {
    return { role: "assistant", content: message.content };
  }
  if (message.role === "vendor") {
    return { role: "user", content: message.content };
  }
  if (message.role === "tool") {
    return {
      role: "tool",
      tool_call_id: message.toolCallId || undefined,
      content: message.content,
    };
  }
  return { role: "system", content: message.content };
};

const buildOpenAiMessages = (conversation, systemPrompt) => {
  const history = conversation?.messages || [];
  return [
    { role: "system", content: systemPrompt },
    ...history.map(mapConversationMessageToOpenAi),
  ];
};

const transformConversationForResponse = (
  conversation,
  { includeMessages = false, messageLimit = 50 } = {}
) => {
  if (!conversation) {
    return null;
  }

  const feedbackEntries = Array.isArray(conversation.feedbackEntries)
    ? conversation.feedbackEntries
    : [];
  const qaFlags = Array.isArray(conversation.qaFlags)
    ? conversation.qaFlags
    : [];

  const base = {
    id: conversation._id?.toString?.() || conversation._id || conversation.id,
    status: conversation.status,
    channel: conversation.channel,
    summary: conversation.summary || null,
    lastMessageAt: conversation.lastMessageAt,
    tags: Array.isArray(conversation.tags) ? conversation.tags : [],
    metrics: conversation.metrics || null,
    rating: conversation.rating || null,
    feedbackCount: feedbackEntries.length,
    openQaFlags: qaFlags.filter((flag) => flag.status === "open").length,
    customer: conversation.customer
      ? {
          id:
            conversation.customer._id?.toString?.() ||
            conversation.customer._id,
          name: conversation.customer.name || null,
          email: conversation.customer.email || null,
          phone: conversation.customer.phone || null,
        }
      : null,
  };

  if (!includeMessages) {
    return base;
  }

  const limitedMessages = Array.isArray(conversation.messages)
    ? conversation.messages
        .slice(-Math.max(1, Math.min(messageLimit, 100)))
        .map((message) => ({
          role: message.role,
          content: message.content,
          toolName: message.toolName || null,
          toolCallId: message.toolCallId || null,
          metadata: message.metadata || {},
          createdAt: message.createdAt,
        }))
    : [];

  return {
    ...base,
    messages: limitedMessages,
  };
};

exports.createSession = async (req, res) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Only vendors can start agent sessions",
      });
    }

    const customerId = readField(req.body, ["customer-id", "customerId"], null);
    const channel = readField(req.body, ["channel"], "in_app");
    const tags = readField(req.body, ["tags"], []);
    const context = readField(req.body, ["context"], undefined);

    let customer = null;
    if (customerId) {
      customer = await Customer.findOne({
        _id: customerId,
        vendor: req.user._id,
      });
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found for this vendor",
        });
      }
    }

    const conversation = await AgentConversation.create({
      vendor: req.user._id,
      customer: customer ? customer._id : null,
      channel,
      tags,
      summary: context?.summary || null,
      messages: [],
    });

    if (context?.initialMessage) {
      await conversation.appendMessage({
        role: "vendor",
        content: context.initialMessage,
        metadata: { seed: true },
      });
    }

    return res.status(201).json({
      success: true,
      data: {
        conversation,
        "conversation-id": conversation.id,
        mode: getResponseMode(),
      },
    });
  } catch (error) {
    console.error("[Agent] createSession error", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create session" });
  }
};

exports.act = async (req, res) => {
  try {
    if (req.user.role !== "vendor") {
      return res
        .status(403)
        .json({ success: false, message: "Only vendors can use the agent" });
    }

    const conversationId =
      readField(req.params, ["conversationId", "conversation-id"], null) ??
      readField(req.body, ["conversation-id", "conversationId"], null);
    const input = readField(req.body, ["input", "input-text"], undefined);
    const metadata = readField(req.body, ["metadata"], {});
    if (!conversationId || !input) {
      return res.status(400).json({
        success: false,
        message: "conversationId and input are required",
      });
    }

    const conversation = await AgentConversation.findOne({
      _id: conversationId,
      vendor: req.user._id,
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    await conversation.appendMessage({
      role: "vendor",
      content: input,
      metadata,
    });

    const mode = getResponseMode();

    if (mode === "mock") {
      const reply = buildMockReply(input, conversation);
      const executedTools = await simulateMockToolRuns({
        input,
        conversation,
        vendor: req.user,
      });

      await conversation.appendMessage({
        role: "agent",
        content: reply,
        metadata: {
          provider: "mock",
          simulatedTools: executedTools.map((tool) => tool.name),
        },
      });

      return res.json({
        success: true,
        data: {
          reply,
          conversationId: conversation.id,
          "conversation-id": conversation.id,
          mode,
          tools: executedTools,
        },
      });
    }

    if (!openaiClient) {
      return res.status(503).json({
        success: false,
        message: "Agent is not configured. Please supply OPENAI_API_KEY.",
      });
    }

    const systemPrompt =
      "You are the Smart Business AI agent assisting small business vendors. Provide actionable, concise responses and suggest next steps.";

    const buildMessages = () => buildOpenAiMessages(conversation, systemPrompt);

    const createCompletion = async (messages, extra = {}) =>
      openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.6,
        ...extra,
      });

    let completion = await createCompletion(buildMessages(), {
      tools: agentToolRegistry.asOpenAITools(),
      tool_choice: "auto",
    });

    let choice = completion.choices?.[0] || null;
    let toolCalls = choice?.message?.tool_calls || [];
    const executedTools = [];

    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const toolName = toolCall?.function?.name;
        const rawArgs = toolCall?.function?.arguments;
        let parsedArgs = {};
        if (rawArgs) {
          try {
            parsedArgs = JSON.parse(rawArgs);
          } catch (parseError) {
            parsedArgs = {};
          }
        }

        let toolResult;
        let toolError = null;
        try {
          toolResult = await agentToolRegistry.execute(toolName, {
            args: parsedArgs,
            vendor: req.user,
            conversation,
          });
        } catch (error) {
          toolError = error;
          toolResult = {
            error: error.message || "Tool execution failed",
            name: error.name,
          };
          if (error instanceof AgentToolExecutionError && error.statusCode) {
            toolResult.statusCode = error.statusCode;
          }
        }

        const normalizedResult =
          typeof toolResult === "string"
            ? { output: toolResult }
            : toolResult || {};

        await conversation.appendMessage({
          role: "tool",
          content:
            typeof toolResult === "string"
              ? toolResult
              : JSON.stringify(toolResult),
          toolName,
          toolCallId: toolCall?.id || null,
          metadata: {
            args: parsedArgs,
            result: toolResult,
            error: toolError
              ? {
                  message: toolError.message,
                  name: toolError.name,
                  statusCode: toolError.statusCode,
                }
              : undefined,
          },
        });

        executedTools.push({
          id: toolCall?.id || null,
          name: toolName,
          args: parsedArgs,
          status: toolError ? "error" : "success",
          result: normalizedResult,
          error: toolError
            ? {
                message: toolError.message,
                name: toolError.name,
                statusCode: toolError.statusCode,
              }
            : undefined,
        });

        try {
          await AgentToolAudit.create({
            vendor: req.user._id,
            conversation: conversation._id,
            toolName,
            status: toolError ? "error" : "success",
            args: parsedArgs,
            result: normalizedResult,
            error: toolError
              ? {
                  message: toolError.message,
                  name: toolError.name,
                  statusCode: toolError.statusCode,
                }
              : null,
          });
        } catch (auditError) {
          console.error("[Agent] tool audit persist error", auditError);
        }

        const logMethod = toolError ? console.warn : console.info;
        logMethod("[Agent] tool execution", {
          vendor: req.user._id.toString(),
          conversation: conversation._id.toString(),
          toolName,
          status: toolError ? "error" : "success",
        });
      }

      completion = await createCompletion(buildMessages());
      choice = completion.choices?.[0] || null;
      toolCalls = choice?.message?.tool_calls || [];
    }

    const reply = choice?.message?.content || "";

    await conversation.appendMessage({
      role: "agent",
      content: reply,
      metadata: {
        model: completion.model,
        usage: completion.usage,
        provider: "openai",
      },
    });

    return res.json({
      success: true,
      data: {
        reply,
        conversationId: conversation.id,
        "conversation-id": conversation.id,
        mode,
        tools: executedTools,
      },
    });
  } catch (error) {
    console.error("[Agent] act error", error);
    return res
      .status(500)
      .json({ success: false, message: "Agent action failed" });
  }
};

exports.listToolActivity = async (req, res) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Only vendors can view tool activity",
      });
    }

    const { conversationId, customerId, status, limit, from, to, page } =
      req.query;

    const query = {
      vendor: req.user._id,
    };

    if (from || to) {
      query.executedAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.valueOf())) {
          query.executedAt.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.valueOf())) {
          query.executedAt.$lte = toDate;
        }
      }
      if (Object.keys(query.executedAt).length === 0) {
        delete query.executedAt;
      }
    }

    if (conversationId) {
      query.conversation = conversationId;
    }

    if (customerId) {
      const conversations = await AgentConversation.find({
        vendor: req.user._id,
        customer: customerId,
      })
        .select("_id")
        .lean({ getters: true });

      const ids = conversations
        .map((doc) => doc._id?.toString?.() || doc._id)
        .filter(Boolean);

      if (!ids.length) {
        return res.json({ success: true, data: [] });
      }

      query.conversation = { $in: ids };
    }

    if (status && ["success", "error"].includes(status)) {
      query.status = status;
    }

    const parsedLimit = parseInt(limit, 10);
    const safeLimit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 100)
      : 20;

    const parsedPage = parseInt(page, 10);
    const safePage = Number.isFinite(parsedPage) ? Math.max(parsedPage, 1) : 1;
    const skip = (safePage - 1) * safeLimit;

    const audits = await AgentToolAudit.find(query)
      .sort({ executedAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .populate({
        path: "conversation",
        select: "customer summary tags",
        populate: {
          path: "customer",
          select: "name email phone",
        },
      })
      .lean({ getters: true });

    const data = audits.map((entry) => {
      const conversation = entry.conversation || null;
      const conversationIdValue = conversation
        ? conversation._id?.toString?.() || conversation?.toString?.() || null
        : null;
      const customer = conversation?.customer || null;

      return {
        id: entry._id?.toString?.() || entry._id,
        toolName: entry.toolName,
        status: entry.status,
        args: entry.args,
        result: entry.result,
        error: entry.error,
        executedAt: entry.executedAt,
        conversationId: conversationIdValue,
        summary: conversation?.summary || null,
        tags: Array.isArray(conversation?.tags) ? conversation.tags : [],
        customer: customer
          ? {
              id: customer._id?.toString?.() || customer._id,
              name: customer.name || null,
              email: customer.email || null,
              phone: customer.phone || null,
            }
          : null,
      };
    });

    return res.json({ success: true, data });
  } catch (error) {
    console.error("[Agent] listToolActivity error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tool activity",
    });
  }
};

exports.listConversations = async (req, res) => {
  try {
    if (req.user.role !== "vendor") {
      return res.status(403).json({
        success: false,
        message: "Only vendors can view conversations",
      });
    }

    const {
      conversationId,
      customerId,
      status,
      limit,
      includeMessages,
      messageLimit,
      from,
      to,
      page,
      search,
      sort,
    } = req.query;

    const query = { vendor: req.user._id };

    if (customerId) {
      query.customer = customerId;
    }

    if (status && ["active", "closed", "archived"].includes(status)) {
      query.status = status;
    }

    if (from || to) {
      query.lastMessageAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!Number.isNaN(fromDate.valueOf())) {
          query.lastMessageAt.$gte = fromDate;
        }
      }
      if (to) {
        const toDate = new Date(to);
        if (!Number.isNaN(toDate.valueOf())) {
          query.lastMessageAt.$lte = toDate;
        }
      }
      if (Object.keys(query.lastMessageAt).length === 0) {
        delete query.lastMessageAt;
      }
    }

    if (search) {
      try {
        const regex = new RegExp(search, "i");
        query.$or = [{ summary: regex }, { tags: { $in: [regex] } }];
      } catch (_regexError) {
        // Ignore malformed regex input and continue without search filter
      }
    }

    const parsedLimit = parseInt(limit, 10);
    const safeLimit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 50)
      : 10;

    const parsedPage = parseInt(page, 10);
    const safePage = Number.isFinite(parsedPage) ? Math.max(parsedPage, 1) : 1;
    const skip = (safePage - 1) * safeLimit;

    const includeMessagesFlag =
      includeMessages === true || includeMessages === "true";

    const parsedMessageLimit = parseInt(messageLimit, 10);
    const safeMessageLimit = Number.isFinite(parsedMessageLimit)
      ? Math.min(Math.max(parsedMessageLimit, 1), 100)
      : 50;

    const sortOrder =
      sort === "oldest"
        ? { lastMessageAt: 1 }
        : sort === "recently_created"
        ? { createdAt: -1 }
        : { lastMessageAt: -1 };

    if (conversationId) {
      let singleConversationQuery = AgentConversation.findOne({
        _id: conversationId,
        vendor: req.user._id,
      }).populate({
        path: "customer",
        select: "name email phone",
      });

      if (!includeMessagesFlag) {
        singleConversationQuery = singleConversationQuery.select("-messages");
      }

      const conversation = await singleConversationQuery.lean({
        getters: true,
      });

      const mapped = transformConversationForResponse(conversation, {
        includeMessages: includeMessagesFlag,
        messageLimit: safeMessageLimit,
      });

      return res.json({
        success: true,
        data: mapped ? [mapped] : [],
      });
    }

    let conversationQuery = AgentConversation.find(query)
      .sort(sortOrder)
      .skip(skip)
      .limit(safeLimit)
      .populate({
        path: "customer",
        select: "name email phone",
      });

    if (!includeMessagesFlag) {
      conversationQuery = conversationQuery.select("-messages");
    }

    const conversations = await conversationQuery.lean({ getters: true });

    const data = conversations
      .map((conversation) =>
        transformConversationForResponse(conversation, {
          includeMessages: includeMessagesFlag,
          messageLimit: safeMessageLimit,
        })
      )
      .filter(Boolean);

    return res.json({ success: true, data });
  } catch (error) {
    console.error("[Agent] listConversations error", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const {
      rating,
      comment = "",
      source,
      followUpRequired = false,
      escalate = false,
    } = req.body;

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const conversation = await AgentConversation.findById(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    if (
      req.user.role === "vendor" &&
      conversation.vendor?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot add feedback for another vendor",
      });
    }

    const entrySource =
      req.user.role === "customer"
        ? "customer"
        : source && ["customer", "vendor", "agent", "system"].includes(source)
        ? source
        : "customer";

    const trimmedComment = typeof comment === "string" ? comment.trim() : "";

    const feedbackEntry = {
      source: entrySource,
      rating: numericRating,
      comment: trimmedComment,
      followUpRequired: Boolean(followUpRequired || escalate),
      createdByUser: req.user?._id || null,
    };

    conversation.feedbackEntries = Array.isArray(conversation.feedbackEntries)
      ? conversation.feedbackEntries
      : [];
    conversation.feedbackEntries.push(feedbackEntry);

    const ratings = conversation.feedbackEntries
      .map((entry) => Number(entry.rating))
      .filter((value) => Number.isFinite(value) && value >= 1 && value <= 5);

    if (!conversation.rating) {
      conversation.rating = {};
    }

    if (ratings.length > 0) {
      const average =
        Math.round(
          (ratings.reduce((acc, value) => acc + value, 0) / ratings.length) *
            100
        ) / 100;
      conversation.rating.average = average;
      conversation.rating.count = ratings.length;
      conversation.rating.lastRatedAt = new Date();
    }

    const shouldEscalate = Boolean(escalate || followUpRequired);
    if (shouldEscalate) {
      const reason =
        trimmedComment || "Conversation flagged for follow-up by feedback.";
      const qaEntry = {
        source: entrySource,
        reason,
        status: "open",
        notes: "",
        raisedByUser: req.user?._id || null,
      };
      conversation.qaFlags = Array.isArray(conversation.qaFlags)
        ? conversation.qaFlags
        : [];
      conversation.qaFlags.push(qaEntry);
    }

    await conversation.save();

    const latestFeedback = conversation.feedbackEntries.slice(-1)[0];

    return res.status(201).json({
      success: true,
      data: {
        rating: conversation.rating,
        feedback: latestFeedback,
        openQaFlags: conversation.qaFlags.filter(
          (flag) => flag.status === "open"
        ),
      },
    });
  } catch (error) {
    console.error("[Agent] submitFeedback error", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to record feedback" });
  }
};
