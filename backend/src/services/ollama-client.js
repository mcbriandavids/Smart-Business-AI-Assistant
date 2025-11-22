const DEFAULT_ENDPOINT =
  process.env.OLLAMA_URL || "http://localhost:11434/api/chat";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama3";
const DEFAULT_TIMEOUT = Number(process.env.OLLAMA_TIMEOUT_MS || 20000);

const hasExplicitEndpoint = Boolean(process.env.OLLAMA_URL);

function isConfigured() {
  return hasExplicitEndpoint;
}

async function runLocalAgent(messages, options = {}) {
  const model = options.model || DEFAULT_MODEL;
  const endpoint = options.endpoint || DEFAULT_ENDPOINT;
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT;

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("runLocalAgent requires a non-empty messages array");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: false }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(
        `Ollama request failed with status ${response.status}${
          text ? `: ${text}` : ""
        }`
      );
    }

    const payload = await response.json();
    return {
      text: payload?.message?.content || "",
      raw: payload,
      model,
    };
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  runLocalAgent,
  isConfigured,
};
