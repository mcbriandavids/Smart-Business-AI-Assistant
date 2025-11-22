import React from "react";
import { Link } from "react-router-dom";
import { getUser, isAuthenticated } from "../utils/auth";

const positioningHighlights = [
  {
    title: "Position your offer",
    body: "Lead with an autonomous commerce agent that makes every vendor feel like they have a dedicated growth strategist on call.",
  },
  {
    title: "Prove fast impact",
    body: "Showcase live intent scoring, proactive outreach, and AI-authored follow-ups that unlock pipeline in days, not months.",
  },
  {
    title: "Keep humans in control",
    body: "Human-in-the-loop reviews, escalation paths, and data guardrails keep the experience trusted and compliant from day one.",
  },
];

const orientationHighlights = [
  {
    title: "Who it serves",
    body: "Revenue, vendor success, and enablement teams coordinating multi-channel commerce.",
  },
  {
    title: "Problems it solves",
    body: "Fragmented vendor outreach, slow handoffs, and missed buying signals across teams.",
  },
  {
    title: "What to emphasize",
    body: "Act on live intent, automate repeatable tasks, and keep humans in the loop with controls.",
  },
];

const activationSteps = [
  {
    title: "Connect data sources",
    description:
      "Link CRM, catalog, and messaging channels so SmartBuys AI can understand context and automate with precision.",
  },
  {
    title: "Model your playbooks",
    description:
      "Configure outreach cadences, approval rules, and escalation paths. Use the Styleguide page for tone and sample responses.",
  },
  {
    title: "Go live with guardrails",
    description:
      "Launch targeted automations, monitor live timelines, and keep humans ready to approve or take over when needed.",
  },
];

const navigationShortcuts = [
  {
    title: "Dashboard",
    description:
      "See health metrics, quick summaries, and live assistant activity in one glance.",
    to: "/dashboard",
    label: "Open dashboard",
  },
  {
    title: "Customer workspace",
    description:
      "Manage vendor accounts, respond to escalations, and trigger outreach sequences.",
    to: "/vendor/customers",
    label: "View customer workspace",
  },
  {
    title: "Notifications",
    description:
      "Stay ahead of approvals, AI recommendations, and compliance alerts.",
    to: "/notifications",
    label: "Review notifications",
  },
  {
    title: "Profile",
    description:
      "Keep business details, contact channels, and compliance docs updated with the glassmorphism editor.",
    to: "/profile",
    label: "Update profile",
  },
];

const assistanceResources = [
  {
    title: "AI Assistant widget",
    description:
      "Ask product positioning questions or generate new playbooks right inside the app sidebar.",
  },
  {
    title: "Styleguide",
    description:
      "Reference tone, messaging pillars, and approved copy blocks. Enable via Vite flag if hidden in production builds.",
  },
  {
    title: "Support Escalations",
    description:
      "Use in-app notifications to route urgent customer issues back to human teammates instantly.",
  },
];

const HelpPage: React.FC = () => {
  const authed = isAuthenticated();
  const user = authed ? getUser() : null;
  const role = user?.role ?? null;
  const isAdmin = role === "admin";

  const primaryCta = authed
    ? {
        to: isAdmin ? "/admin" : "/dashboard",
        label: isAdmin ? "Open admin console" : "Jump into your dashboard",
      }
    : { to: "/register", label: "Create your SmartBuys account" };

  const secondaryCta = authed
    ? {
        to:
          role === "vendor" || role === "owner"
            ? "/profile"
            : "/vendor/customers",
        label:
          role === "vendor" || role === "owner"
            ? "Refresh your vendor profile"
            : "Review customer workspace",
      }
    : { to: "/login", label: "Sign in to continue" };

  return (
    <div className="help-page">
      <header className="help-hero glass-panel">
        <div className="help-hero__copy">
          <span className="help-hero__badge">Orientation</span>
          <h1 className="help-hero__title">
            Position, launch, and navigate SmartBuys AI
          </h1>
          <p className="help-hero__subtitle">
            Equip teammates with talking points, onboarding steps, and
            navigation tips so the autonomous commerce agent lands with clarity.
          </p>
          <div className="help-hero__actions">
            <Link to={primaryCta.to} className="btn btn--primary btn--lg">
              {primaryCta.label}
            </Link>
            <Link to={secondaryCta.to} className="btn btn--ghost btn--lg">
              {secondaryCta.label}
            </Link>
          </div>
        </div>
        <div className="help-hero__grid">
          {orientationHighlights.map((item) => (
            <article key={item.title} className="help-card glass-panel">
              <h3 className="help-card__title">{item.title}</h3>
              <p className="help-card__body">{item.body}</p>
            </article>
          ))}
        </div>
      </header>

      <section className="help-section glass-panel">
        <div className="help-section__header">
          <h2 className="help-section__title">Go-to-market talking points</h2>
          <p className="help-section__subtitle">
            Use these pillars when positioning SmartBuys AI with stakeholders,
            vendors, and partners.
          </p>
        </div>
        <div className="help-grid">
          {positioningHighlights.map((item) => (
            <article key={item.title} className="help-card">
              <h3 className="help-card__title">{item.title}</h3>
              <p className="help-card__body">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="help-section">
        <div className="help-section__header">
          <h2 className="help-section__title">Launch checklist</h2>
          <p className="help-section__subtitle">
            Roll out the agent methodically to show value while protecting your
            brand.
          </p>
        </div>
        <ol className="help-steps glass-panel">
          {activationSteps.map((step, index) => (
            <li key={step.title} className="help-step">
              <div className="help-step__index">{index + 1}</div>
              <div className="help-step__body">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="help-section glass-panel">
        <div className="help-section__header">
          <h2 className="help-section__title">Navigate your workspace</h2>
          <p className="help-section__subtitle">
            Every surface inside SmartBuys AI is designed to keep vendors
            responsive and informed.
          </p>
        </div>
        <div className="help-grid help-grid--navigation">
          {navigationShortcuts.map((item) => (
            <article key={item.title} className="help-card help-card--nav">
              <div>
                <h3 className="help-card__title">{item.title}</h3>
                <p className="help-card__body">{item.description}</p>
              </div>
              <Link to={item.to} className="btn btn--ghost btn--sm">
                {item.label}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="help-section">
        <div className="help-section__header">
          <h2 className="help-section__title">Enable your team</h2>
          <p className="help-section__subtitle">
            Keep guidance close to the workflows so everyone ships with
            confidence.
          </p>
        </div>
        <div className="help-grid">
          {assistanceResources.map((item) => (
            <article key={item.title} className="help-card glass-panel">
              <h3 className="help-card__title">{item.title}</h3>
              <p className="help-card__body">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="help-footer glass-panel">
        <div>
          <h2 className="help-footer__title">Need another walkthrough?</h2>
          <p className="help-footer__subtitle">
            Ping the AI assistant widget for scripts, share this page with
            stakeholders, or invite us to your next enablement call.
          </p>
        </div>
        <Link to={primaryCta.to} className="btn btn--primary btn--lg">
          {primaryCta.label}
        </Link>
      </footer>
    </div>
  );
};

export default HelpPage;
