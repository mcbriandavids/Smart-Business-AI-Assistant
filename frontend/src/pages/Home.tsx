import React from "react";
import { Link } from "react-router-dom";
import { isAuthenticated, getUser } from "../utils/auth";

const productHighlights = [
  {
    title: "Autonomous Sales Partner",
    description:
      "Track intent signals, craft outreach, and nudge vendors automatically—your AI teammate never sleeps.",
  },
  {
    title: "Customer Intelligence Radar",
    description:
      "Surface risk, opportunity, and sentiment in real time so you can win the next best deal faster.",
  },
  {
    title: "Tool-Aware Automations",
    description:
      "Trigger follow-ups, schedule demos, and personalize offers using your connected CRMs and sales tools.",
  },
];

const insightBadges = [
  { label: "Vendors assisted", value: "1.2K+" },
  { label: "AI workflows automated", value: "6.8K" },
  { label: "Avg. response boost", value: "42%" },
];

const Home: React.FC = () => {
  const authed = isAuthenticated();
  const user = authed ? getUser() : null;
  const role = user?.role ?? null;
  const isVendor = role === "vendor" || role === "owner";
  const isAdmin = role === "admin";

  const heroActions = authed
    ? [
        {
          to: isAdmin ? "/admin" : "/dashboard",
          label: isAdmin ? "Open admin console" : "Open dashboard",
          variant: "btn--primary",
        },
        ...(isVendor
          ? [
              {
                to: "/profile",
                label: "View profile",
                variant: "btn--ghost",
              },
            ]
          : []),
      ]
    : [
        { to: "/register", label: "Get started", variant: "btn--primary" },
        { to: "/login", label: "Sign in", variant: "btn--ghost" },
      ];

  const ctaAction = authed
    ? {
        to: isAdmin ? "/admin" : "/vendor/customers",
        label: isAdmin ? "Review admin console" : "Manage customer journeys",
        variant: isAdmin ? "btn--ghost" : "btn--primary",
      }
    : {
        to: "/register",
        label: "Launch SmartBuys AI",
        variant: "btn--primary",
      };

  const footerActions = authed
    ? [
        {
          to: isAdmin ? "/admin" : "/dashboard",
          label: isAdmin ? "Return to admin" : "Back to dashboard",
          variant: "btn--primary",
        },
        ...(isVendor
          ? [
              {
                to: "/vendor/customers",
                label: "View customer workspace",
                variant: "btn--ghost",
              },
            ]
          : []),
      ]
    : [
        { to: "/register", label: "Create account", variant: "btn--primary" },
        { to: "/login", label: "Vendor sign in", variant: "btn--ghost" },
      ];

  return (
    <div className="landing-shell">
      <header className="landing-hero glass-panel glass-panel--hero">
        <div className="landing-hero__copy">
          <span className="branding-pill">SmartBuys AI</span>
          <h1 className="landing-title">
            Your autonomous commerce agent for sales teams that outpace the
            market.
          </h1>
          <p className="landing-subtitle">
            SmartBuys AI orchestrates customer conversations, learns buying
            intent, and executes playbooks so your team can close more deals
            with less busywork.
          </p>
          <div className="landing-hero__actions">
            {heroActions.map(({ to, label, variant }) => (
              <Link key={label} to={to} className={`btn ${variant} btn--lg`}>
                {label}
              </Link>
            ))}
          </div>
          <div className="landing-metrics">
            {insightBadges.map((badge) => (
              <div key={badge.label} className="landing-metric">
                <span className="landing-metric__value">{badge.value}</span>
                <span className="landing-metric__label">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="landing-hero__visual">
          <div className="landing-visual__globe">
            <div className="landing-visual__pulse landing-visual__pulse--one" />
            <div className="landing-visual__pulse landing-visual__pulse--two" />
            <div className="landing-visual__core">AI</div>
          </div>
          <div className="landing-visual__card glass-panel">
            <div className="landing-visual__label">Live agent briefing</div>
            <p className="landing-visual__text">
              “Yoma Stores viewed the pricing page 3 times today. Drafting a
              tailored upsell offer.”
            </p>
            <span className="landing-visual__status">Ready to deploy</span>
          </div>
        </div>
      </header>

      <section className="landing-section">
        <div className="landing-section__header">
          <h2 className="landing-section__title">
            Why teams choose SmartBuys AI
          </h2>
          <p className="landing-section__subtitle">
            Blend intelligence, automation, and messaging into one adaptive
            commerce agent.
          </p>
        </div>
        <div className="landing-grid">
          {productHighlights.map((item) => (
            <article key={item.title} className="landing-card glass-panel">
              <h3 className="landing-card__title">{item.title}</h3>
              <p className="landing-card__body">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--alt glass-panel">
        <div className="landing-cta">
          <div>
            <h2 className="landing-cta__title">
              Deploy a co-pilot that knows every customer move.
            </h2>
            <p className="landing-cta__subtitle">
              Connect your CRM, email, inventory, and storefront data. SmartBuys
              AI harmonizes signals, plans the next action, and keeps vendors in
              the loop.
            </p>
          </div>
          <Link
            to={ctaAction.to}
            className={`btn ${ctaAction.variant} btn--lg`}
          >
            {ctaAction.label}
          </Link>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section__header">
          <h2 className="landing-section__title">
            Built for modern sales + vendor teams
          </h2>
          <p className="landing-section__subtitle">
            Intelligent routing, autonomous follow-ups, and human-in-the-loop
            controls keep your workflows compliant and on brand.
          </p>
        </div>
        <div className="landing-showcase glass-panel">
          <div className="landing-showcase__column">
            <h3>Inbox intelligence</h3>
            <p>
              Summaries, intent scoring, and recommended replies surface inside
              every conversation. Approve or auto-send—SmartBuys AI adapts to
              your style.
            </p>
          </div>
          <div className="landing-showcase__column">
            <h3>Agent tooling</h3>
            <p>
              Integrate payment status, fulfilment tracking, and calendar
              scheduling so the agent can resolve requests end-to-end.
            </p>
          </div>
          <div className="landing-showcase__column">
            <h3>Guardrails</h3>
            <p>
              Human escalation, redaction, and data residency controls ensure AI
              actions stay secure and on policy from day one.
            </p>
          </div>
        </div>
      </section>

      <footer className="landing-footer glass-panel">
        <div>
          <h2 className="landing-footer__title">Ready when you are.</h2>
          <p className="landing-footer__subtitle">
            Start with guided onboarding, then let SmartBuys AI co-pilot your
            customer growth.
          </p>
        </div>
        <div className="landing-footer__actions">
          {footerActions.map(({ to, label, variant }) => (
            <Link key={label} to={to} className={`btn ${variant} btn--lg`}>
              {label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Home;
