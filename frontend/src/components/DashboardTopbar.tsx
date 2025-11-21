import React from "react";

interface DashboardTopbarProps {
  me: any;
  search: string;
  onSearchChange: (value: string) => void;
  showSearch?: boolean;
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const SearchIcon = (
  <svg {...iconProps}>
    <circle cx="11" cy="11" r="6" />
    <line x1="20" y1="20" x2="16.65" y2="16.65" />
  </svg>
);
const getGreetingName = (me: any) => {
  return me?.data?.user?.firstName || me?.data?.user?.email || "there";
};

export default function DashboardTopbar({
  me,
  search,
  onSearchChange,
  showSearch = true,
}: DashboardTopbarProps) {
  const greetingName = getGreetingName(me);

  return (
    <section className="glass-panel glass-panel--compact">
      <div
        className="panel-header"
        style={{ alignItems: showSearch ? "flex-end" : "flex-start" }}
      >
        <div>
          <div className="panel-eyebrow">Welcome back</div>
          <h2 className="panel-title" style={{ display: "flex", gap: 8 }}>
            <span>Hello {greetingName}</span>
            <span role="img" aria-label="wave">
              👋
            </span>
          </h2>
          <p className="panel-subtitle">
            Monitor broadcasts, manage customer records, and keep your business
            details fresh.
          </p>
        </div>
        {showSearch ? (
          <div
            className="panel-actions"
            style={{ width: "100%", maxWidth: 320 }}
          >
            <label className="input-with-icon">
              <span className="input-with-icon__icon" aria-hidden="true">
                {SearchIcon}
              </span>
              <input
                type="search"
                className="form-input input-with-icon__control"
                placeholder="Search customers"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </label>
          </div>
        ) : null}
      </div>
    </section>
  );
}
