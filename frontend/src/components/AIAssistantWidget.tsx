import { useState } from "react";
import AIAssistantPanel from "./AIAssistantPanel";
import { useAssistantContext } from "../contexts/AssistantContext";

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const icons = {
  chat: (
    <svg {...iconProps}>
      <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5H11l-4.5 4v-4A8.5 8.5 0 1 1 21 12z" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </svg>
  ),
  close: (
    <svg {...iconProps}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  ),
};

export default function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const { conversationId, customerId } = useAssistantContext();

  return (
    <div
      className={`assistant-floating ${open ? "assistant-floating--open" : ""}`}
    >
      {open ? (
        <div className="assistant-floating__panel">
          <AIAssistantPanel
            variant="widget"
            onClose={() => setOpen(false)}
            preferredConversationId={conversationId}
            preferredCustomerId={customerId}
          />
        </div>
      ) : null}

      <button
        type="button"
        className="assistant-floating__cta"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      >
        {open ? icons.close : icons.chat}
        <span>{open ? "Close" : "Ask AI"}</span>
      </button>
    </div>
  );
}
