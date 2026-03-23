# SEO Plan: calculator.askmortgageauthority.com

## Executive summary

The biggest SEO problem on this site is not a lack of calculators. It is the delivery model.

Right now, calculator URLs return the same generic shell and then load the real page content with JavaScript. That means Google has to render JS before it can see each calculator's main content, heading, and internal links. For a 72-page financial calculator library, that is the first bottleneck to fix. Until each calculator URL returns unique HTML with unique metadata, most other SEO work will have limited impact.

## Current audit

### What is already in place

- A sitemap exists and appears to cover all current calculator routes.
- The calculator hub has a real `h1`, intro copy, category sections, and some home-page structured data.
- The site already uses clean calculator URLs such as `/Financial-Calculators` and `/Annual-Percentage-Rate`.
- Many calculator templates already include a title-like heading and one-sentence description.

### What is limiting organic growth today

- Every unknown path falls back to `index.html`, so calculator routes serve the same shell before JS runs.
- Calculator content is injected into `#app-content` after page load via `fetch("/templates/${calculatorType}.html")`.
- Only the home template has an actual `h1`; calculator templates generally start with `h2`.
- Per-calculator titles are changed client-side only. The raw HTML does not ship unique descriptions, canonicals, Open Graph tags, or calculator-specific structured data.
- Home-page calculator cards use icon-only links in source HTML; readable anchor text is added later with JS.
- There is no `robots.txt` in the project root.
- Existing FAQ content is generic and injected with JS, not unique to each calculator.
- This is a finance site, so accuracy, assumptions, and trust signals matter more than they would on a low-stakes tool site.

## Goals for the next 90 days

- Get the main mortgage and refinance calculators indexed as distinct pages.
- Increase impressions and clicks for high-intent calculator queries.
- Turn calculator traffic into lead actions without hurting UX.
- Build enough trust and explanatory content that the pages are useful even before a user fills out the form.

## Priority roadmap

### P0: Fix indexability and route HTML (Week 1-2)

This is the highest-leverage work. Do this before writing a large volume of new SEO copy.

1. Serve unique HTML for each calculator route.
   - Preferred path: generate static HTML per calculator from the existing templates and keep JS for interactivity only.
   - Acceptable path: server-side render each calculator route in FastAPI.
   - Do not rely on post-load JS to provide the page's primary heading, intro copy, or internal links.

2. Return real status codes.
   - Unknown calculator slugs should return a real `404`, not the home shell.
   - If a calculator is intentionally retired, return `410` or redirect to the closest relevant replacement.

3. Add per-page metadata in the HTML response.
   - Unique `<title>`.
   - Unique `<meta name="description">`.
   - Self-referencing canonical.
   - Open Graph and Twitter metadata.
   - One calculator-specific structured data block where it helps, such as `BreadcrumbList`.

4. Add `robots.txt`.
   - Allow crawling for the calculator routes.
   - Reference the sitemap.
   - Avoid blocking CSS or JS needed for rendering.

5. Remove duplicate delivery risks.
   - If `/templates/*.html` remains publicly accessible, make sure those files cannot become indexable duplicates of the real calculator pages.

### P1: Strengthen on-page content and trust (Week 2-4)

Once each route is crawlable in raw HTML, improve the page quality itself.

1. Give every calculator a true `h1`.
   - The current `h2` title in each calculator template should become the main `h1`.
   - Keep result-section headings as `h2` or `h3`.

2. Add useful body copy directly in the template HTML.
   - 80-150 word intro that explains what the calculator does.
   - "How this works" section with the main inputs and assumptions.
   - One example scenario using realistic numbers.
   - "When to use this calculator" or "Common mistakes" section.
   - Related calculators section with contextual internal links.

3. Make FAQ content unique and visible.
   - Keep FAQs for users if they answer real questions.
   - Do not spend time chasing `FAQPage` rich results for this site. Google currently limits FAQ rich results to authoritative government or health sites.

4. Add trust signals for a financial tool.
   - "How we calculate this" notes.
   - Disclosure that outputs are estimates, not lending offers.
   - Last updated date.
   - Reviewer or editorial owner.
   - Links to any rate, tax, or regulatory assumptions when relevant.

### P1.5: Upgrade calculator UI and UX (Week 2-5)

This should run in parallel with the content pass. Better UX will improve engagement, reduce abandonment, and make the calculators feel more trustworthy.

1. Make field requirements obvious before submit.
   - Add visible required markers on all required inputs.
   - Label non-required inputs as optional where needed.
   - Keep placeholder values visually lighter than entered values.

2. Replace weak validation with inline feedback.
   - Stop using `alert()` for normal form validation.
   - Add field-level error text, invalid borders, and auto-focus on the first invalid field.
   - Add matching valid, focus, and disabled states so fields do not feel like default Bootstrap inputs.

