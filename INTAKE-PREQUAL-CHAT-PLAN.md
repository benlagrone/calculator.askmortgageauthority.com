# Chat-Assisted Intake and Prequalification Plan

## Goal

Turn the calculator site into a better intake layer for mortgage leads without making it feel like a full loan application.

The recommended sequence is:

1. Calculator establishes the scenario.
2. Chat agent collects the missing intake details.
3. User is routed to the right next step:
   - start prequalification
   - schedule a consult
   - keep exploring calculators and education

This keeps the calculators useful for self-serve planning while giving the business a more structured path into lead capture and prequalification.

## Product thesis

The calculator site already captures high-intent user behavior, but the current handoff is generic:

- `js/main.js` injects one shared CTA block on calculator pages.
- `js/chat.js` already loads the chat iframe and sends the current page URL.
- `js/calculator-ui.js` already tracks calculator starts and CTA clicks.
- `index.html` already exposes configurable app URLs through meta tags.

The opportunity is to replace the generic handoff with a scenario-aware intake layer:

- calculators provide context
- chat gathers missing facts
- prequalification receives a cleaner, better-qualified lead

## Design principles

- Keep intake soft. Do not collect SSN, DOB, full account numbers, or anything that makes the calculator site behave like a full loan application.
- Use chat for triage, not underwriting.
- Reuse calculator data whenever possible so users do not have to re-enter values.
- Match the next step to intent and readiness instead of forcing every user into the same destination.
- Keep the first intake interaction short enough to complete on mobile.
- Never imply approval. Use language such as "review options," "estimate," and "start prequalification."

## Recommended user journeys

### Purchase flow

1. User runs affordability, DTI, closing costs, or rent-vs-buy.
2. CTA offers:
   - `Chat About My Scenario`
   - `Start Purchase Prequal`
3. Chat sees calculator context and asks only for the missing fields.
4. If readiness is high, route to the prequal/application destination with calculator context attached.
5. If readiness is lower, route to consult or follow-up instead.

### Refinance and home equity flow

1. User runs refinance, break-even, home equity, cash-out, HELOC, or PMI removal.
2. CTA offers:
   - `Chat About Refinance Options`
   - `Check My Options`
3. Chat confirms goal:
   - rate-and-term refinance
   - cash-out refinance
   - HELOC
   - debt consolidation
4. Chat fills missing data and routes to prequal or consultation based on fit and timing.

### Early-stage education flow

1. User browses collection pages or runs a planning calculator with weaker immediate intent.
2. Chat invitation is softer:
   - `Ask a Loan Expert`
   - `Get Help Choosing the Right Next Step`
3. Chat can still collect intake, but the default outcome is guidance or consult instead of full application.

## Where intake should appear first

Start on the highest-intent routes instead of every page in the library.

### Priority calculator pages

- `Loan-Affordability-Calculator`
- `Debt-to-Income-Ratio-Calculator`
- `Closing-Costs-Calculator`
- `Home-Equity-Calculator`
- `Cash-Out-Refinance-Calculator`
- `HELOC-Calculator`
- `Loan-Refinance-Calculator`
- `Refinance-Break-Even`

### Priority collection pages

- `Home-Buying-Calculators`
- `Refinance-Home-Equity-Calculators`
- `Debt-Income-Credit-Calculators`

### Optional later pages

- `Rent-Vs-Own`
- `PMI-Removal-Calculator`
- `Debt-Consolidation`

## Role of the chat agent

The chat agent should handle the soft intake layer between calculator usage and formal prequalification.

### What the chat agent should do

- acknowledge the current scenario
- explain what the calculator result means in plain language
- ask only for missing intake fields
- classify user intent
- decide the next best handoff
- produce a structured intake summary

### What the chat agent should not do

- state or imply mortgage approval
- promise a rate or product
- ask for SSN or DOB
- ask for document uploads inside the calculator experience
- replace the actual application or borrower portal

## Minimum intake fields for chat

