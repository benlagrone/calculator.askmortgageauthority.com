# Feature Roadmap

## Goal

Add new free calculators and companion tools that create search demand, strengthen mortgage lead capture, and improve on-site usefulness without bloating the catalog with low-value duplicates.

## Planning principles

- Prioritize practical decision tools over generic math utilities.
- Favor mortgage, homeownership, debt, and retirement tools that match real user intent.
- Reuse the shared calculator UI, validation, and SEO patterns instead of shipping one-off pages.
- Add data-backed tools only when the reference data can be maintained cleanly.
- Avoid overlap with existing calculators unless the new tool solves a meaningfully different user job.

## Phase 1: High-intent mortgage and homeownership tools (0-30 days)

1. HELOC Calculator
   - Why: strong mortgage adjacency and a clear catalog gap.
   - Build: medium.

2. PMI Removal Calculator
   - Why: highly practical homeowner use case with strong organic potential.
   - Build: low.

3. Closing Costs Calculator
   - Why: useful before purchase and refinance; good CTA bridge.
   - Build: medium.

4. Debt-to-Income Ratio Calculator
   - Why: easy to understand, easy to build, and close to pre-qualification intent.
   - Build: low.

5. Home Equity Calculator
   - Why: natural companion to refinance, HELOC, and seller decision flows.
   - Build: low.

## Phase 2: Conversion-focused debt and payoff tools (30-60 days)

1. Cash-Out Refinance Calculator
   - Why: meaningfully different from break-even and standard refinance tools.
   - Build: medium.

2. Mortgage Payoff Date Calculator
   - Why: users often want a payoff timeline, not just savings output.
   - Build: low.

3. Debt Snowball vs Avalanche Calculator
   - Why: stronger consumer debt tool than another generic payoff variant.
   - Build: medium.

4. Credit Utilization Calculator
   - Why: simple, understandable, and useful for credit score education.
   - Build: low.

5. Lease Buyout Calculator
   - Why: fits the existing auto tools and supports practical comparison decisions.
   - Build: medium.

## Phase 3: Retirement, tax, and investing expansion (60-90 days)

1. Safe Withdrawal Rate / FIRE Calculator
   - Why: high-interest retirement topic with broader audience reach.
   - Build: medium.

2. Dividend Income Calculator
   - Why: intuitive investing use case with broader appeal than some existing niche formulas.
   - Build: low.

3. Capital Gains Tax Calculator
   - Why: useful bridge between investing content and tax-aware decisions.
   - Build: medium.

4. Bonus Tax Calculator
   - Why: searchable pay-related tool that fits the current paycheck cluster.
   - Build: low.

5. Roth Conversion Impact Calculator
   - Why: strong retirement intent and good fit with IRA and RMD tools.
   - Build: medium.

## Companion tools roadmap

These are not pure calculators, but they improve retention, conversion, and perceived product quality.

1. Compare Scenarios
   - Save two or three runs side by side for loans, refinance, debt payoff, or retirement.

2. Share / Email Results
   - Create a low-friction handoff from calculator use to lead capture or follow-up.

3. Mortgage Glossary
   - Define PMI, APR, points, escrow, DTI, and related terms with internal links to calculators.

4. Buyer / Refinance Checklist Generator
   - Turn calculator outcomes into next-step guidance users can act on.

5. Bookmarkable or saved scenarios
   - Preserve calculator state for return visits and sales follow-up.

## Cross-cutting dependencies

1. Shared UI layer
   - Required markers, inline validation, helper text, and stronger results layout should land before broad feature expansion.

2. Shared SEO layer
   - Every new calculator should launch with route-specific HTML, intro copy, related calculators, and metadata.

3. Reference data strategy
   - Tax and retirement tools that depend on annual limits should use a clear data source and update cadence.

4. Analytics
   - Track calculator start, calculator completion, related-calculator click, share action, and CTA click for every new tool.

## Recommended first shipping order

1. HELOC Calculator
2. PMI Removal Calculator
3. Closing Costs Calculator
4. Debt-to-Income Ratio Calculator
5. Home Equity Calculator
6. Cash-Out Refinance Calculator
7. Debt Snowball vs Avalanche Calculator

## What not to build next

- More generic percentage or date tools.
- More near-duplicate loan calculators that do not solve a new user problem.
- Additional advanced finance formulas before the practical mortgage and debt gaps are filled.

## Success measures

- Organic traffic to new calculator pages.
- Calculator completion rate.
- Related-calculator click-through rate.
- CTA conversion rate from calculator pages.
- Return visits to saved or shared scenarios.
