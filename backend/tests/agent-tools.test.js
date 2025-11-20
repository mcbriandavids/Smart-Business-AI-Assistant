const { expect } = require("chai");
const {
  agentToolRegistry,
  AgentToolExecutionError,
} = require("../src/services/agent-tool-registry");

describe("Agent tool registry", () => {
  it("lists default tools", () => {
    const tools = agentToolRegistry.list();
    expect(tools).to.be.an("array");
    expect(tools.length).to.be.greaterThan(0);
    const names = tools.map((tool) => tool.name);
    [
      "lookup_inventory",
      "calculate_pricing",
      "draft_promotion",
      "summarise_customer_context",
      "estimate_delivery",
      "dispatch_message",
    ].forEach((expected) => expect(names).to.include(expected));
  });

  it("executes pricing calculator with deterministic result", async () => {
    const result = await agentToolRegistry.execute("calculate_pricing", {
      args: { basePrice: 100, discountPercentage: 10, quantity: 2 },
    });
    expect(result).to.include({
      basePrice: 100,
      discountPercentage: 10,
      quantity: 2,
    });
    expect(result.total).to.be.closeTo(193.5, 0.00001);
    expect(result.notes).to.be.a("string");
  });

  it("returns mock suggestions for inventory-related queries", () => {
    const suggestions = agentToolRegistry.getMockSuggestions(
      "Need stock update",
      {}
    );
    expect(suggestions).to.be.an("array").that.is.not.empty;
    expect(
      suggestions.some((text) => text.toLowerCase().includes("inventory"))
    ).to.equal(true);
  });

  it("dispatches message via mock provider when messaging keys are absent", async () => {
    const vendorMock = { _id: { toString: () => "vendor-1" } };
    const conversationMock = { _id: { toString: () => "conversation-1" } };

    const result = await agentToolRegistry.execute("dispatch_message", {
      args: { channel: "sms", to: "+15551234567", body: "Hello customer" },
      vendor: vendorMock,
      conversation: conversationMock,
    });

    expect(result).to.include({ channel: "sms", provider: "mock" });
    expect(result.body).to.equal("Hello customer");
    expect(result.notes).to.be.a("string");
  });

  it("throws AgentToolExecutionError for unknown tools", async () => {
    let thrown;
    try {
      await agentToolRegistry.execute("non_existent", {});
    } catch (error) {
      thrown = error;
    }
    expect(thrown).to.be.instanceOf(AgentToolExecutionError);
    expect(thrown.statusCode).to.equal(404);
  });
});