The agent should collect only the smallest set of missing fields needed for routing.

### Scenario fields

- `intent`
  - purchase
  - refinance
  - cash_out_refinance
  - heloc
  - debt_consolidation
  - general_guidance
- `timeline`
  - now
  - 30_60_days
  - 3_6_months
  - researching
- `occupancy`
  - primary
  - second_home
  - investment
- `property_state`
- `zip_code`

### Qualification proxy fields

- `credit_band`
  - under_620
  - 620_679
  - 680_719
  - 720_plus
  - prefer_not_to_say
- `employment_profile`
  - salaried
  - self_employed
  - retired
  - other
- `down_payment_band` for purchase scenarios
- `equity_band` for refinance or equity scenarios

### Contact fields

- `first_name`
- `last_name`
- `email`
- `phone`
- `contact_consent`

## Calculator-to-chat context

The calculator should pass structured context into the chat iframe so the agent starts with the scenario already in hand.

### Context to send

- `calculator_type`
- `page_path`
- `page_title`
- `journey_type`
  - purchase
  - refinance
  - home_equity
  - debt_income_credit
  - general
- `inputs`
- `outputs`
- `derived_summary`
- `timestamp`

### Example payload

```json
{
  "type": "ama:set-context",
  "context": {
    "calculator_type": "Loan-Affordability-Calculator",
    "page_path": "/Loan-Affordability-Calculator",
    "page_title": "Loan Affordability Calculator",
    "journey_type": "purchase",
    "inputs": {
      "annualIncome": 120000,
      "monthlyDebts": 500,
      "downPayment": 60000,
      "interestRate": 6.5,
      "years": 30,
      "propertyTax": 6000,
      "insurance": 1200,
      "hoa": 0
    },
    "outputs": {
      "estimatedHomePrice": 455000,
      "maxLoanAmount": 395000,
      "estimatedPiti": 3100
    },
    "derived_summary": {
      "headline": "Estimated purchase budget around $455,000",
      "monthlyHousingBudget": 3100
    },
    "timestamp": "2026-04-01T14:20:00-05:00"
  }
}
```

### Why this matters

- chat can open with context instead of generic discovery
- the user does not need to repeat numbers they already entered
- intake data stays tied to the originating calculator run

## Chat-to-parent message contract

The existing `toggleChat` message should remain supported. Add a small structured contract for intake actions.

### Parent to iframe

- `ama:set-context`
  - initial page and calculator state
- `ama:update-context`
  - updated calculator state after recalculation or route change

### Iframe to parent

- `toggleChat`
  - keep existing behavior
- `ama:request-context`
  - iframe asks for the latest calculator context
- `ama:start-prequal`
  - parent opens the prequal/application destination
- `ama:book-consult`
  - parent opens consult or contact destination
- `ama:track`
  - iframe asks parent to fire analytics with a normalized payload

## Routing logic

The chat agent should not send every user to the same destination.

### Route to prequalification when

- user intent is explicit
- timeline is near-term
- enough information is collected
- no major ambiguity remains about the loan path

### Route to consult when

- the scenario is complex
- the user is unsure which product fits
- readiness is mixed
- the user asks for help before applying

### Keep in education mode when

- user is still researching
- user declines contact information
- the calculator result suggests additional planning before handoff

## Repo implementation shape

This can be implemented without changing the overall SPA model.

### Existing files to extend

- `js/main.js`
  - replace the generic CTA block with intent-aware CTA variants
  - open chat for soft intake on priority routes
  - route to prequal or consult when the chat iframe requests it
- `js/chat.js`
  - send full calculator context instead of only `parentUrl`
  - listen for structured messages back from the iframe
- `js/calculator-ui.js`
  - track intake and handoff analytics
- `index.html`
  - continue using meta tags for configurable destination URLs
- `server.py`
  - optional future endpoint for normalized intake persistence or signed handoff payloads

### Recommended new shared modules

- `js/intake-context.js`
  - normalize calculator inputs and outputs into a stable chat payload
