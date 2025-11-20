const { messagingService } = require("./messaging-service");

const AgentToolExecutionError = class extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "AgentToolExecutionError";
    this.cause = options.cause;
    this.statusCode = options.statusCode || 500;
  }
};

class AgentToolRegistry {
  constructor(tools = []) {
    this.tools = new Map();
    tools.forEach((tool) => this.register(tool));
  }

  register(tool) {
    if (!tool || !tool.name) {
      throw new Error("Tool must include a name");
    }
    this.tools.set(tool.name, {
      ...tool,
      parameters: tool.parameters || { type: "object", properties: {} },
    });
  }

  list() {
    return Array.from(this.tools.values());
  }

  get(name) {
    return this.tools.get(name);
  }

  async execute(name, context = {}) {
    const tool = this.get(name);
    if (!tool) {
      throw new AgentToolExecutionError(`Unknown tool: ${name}`, {
        statusCode: 404,
      });
    }

    try {
      const result = await tool.handler(context);
      return result;
    } catch (error) {
      throw new AgentToolExecutionError(
        tool.errorMessage || `Failed to execute tool: ${name}`,
        { cause: error }
      );
    }
  }

  asOpenAITools() {
    return this.list().map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  getMockSuggestions(inputText = "", context = {}) {
    const lower = inputText.toLowerCase();
    return this.list()
      .filter((tool) => {
        if (!tool.mock) return false;
        if (typeof tool.mock.shouldSuggest === "function") {
          return tool.mock.shouldSuggest({ lower, context });
        }
        if (Array.isArray(tool.mock.keywords)) {
          return tool.mock.keywords.some((keyword) => lower.includes(keyword));
        }
        return false;
      })
      .map((tool) => {
        if (typeof tool.mock.buildSuggestion === "function") {
          return tool.mock.buildSuggestion({ lower, context, tool });
        }
        return (
          tool.mock.suggestion ||
          `Consider running the ${tool.displayName || tool.name} tool.`
        );
      });
  }
}

const DEFAULT_TOOLS = [
  {
    name: "lookup_inventory",
    displayName: "Inventory Lookup",
    description:
      "Check inventory availability for a product and highlight low-stock warnings.",
    parameters: {
      type: "object",
      properties: {
        productName: {
          type: "string",
          description: "Name of the product or SKU to inspect",
        },
        businessId: {
          type: "string",
          description: "Business identifier for scoped inventory lookups",
        },
      },
      required: ["productName"],
    },
    async handler({ args }) {
      const productName = args?.productName || "unknown";
      return {
        productName,
        availability: "in_stock",
        quantityAvailable: 24,
        restockEtaDays: 3,
        notes: "Inventory data is mocked. Integrate with inventory service.",
      };
    },
    mock: {
      keywords: ["inventory", "stock", "quantity", "available"],
      suggestion:
        "Check inventory before promising availability so you can mention current stock and restock ETA.",
    },
  },
  {
    name: "calculate_pricing",
    displayName: "Pricing Calculator",
    description:
      "Apply pricing rules to determine discount, taxes, and final totals for a proposed offer.",
    parameters: {
      type: "object",
      properties: {
        basePrice: { type: "number", description: "Unit base price" },
        discountPercentage: {
          type: "number",
          description: "Percentage discount to apply (0-100)",
        },
        quantity: {
          type: "number",
          description: "Quantity of units in the offer",
          default: 1,
        },
      },
      required: ["basePrice"],
    },
    async handler({ args }) {
      const basePrice = Number(args?.basePrice || 0);
      const discountPercentage = Number(args?.discountPercentage || 0);
      const quantity = Number(args?.quantity || 1);
      const discounted = basePrice * (1 - discountPercentage / 100);
      const subtotal = discounted * quantity;
      const tax = subtotal * 0.075;
      return {
        basePrice,
        discountPercentage,
        quantity,
        subtotal: Number(subtotal.toFixed(2)),
        estimatedTax: Number(tax.toFixed(2)),
        total: Number((subtotal + tax).toFixed(2)),
        notes: "Pricing calculator uses placeholder tax and discount logic.",
      };
    },
    mock: {
      keywords: ["price", "discount", "pricing", "quote"],
      suggestion:
        "Run the pricing calculator to confirm discount math and share a clear total (including tax).",
    },
  },
  {
    name: "draft_promotion",
    displayName: "Promotion Draft",
    description:
      "Create a short promotional message for a campaign with CTA and value proposition.",
    parameters: {
      type: "object",
      properties: {
        audience: {
          type: "string",
          description: "Target audience description (e.g., loyal customers)",
        },
        offer: {
          type: "string",
          description: "Key value proposition or discount",
        },
        channel: {
          type: "string",
          description: "Planned distribution channel (sms, email, in_app)",
        },
      },
      required: ["offer"],
    },
    async handler({ args }) {
      return {
        headline: `Don't miss ${args?.offer || "this offer"}!`,
        body: `${args?.audience ? `${args.audience}, ` : ""}enjoy ${
          args?.offer || "our latest deal"
        }. Reply YES to claim.`,
        channel: args?.channel || "in_app",
        disclaimer: "Promotion draft is mocked. Tailor copy before sending.",
      };
    },
    mock: {
      keywords: ["promotion", "campaign", "blast", "announce"],
      suggestion:
        "Draft a promotional message with a clear CTA and schedule it for your preferred channel.",
    },
  },
  {
    name: "summarise_customer_context",
    displayName: "Customer Summary",
    description:
      "Summarise a customer's recent interactions, orders, and sentiment for quick reference.",
    parameters: {
      type: "object",
      properties: {
        customerId: {
          type: "string",
          description: "Customer identifier associated with the conversation",
        },
      },
    },
    async handler({ conversation }) {
      const latestAgentMessage = [...(conversation?.messages || [])]
        .reverse()
        .find((msg) => msg.role === "agent");
      return {
        recentInteractions: 3,
        lastAgentMessagePreview:
          latestAgentMessage?.content?.slice(0, 120) || null,
        sentiment: "positive",
        notes:
          "Customer summary is mocked. Replace with CRM analytics integration.",
      };
    },
    mock: {
      keywords: ["summary", "context", "history", "customer"],
      suggestion:
        "Review the customer's recent history so your response references prior interactions and preferences.",
    },
  },
  {
    name: "estimate_delivery",
    displayName: "Delivery Estimate",
    description:
      "Estimate delivery timelines and fees based on standard rules.",
    parameters: {
      type: "object",
      properties: {
        destinationZone: {
          type: "string",
          description: "Delivery zone or locality identifier",
        },
        urgency: {
          type: "string",
          description: "Delivery urgency level (standard, express)",
          enum: ["standard", "express"],
          default: "standard",
        },
      },
    },
    async handler({ args }) {
      const urgency = args?.urgency === "express" ? "express" : "standard";
      return {
        urgency,
        estimatedFee: urgency === "express" ? 8.5 : 4.0,
        estimatedDays: urgency === "express" ? 1 : 3,
        notes: "Delivery estimates are mocked. Hook into logistics service.",
      };
    },
    mock: {
      keywords: ["delivery", "shipping", "courier", "logistics"],
      suggestion:
        "Quote delivery timing and fees so the customer knows what to expect before confirming.",
    },
  },
  {
    name: "dispatch_message",
    displayName: "Dispatch Message",
    description:
      "Send a follow-up message to the customer via SMS, email, or in-app notification.",
    parameters: {
      type: "object",
      properties: {
        channel: {
          type: "string",
          enum: ["sms", "email", "in_app", "whatsapp"],
          description: "Delivery channel to use",
        },
        to: {
          type: "string",
          description:
            "Recipient identifier (phone number, email, or customer reference)",
        },
        subject: {
          type: "string",
          description: "Subject line for email messages",
        },
        body: {
          type: "string",
          description: "Message body or content to deliver",
        },
      },
      required: ["channel", "body"],
    },
    async handler({ args = {}, vendor, conversation }) {
      const channel = args.channel || "sms";
      const to = args.to || null;
      if (!to && channel !== "in_app") {
        throw new Error("Recipient (to) is required for non in-app messages");
      }

      const result = await messagingService.sendMessage({
        channel,
        to,
        subject: args.subject,
        body: args.body,
        metadata: {
          vendorId: vendor?._id?.toString?.() || vendor?.id || null,
          conversationId:
            conversation?._id?.toString?.() || conversation?.id || null,
        },
      });

      return {
        ...result,
        notes:
          result.provider === "mock"
            ? "Messaging provider not configured; message logged only."
            : "Message queued for delivery via configured provider.",
      };
    },
    mock: {
      keywords: ["message", "notify", "sms", "email", "follow", "respond"],
      suggestion:
        "Send a follow-up message confirming next steps and choose the customer's preferred channel.",
    },
  },
];

const agentToolRegistry = new AgentToolRegistry(DEFAULT_TOOLS);

module.exports = {
  AgentToolRegistry,
  AgentToolExecutionError,
  agentToolRegistry,
};
