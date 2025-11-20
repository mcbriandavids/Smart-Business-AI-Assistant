import React from "react";

interface BroadcastSectionProps {
  broadcastMsg: string;
  setBroadcastMsg: (msg: string) => void;
  broadcasting: boolean;
  broadcastSuccess: string | null;
  onSendBroadcast: () => void;
}

export default function BroadcastSection({
  broadcastMsg,
  setBroadcastMsg,
  broadcasting,
  broadcastSuccess,
  onSendBroadcast,
}: BroadcastSectionProps) {
  return (
    <section className="glass-panel">
      <div className="panel-header">
        <div>
          <div className="panel-eyebrow">Broadcasts</div>
          <h3 className="panel-title">Message all customers</h3>
          <p className="panel-subtitle">
            Send an announcement to every customer inbox. Keep it concise—your
            latest message is highlighted below.
          </p>
        </div>
        <div className="panel-actions">
          <button
            type="button"
            className="vendor-button vendor-button--primary"
            onClick={onSendBroadcast}
            disabled={broadcasting || !broadcastMsg.trim()}
          >
            {broadcasting ? "Sending…" : "Send broadcast"}
          </button>
        </div>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="broadcast-message">
          Message content
        </label>
        <textarea
          id="broadcast-message"
          className="form-input form-textarea"
          minLength={10}
          placeholder="Type your message…"
          value={broadcastMsg}
          onChange={(event) => setBroadcastMsg(event.target.value)}
          disabled={broadcasting}
        />
        <span className="form-helper">
          {broadcasting
            ? "Sending to all customers…"
            : "Make it actionable and under 280 characters."}
        </span>
      </div>

      {broadcastSuccess ? (
        <div
          className={`callout ${
            broadcastSuccess.toLowerCase().includes("failed")
              ? "callout--error"
              : "callout--success"
          }`}
        >
          {broadcastSuccess}
        </div>
      ) : null}
    </section>
  );
}