- `js/prequal-routing.js`
  - centralize destination URLs and route selection logic

## Calculator context normalization

Calculator inputs and results are currently page-specific. Intake needs a normalized layer on top of them.

### Normalized fields by journey

#### Purchase

- `estimated_home_price`
- `estimated_loan_amount`
- `monthly_housing_budget`
- `gross_income_monthly`
- `monthly_debts`
- `down_payment`
- `estimated_dti`
- `estimated_cash_to_close`

#### Refinance

- `current_loan_balance`
- `current_rate`
- `proposed_rate`
- `monthly_savings`
- `break_even_months`
- `estimated_property_value`
- `estimated_ltv`

#### Home equity

- `estimated_property_value`
- `estimated_balance`
- `available_equity`
- `target_cash_out`
- `target_credit_line`

This normalization should happen in front-end code before the chat handoff so the agent receives a stable schema even though each calculator renders different DOM.

## CTA strategy

Replace the single generic CTA with route-aware variants.

### Purchase-oriented examples

- Primary: `Start Purchase Prequal`
- Secondary: `Chat About My Budget`

### Refinance-oriented examples

- Primary: `Check Refinance Options`
- Secondary: `Chat About My Scenario`

### Early-stage examples

- Primary: `Ask a Loan Expert`
- Secondary: `View More Calculators`

The CTA copy should match the page intent and the user stage. It should not imply that every scenario is already ready for application.

## Analytics plan

The current tracking foundation is already in place. Intake should extend it with a narrow set of new events.

### Recommended events

- `chat_intake_invite_view`
- `chat_intake_start`
- `chat_intake_complete`
- `chat_intake_abandon`
- `chat_intake_route_selected`
- `prequal_handoff_click`
- `consult_handoff_click`
- `calculator_context_sent_to_chat`

### Recommended dimensions

- `calculator_type`
- `journey_type`
- `intent`
- `timeline`
- `occupancy`
- `credit_band`
- `route_target`

Do not send raw sensitive information into analytics.

## Compliance and guardrails

- Keep all messaging in planning and guidance language.
- Treat chat-collected data as lead intake, not formal application data.
- Provide a clear note that calculator estimates are informational only.
- Avoid storing sensitive financial details unless there is a deliberate backend decision and a privacy review.
- If a handoff payload is persisted server-side later, document retention and access rules first.

## Phased implementation

### Phase 1: Context-aware chat handoff

- add route-aware CTA copy
- pass calculator context into the chat iframe
- let chat trigger prequal or consult destinations
- add analytics for chat intake entry and handoff

### Phase 2: Structured chat intake

- standardize the intake question flow inside the chat agent
- produce a structured summary object
- show the user a concise recap before handoff

### Phase 3: Persistence and resume

- optionally save partial intake state
- allow chat and calculator sessions to resume across visits
- add a backend endpoint only if the business needs normalized lead persistence from the calculator app

## Suggested first implementation order

1. Build calculator context normalization for the priority routes.
2. Extend the chat iframe contract to accept and request context.
3. Replace the generic CTA block on priority routes with route-aware CTA variants.
4. Add the analytics events in the shared UI layer.
5. Update the chat agent prompt and tooling to run the soft intake flow.
6. Add prequal or consult routing rules after the chat summary is complete.

## Open questions

- Which destination should count as the primary prequal URL: the existing contact page, a borrower portal, or a dedicated short-form prequal route?
- Should the chat agent always ask for contact information before routing, or only when the user wants follow-up?
- Should consult routing go to a calendar workflow, a contact form, or a loan officer directory?
- Is there an existing CRM payload format the chat or calculator app should match?

## Summary

The calculator site should not become a full application. It should become a better scenario-aware intake layer.

The recommended pattern is:

- calculators create context
- chat fills intake gaps
- structured routing sends the user to prequal, consult, or continued education

That approach is higher-conversion than a generic `Get Pre-Qualified` link, and it fits the structure the current repo already has.