3. Improve form scanning and input clarity.
   - Group long forms into sections such as loan details, taxes and insurance, income, and advanced options.
   - Make labels, suffixes, and units easier to distinguish from user-entered numbers.
   - Add short helper text for terms such as PMI, HOA, withdrawal rate, and APR assumptions.

4. Redesign the results area.
   - Show one primary result first.
   - Move secondary outputs into a compact card or grid layout.
   - Add a short "what this means" explanation and related next-step calculators.

5. Tighten mobile and accessibility behavior.
   - Increase vertical spacing for small screens.
   - Make the primary action more prominent and easier to tap.
   - Ensure error text, focus states, and accordions work cleanly with keyboard and screen reader flows.

6. Build the UI work as a shared system, not one-off fixes.
   - Centralize reusable calculator form styles in the shared CSS.
   - Add one shared validation and enhancement layer for all calculators.
   - Apply the pattern to modern calculators first, then legacy templates.

### P2: Improve information architecture (Week 3-6)

1. Create five category landing pages.
   - `/mortgage-loan-calculators/`
   - `/investment-calculators/`
   - `/retirement-calculators/`
   - `/credit-pay-calculators/`
   - `/tools-and-converters/`

2. Use those category pages as ranking targets.
   - Each page should have its own `h1`, intro copy, grouped calculator links, and light comparison guidance.
   - Add breadcrumb navigation from calculator pages back to the category page and hub.

3. Clean up internal linking.
   - Every calculator page should link to 3-6 tightly related calculators.
   - Add a small "best next calculators" block below the results area.
   - Use descriptive anchor text in the HTML source, not only via JS enhancement.

### P3: Publish supporting content that feeds the calculators (Month 2-3)

Use articles to capture informational queries and pass internal-link authority into the calculators.

- Mortgage cluster:
  - How to calculate mortgage payment with taxes and insurance
  - APR vs interest rate
  - When refinancing breaks even
  - Rent vs buy framework

- Retirement cluster:
  - Roth vs traditional IRA decision guide
  - RMD basics
  - How to estimate retirement income gaps

- Investment cluster:
  - IRR vs NPV
  - Rule of 72 limitations
  - Treasury bill yield basics

Each article should link to the matching calculator and the relevant category page.

## File-level implementation map

- `server.py`
  - Replace the SPA-only fallback with route-aware responses and real 404 handling.

- `index.html`
  - Keep the hub metadata here.
  - Stop using this file as the only HTML shell for every calculator route.

- `templates/*.html`
  - Promote calculator headings to `h1`.
  - Add intro, assumptions, example, FAQs, and related links in source HTML.
  - Add required markers, better field grouping, helper text, and stronger result presentation.

- `js/main.js`
  - Keep JS for form logic and hydration.
  - Stop treating client-side title changes as the main SEO solution.

- `js/calculator-ui.js`
  - Add shared inline validation, required-field handling, result reveal behavior, and accessibility hooks.

- `css/style.css`
  - Move calculator UI away from default Bootstrap styling with clearer placeholder, focus, error, and result-card states.

- `sitemap.xml`
  - Keep current URL coverage.
  - Update `lastmod` when templates change materially.

- `robots.txt`
  - Add this file at the project root.

## Metrics to track

- Indexing:
  - Number of calculator URLs indexed in Google Search Console.
  - Number of soft 404 or duplicate-without-user-selected-canonical reports.

- Search performance:
  - Impressions, clicks, CTR, and average position for calculator pages.
  - Top non-brand queries by calculator and category page.

- Engagement:
  - Calculator starts.
  - Calculator completions.
  - Related calculator clicks.
  - CTA clicks to contact or pre-qualification.

- Conversion:
  - Organic sessions to calculator pages.
  - Lead-form starts from calculator traffic.
  - Qualified leads attributed to organic calculator visits.

## Recommended execution order

1. Route-specific HTML and real 404s.
2. Per-page titles, descriptions, canonicals, and breadcrumbs.
3. `h1` fixes plus unique intro and assumptions on top calculators first.
4. Shared calculator UI pass: required markers, inline validation, field grouping, and results hierarchy.
5. `robots.txt` and sitemap refresh.
6. Category pages and related-calculator linking.
7. Trust/disclosure blocks across all finance calculators.
8. Supporting articles that feed the calculators.

## What not to over-invest in first

- `meta keywords`
  - Low value. Do not spend time expanding this tag.

- Generic FAQ schema
  - Useful visible FAQs are fine, but FAQ rich results are not the prize here.

- Large batches of thin local pages
  - Do not create city or ZIP pages unless the content and assumptions are genuinely different and useful.

## Source notes

This plan is based on the current codebase plus current Google Search guidance on:

- JavaScript SEO and route handling
- crawlable links
- titles and snippets
- sitemaps
- breadcrumb structured data
- helpful, satisfying content
- current FAQ rich result eligibility limits
