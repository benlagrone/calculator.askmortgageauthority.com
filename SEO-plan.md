## SEO Plan for calculator.askmortgageauthority.com

### Goals
- Rank category and individual calculator pages for mortgage/finance calculator queries.
- Drive qualified leads into prequal/contact flows.
- Preserve fast UX while adding crawlable, descriptive content.

### High-Impact Fixes (Week 1–2)
- **Semantic structure**: Add one `<h1>` to the hub (e.g., “Mortgage & Financial Calculators 2025”) and `<h2>` per category; ensure each calculator page has its own `<h1>`.
- **Anchor text**: Replace empty anchors with descriptive text for every calculator link (already in `templates/home.html` + subpages).
- **Category copy**: Add 100–150 words under each category heading (Mortgage & Loans; Investment & Savings; Retirement; Credit & Pay; Tools & Converters) explaining what’s inside and target keywords.
- **Metadata**: Hub `<title>` ~60 chars: “Mortgage & Financial Calculators | Ask Mortgage Authority”; `<meta description>` ~155 chars: “Use 40+ mortgage, refinance, APR, payment, retirement, and investment calculators. Fast, accurate tools by Ask Mortgage Authority.”
- **Schema**: Add `ItemList` (hub), `WebPage`, `BreadcrumbList`; per calculator add `FAQPage` + appropriate types (e.g., `LoanOrCredit`/`FinancialProduct` when applicable).
- **Internal linking**: From each calculator result area, link to related calculators and a lead CTA (“Get Pre-Qualified”).
- **Mobile menu**: Ensure grouped calculator links are injected on subpages in the hamburger menu; keep off the home page.

### Content Expansion (Week 3–4)
- **Category blocks**: For each category, add intro paragraphs, 3–5 bullet use-cases, and a “Start with…” deep link.
- **Calculator pages**: Add intro, sample scenarios, assumptions, and 3–5 FAQs; end with CTA + related calculators.
- **Blog synergy**: Publish guides that target calculator-intent terms and link into calculators (e.g., “How to calculate APR vs APY”, “Rent vs Buy with taxes and PMI”).

### Technical Checklist
- **Performance**: Keep core JS/CSS minified; defer non-critical scripts; serve static assets with caching.
- **Indexation**: Allow crawling of calculator pages; ensure canonical tags point to clean URLs (no querystrings for default state).
- **Sitemaps**: Add calculators to XML sitemap; submit in GSC.
- **Robots**: Permit calculators; block only irrelevant assets.
- **Analytics/Goals**: Track events: calculator submit, print/export, CTA clicks; set GA4 conversions.

### Information Architecture
- **Hub (home)**: Category sections with descriptive text and cards; no sidebars.
- **Subpages**: Left sidebar grouped like home categories on desktop; hamburger prepends grouped links on mobile.
- **CTAs**: Persistent top/bottom CTA bar on calc pages; post-result CTA block.

### Schema Starters (hub)
- `@type: WebPage`, `ItemList` of calculators (positioned entries), `BreadcrumbList`; add `potentialAction: SearchAction` if site search exists.
- For FAQs on each calculator page, add 3–5 high-intent Q&A.

### Copy Starters (examples)
- **Mortgage & Loans intro**: “Use these mortgage and loan calculators to model payments, APR, refinance savings, points, and rent vs buy scenarios…”
- **Investment & Savings intro**: “Project compound growth, IRR/NPV, bonds, HSA, and savings goals with these tools…”
- **Retirement intro**: “Plan 401k contributions, IRA vs Roth, RMDs, Social Security, and income drawdowns…”
- **Credit & Pay intro**: “Estimate credit card payoff, minimums, paycheck take-home, salary changes…”
- **Tools & Converters intro**: “Quick conversions for tip, discount, percentage, date math, unit conversion, inflation, fuel, and business margins…”

### Lead Flow Enhancements
- Inline CTA after results: “Get pre-qualified with these numbers.”
- Save/share: Offer email of results (soft lead capture).
- Cross-links: Show 3 related calculators beneath each form.

### Ongoing (Month 2–3)
- Publish 2–4 supporting articles/month; interlink.
- Add localized variants if targeting geos (state/county property tax assumptions).
- Monitor GSC for queries; expand FAQs accordingly.

### Success Metrics
- Impressions/clicks for “mortgage calculator”, “APR calculator”, “refinance calculator”, “rent vs buy calculator”, “HSA calculator”, “401k contribution calculator”, “ROI calculator”.
- Conversions: CTA clicks → form submissions → funded loan leads.
- Engagement: Scroll depth, calc submissions, time on page.

### Execution Order (practical)
1) Add headings, metadata, schema to hub.  
2) Fix anchor text + category copy.  
3) Enable grouped links in mobile menu on subpages; keep off home.  
4) Add CTAs + related-links blocks to calculators.  
5) Add FAQs per calculator page.  
6) Ship sitemap + GSC submission.  
7) Roll blog-support content + internal links.  
