# Smart Business AI Agent – Implementation Plan

## Phase 1 – Foundations

1. **Domain modeling**

   - Extend MongoDB schemas (Mongoose models) to capture: vendor subscriptions, customer profiles, conversation history, promotions, inventory, delivery pricing rules, ratings.
   - Ensure role-based auth guards and policy checks across API routes (vendor, customer, admin).

2. **Agent core**

   - Introduce `/api/agent-sessions` (initialise vendor session) and `/api/agent-sessions/{conversationId}/actions` (planning/execution loop) endpoints.
   - Integrate GPT-5-Codex function-calling with a tool registry.
   - Implement tool adapters for: inventory lookup, pricing & discount calculation, delivery quote (configurable rules), promotion drafting, CRM updates, customer messaging dispatch (SMS/email placeholders), and analytics summaries.
   - Log each tool invocation for auditing/cost tracking.

3. **Conversation store**

   - Persist multi-turn dialogues, tool outputs, and summaries per vendor/customer.
   - Add long-term memory strategy (vector store or rolling summarisation) to keep context while controlling token usage.

4. **Vendor dashboard updates**

   - Enhance the AI assistant widget to surface agent actions, message previews, and suggested follow-ups.
   - Expand customer management views with profiles, conversation history, ratings, and agent recommendations.

5. **Admin console**
   - Provide oversight dashboards: vendor activity, subscription state, conversation quality flags, customer ratings, audit log access.

## Phase 2 – Messaging & Feedback

1. **Customer channels**

   - Build message templating + personalization engine.
   - Implement inbound message ingestion (webhook stubs for SMS/email providers).
   - Maintain notification/message status tracking and SLA alerts.

2. **Ratings & QA**
   - Allow customers to rate interactions and leave feedback.
   - Enable admins to review, search, and escalate conversations flagged by the agent or customers.
   - ✅ Backend feedback endpoints, conversation rating storage, and admin QA review flows implemented (awaiting UI wiring).

## Phase 3 – Monetization & Compliance

1. **Subscriptions**

   - Define plan catalog (daily → semiannual) with entitlement checks and usage metering.
   - Integrate billing provider (Stripe/Paystack) and renewal reminders.

2. **Governance & compliance**
   - Enforce audit trail, rate limits, fallback behaviour when tools fail, and GDPR-compliant data retention.
   - Document disaster recovery and data export processes.

## Immediate Next Steps

- Confirm MongoDB schema changes and update Mongoose models (users, businesses, vendor-customers, orders, new collections for conversations/promotions/ratings/subscriptions).
- Decide on messaging providers and stub adapters (e.g., Twilio, SendGrid) with environment variables.
- Implement the agent backend skeleton (session creation, action loop, tool registry scaffolding) with OpenAI integration.
- Update README + env docs with new variables (OPENAI_API_KEY, messaging creds, subscription configs).
- Design frontend updates for the agent widget and dashboard to accommodate agent workflows.
