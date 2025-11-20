const { v4: uuid } = require("uuid");

const createMessagingService = (deps = {}) => {
  const {
    smsProvider = process.env.TWILIO_API_KEY ? "twilio" : "mock",
    emailProvider = process.env.SENDGRID_API_KEY ? "sendgrid" : "mock",
    logger = console,
  } = deps;

  const buildResult = (channel, to, body, extra = {}) => ({
    id: uuid(),
    channel,
    to,
    body,
    provider: extra.provider,
    subject: extra.subject || null,
    status: extra.status || "mocked",
    metadata: extra.metadata || {},
  });

  const sendSms = async ({ to, body, metadata }) => {
    if (!to) {
      throw new Error("SMS recipient (to) is required");
    }
    if (smsProvider === "twilio") {
      // Placeholder: integrate Twilio client here when credentials are supplied.
      logger.info("[Messaging] Twilio SMS dispatched", { to });
      return buildResult("sms", to, body, {
        provider: "twilio",
        status: "queued",
        metadata,
      });
    }
    logger.info("[Messaging] Mock SMS", { to, body });
    return buildResult("sms", to, body, {
      provider: "mock",
      metadata: { ...metadata, note: "Twilio not configured" },
    });
  };

  const sendEmail = async ({ to, subject, body, metadata }) => {
    if (!to) {
      throw new Error("Email recipient (to) is required");
    }
    if (emailProvider === "sendgrid") {
      logger.info("[Messaging] SendGrid email queued", { to, subject });
      return buildResult("email", to, body, {
        provider: "sendgrid",
        status: "queued",
        subject,
        metadata,
      });
    }
    logger.info("[Messaging] Mock email", { to, subject, body });
    return buildResult("email", to, body, {
      provider: "mock",
      status: "mocked",
      subject,
      metadata: { ...metadata, note: "SendGrid not configured" },
    });
  };

  const sendInApp = async ({ to, body, metadata }) => {
    logger.info("[Messaging] In-app notification", { to });
    return buildResult("in_app", to || null, body, {
      provider: "internal",
      status: "recorded",
      metadata,
    });
  };

  const sendMessage = async ({ channel, to, subject, body, metadata = {} }) => {
    if (!channel) {
      throw new Error("Channel is required");
    }

    const payload = { to, subject, body, metadata };

    switch (channel) {
      case "sms":
      case "whatsapp":
        return sendSms({ ...payload, metadata: { ...metadata, channel } });
      case "email":
        return sendEmail(payload);
      case "in_app":
      default:
        return sendInApp(payload);
    }
  };

  return {
    sendMessage,
  };
};

const messagingService = createMessagingService();

module.exports = {
  createMessagingService,
  messagingService,
};
