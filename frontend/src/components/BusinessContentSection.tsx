import React, { useState } from "react";

interface BusinessContentSectionProps {
  businessContent: string;
  setBusinessContent: (content: string) => void;
  saving: boolean;
  onSave: () => void;
}

export default function BusinessContentSection({
  businessContent,
  setBusinessContent,
  saving,
  onSave,
}: BusinessContentSectionProps) {
  const [editMode, setEditMode] = useState<boolean>(false);

  const handleSave = async () => {
    await onSave();
    setEditMode(false);
  };

  return (
    <section className="glass-panel glass-panel--gradient">
      <div className="panel-header">
        <div>
          <div className="panel-eyebrow">Business profile</div>
          <h3 className="panel-title">Business description</h3>
          <p className="panel-subtitle">
            Keep this summary up to date so broadcasts and customer outreach
            stay on-brand.
          </p>
        </div>
        <div className="panel-actions">
          {!editMode ? (
            <button
              type="button"
              className="vendor-button vendor-button--ghost"
              onClick={() => setEditMode(true)}
            >
              Edit details
            </button>
          ) : (
            <button
              type="button"
              className="vendor-button vendor-button--primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          )}
        </div>
      </div>
      {!editMode ? (
        <p
          className="panel-subtitle"
          style={{ marginBottom: 0, whiteSpace: "pre-line" }}
        >
          {businessContent || "No description set."}
        </p>
      ) : (
        <div className="form-field">
          <label className="form-label" htmlFor="business-description">
            Description
          </label>
          <textarea
            id="business-description"
            className="form-input form-textarea"
            minLength={20}
            value={businessContent}
            onChange={(event) => setBusinessContent(event.target.value)}
            disabled={saving}
            placeholder="Share what makes your business unique."
          />
        </div>
      )}
    </section>
  );
}
