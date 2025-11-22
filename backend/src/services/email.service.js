const nodemailer = require("nodemailer");
const config = require("../config/config");

let transporter;
let lastPasswordReset;

function resolveTransport() {
  if (transporter) {
    return transporter;
  }

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
  } else if (process.env.SMTP_URL) {
    transporter = nodemailer.createTransport(process.env.SMTP_URL);
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return transporter;
}

function buildResetUrl(token) {
  const trimmed = config.frontendUrl.replace(/\/+$/, "");
  return `${trimmed}/reset-password?token=${token}`;
}

async function sendPasswordResetEmail({ to, token }) {
  const transport = resolveTransport();
  const resetUrl = buildResetUrl(token);

  const message = {
    from: process.env.EMAIL_FROM || "SmartBuys AI <no-reply@smartbuys.ai>",
    to,
    subject: "Reset your SmartBuys AI password",
    text: `You requested a password reset. Use the link below within 15 minutes.\n\n${resetUrl}\n\nIf you did not request this, you can ignore this message.`,
    html: `\n      <p>You requested a password reset for your SmartBuys AI account.</p>\n      <p><strong>This link will expire in 15 minutes.</strong></p>\n      <p><a href="${resetUrl}">Reset your password</a></p>\n      <p>If you did not request this, you can safely ignore this email.</p>\n    `,
  };

  lastPasswordReset = { to, token, resetUrl, message };

  const info = await transport.sendMail(message);

  if (transport.options && transport.options.jsonTransport) {
    console.log("[email] Password reset email", {
      to,
      resetUrl,
      preview: info?.message,
    });
  }

  return info;
}

function getLastPasswordResetPayload() {
  return lastPasswordReset || null;
}

module.exports = {
  sendPasswordResetEmail,
  getLastPasswordResetPayload,
};
