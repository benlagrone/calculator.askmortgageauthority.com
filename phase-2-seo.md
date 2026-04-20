## Phase 2: Indexing + Ranking Acceleration (Handoff)

Based on GA4: hub ~185 views, individual calcs 3–8 views, organic 0, good engagement but weak indexing. Google isn’t ranking calculators individually. Next actions:

1) Full sitemap for every calculator  
   - Generate `https://calculator.askmortgageauthority.com/sitemap.xml` with all calculator URLs (60+), include `<lastmod>`, submit in GSC.

2) Auto-inject 300–400 words per calculator page  
   - Block with: H1, intro, “How this works”, “Example calculation”, “FAQs” (Q/A list).

3) Related-calculators block on every calculator  
   - 3–6 contextual links per page (e.g., APR → Refi Break-Even, Loan Comparison).

4) Breadcrumb schema per calculator  
   - `BreadcrumbList` e.g., Home > Calculators > Mortgage Calculators > APR Calculator.

5) Per-calculator title + meta description  
   - Title: `{Calculator Name} | Mortgage Tools by AskMortgageAuthority`  
   - Description: `Use the {Calculator Name} to evaluate {purpose}. Fast, accurate, mobile-friendly mortgage tools.`

6) FAQ JSON-LD per calculator  
   - `FAQPage` schema reflecting the on-page FAQs.

7) CTA after calculator output  
   - “Get Pre-Qualified” / “Talk to a loan expert” / “Send estimate to email”.

8) Category index pages (5)  
   - `/mortgage-loan-calculators/`, `/investment-calculators/`, `/retirement-calculators/`, `/credit-pay-calculators/`, `/tools-and-converters/` with H1/H2s, intros, list of calculators, `ItemList` schema.

9) Canonical tags on every calculator  
   - `<link rel="canonical" href="https://calculator.askmortgageauthority.com/{slug}">`

10) OpenGraph meta per calculator  
   - `og:title`, `og:description`, `og:url`, `og:image`.

11) GA4 events  
   - Track: `calculator_start`, `calculator_result`, `calculator_reset`, `related_calculator_click`, `cta_click`.

12) Keyword-rich HTML footer  
   - Indexable footer with mortgage/loan/investment/APR/refi calculator keywords.

13) URL normalization  
   - Use `https://calculator.askmortgageauthority.com/{Slug}`; no `.html`, no params, consistent trailing slash policy.

14) Noindex placeholders  
   - Add `<meta name="robots" content="noindex">` on any empty/broken pages.

15) Performance budgets (LCP < 2.0s, CLS < 0.1)  
   - Defer/async scripts, compress assets, prefer WebP, minimize render-blocking.

What to produce next (pick any):  
- Exact sitemap.xml and robots.txt entry.  
- JSON-LD templates (FAQ, Breadcrumb, ItemList).  
- Auto-generated content blocks for each calculator.  
- Category page templates.  
- Meta title/description map per calculator.  
- GA4 event tracking plan with dataLayer names.  
