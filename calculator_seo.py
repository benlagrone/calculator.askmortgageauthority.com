import re
from dataclasses import dataclass
from html import escape, unescape
from typing import Dict, Iterable, List, Optional, Sequence


H2_RE = re.compile(r"<h2(?P<attrs>[^>]*)>(?P<title>.*?)</h2>", re.IGNORECASE | re.DOTALL)
ANCHOR_RE = re.compile(
    r'<a href="/(?P<href>[^"]+)"[^>]*data-calculator="(?P<slug>[^"]+)"',
    re.IGNORECASE,
)
ID_RE = re.compile(r'id="(?P<id>[^"]+)"', re.IGNORECASE)
PARAGRAPH_RE = re.compile(r"<p[^>]*>(?P<content>.*?)</p>", re.IGNORECASE | re.DOTALL)
LABEL_RE = re.compile(r"<label(?P<attrs>[^>]*)>(?P<text>.*?)</label>", re.IGNORECASE | re.DOTALL)
TAG_RE = re.compile(r"<[^>]+>")
SPACE_RE = re.compile(r"\s+")

GENERIC_PAGE_KEYWORDS = {
    "calculators",
    "results",
    "required",
    "optional",
    "calculate",
    "reset",
    "print",
}

CATEGORY_GUIDANCE = {
    "mortgage-loans": {
        "focus": "payment scenarios, borrowing costs, affordability, refinance math, and payoff timing",
        "comparison": "rates, term length, upfront fees, escrow costs, and payment strategy",
        "outcome_focus": "monthly payment, total interest, affordability, and payoff speed",
    },
    "investment-savings": {
        "focus": "returns, income planning, savings growth, yield, and risk-adjusted comparison",
        "comparison": "contribution levels, expected return, time horizon, taxes, and fees",
        "outcome_focus": "growth, yield, risk, and long-term value",
    },
    "retirement": {
        "focus": "retirement savings, contribution strategy, Social Security timing, and drawdown planning",
        "comparison": "contributions, retirement age, withdrawal assumptions, and expected returns",
        "outcome_focus": "income sustainability, account growth, and retirement readiness",
    },
    "credit-pay": {
        "focus": "debt payoff timing, minimum payments, consolidation trade-offs, and cash-flow impact",
        "comparison": "payment amount, interest cost, payoff timeline, and balance management",
        "outcome_focus": "cash flow, payoff speed, and total borrowing cost",
    },
    "tools-converters": {
        "focus": "quick planning math, conversion tasks, and day-to-day financial estimates",
        "comparison": "base assumptions, units, rates, and simple scenario changes",
        "outcome_focus": "clarity, quick comparison, and practical next-step decisions",
    },
}

COLLECTION_PAGE_CONFIGS = {
    "Home-Buying-Calculators": {
        "category_title": "Mortgage-First Collections",
        "category_anchor": "featured-collections",
        "related_slugs": (
            "Financial-Calculators",
            "Loan-Affordability-Calculator",
            "Closing-Costs-Calculator",
            "Refinance-Home-Equity-Calculators",
        ),
        "intro_paragraphs": (
            "Use this collection when the main question is whether you can buy, what the payment looks like, and how much cash you need to close. It groups the calculators people typically use first when they are sizing up a purchase or comparing renting with owning.",
            "Start with monthly payment, affordability, debt-to-income, and closing cost math before moving into edge cases. Those numbers usually determine whether the rest of the home-buying decision is realistic in the first place.",
            "Once the baseline works, compare rent-versus-buy scenarios, APR, loan points, and tax assumptions so the decision is based on total cost instead of headline payment alone.",
            "After this collection, move into refinance and home-equity tools only if the next question is restructuring an existing mortgage rather than qualifying for or comparing a purchase.",
        ),
        "faqs": (
            (
                "Which calculators should I use first when buying a home?",
                "Most buyers should start with payment, affordability, debt-to-income, and closing cost calculators. Those four numbers frame whether the target purchase is workable before you compare more detailed loan structures.",
            ),
            (
                "When should I use rent-vs-buy calculators?",
                "Use rent-vs-buy tools after you understand the likely payment and upfront cash needed to buy. They are most useful when you want to compare time horizon, appreciation, rent growth, and ownership costs together.",
            ),
            (
                "What comes after the home-buying collection?",
                "If the purchase math works, the next step is usually comparing lender offers, APR, points, and tax assumptions. If you already own the home and want to change the loan, move to the refinance and home-equity collection instead.",
            ),
        ),
    },
    "Refinance-Home-Equity-Calculators": {
        "category_title": "Mortgage-First Collections",
        "category_anchor": "featured-collections",
        "related_slugs": (
            "Refinance-Break-Even",
            "Loan-Refinance-Calculator",
            "HELOC-Calculator",
            "Home-Buying-Calculators",
        ),
        "intro_paragraphs": (
            "Use this collection when you already own the property and need to decide whether changing the loan structure creates real value. It focuses on break-even timing, payoff strategy, cash-out scenarios, and borrowing against existing equity.",
            "Start with refinance and break-even math before looking at cash-out or HELOC options. That order keeps the decision anchored on cost and timing instead of starting from the maximum amount you could borrow.",
            "If equity access is the goal, compare cash-out refinance, HELOC, PMI removal, and debt consolidation assumptions side by side. The important trade-off is usually flexibility versus long-term borrowing cost, not just payment size.",
            "After this collection, return to the home-buying tools only if you are comparing a new purchase path against keeping and restructuring the current home loan.",
        ),
        "faqs": (
            (
                "Which refinance calculator should I use first?",
                "Start with refinance break-even and a current-versus-proposed loan comparison. Those two views usually show whether the lower rate or different term creates enough savings to justify the fees.",
            ),
            (
                "When is a HELOC more useful than a cash-out refinance calculator?",
                "Use the HELOC calculator when flexibility and staged borrowing matter more than locking everything into a new first mortgage. Use cash-out refinance math when you want one new loan replacing the existing one.",
            ),
            (
                "Why compare payoff tools in this collection?",
                "Prepayment and early-payoff tools help reveal whether you need a refinance at all. Sometimes the better move is keeping the current note and changing payment behavior instead of paying new closing costs.",
            ),
        ),
    },
    "Debt-Income-Credit-Calculators": {
        "category_title": "Mortgage-First Collections",
        "category_anchor": "featured-collections",
        "related_slugs": (
            "Debt-to-Income-Ratio-Calculator",
            "Paycheck-Calculator",
            "Credit-Card-Payoff-Calculator",
            "Home-Buying-Calculators",
        ),
        "intro_paragraphs": (
            "Use this collection when the real constraint is not the loan product but the cash-flow picture behind it. It groups the calculators that show whether debt load, take-home pay, and repayment behavior support a new mortgage or refinance decision.",
            "Start with debt-to-income and paycheck math so the borrowing decision is grounded in actual monthly capacity. Then compare card payoff and consolidation paths if the numbers are too tight for the housing payment you want.",
            "These tools are especially useful before applications, pre-qualification, or lender conversations because they show which constraint is doing the most damage: existing debt, taxes, or income assumptions.",
            "After this collection, move back into home-buying or refinance tools once the cash-flow picture is clear enough to compare specific loan options.",
        ),
        "faqs": (
            (
                "Why pair debt-to-income and paycheck calculators?",
                "Debt-to-income shows what lenders may see, while paycheck math shows what you actually keep after withholding. Looking at both gives a more realistic picture of borrowing room than either one alone.",
            ),
            (
                "When should I use the credit-card payoff tools before applying?",
                "Use them when revolving debt is keeping your DTI too high or crowding out monthly payment capacity. Even modest payoff changes can materially improve the borrowing picture.",
            ),
            (
                "What should I do after the debt and income numbers look workable?",
                "Move into affordability, payment, and closing cost calculators so you can compare actual housing scenarios against the cash-flow room you just confirmed.",
            ),
        ),
    },
    "Investment-Retirement-Calculators": {
        "category_title": "Mortgage-First Collections",
        "category_anchor": "featured-collections",
        "related_slugs": (
            "Retirement-Planner",
            "Compound-Interest-Calculator",
            "IRR-NPV-Calculator",
            "Everyday-Money-Tools",
        ),
        "intro_paragraphs": (
            "Use this collection for longer-horizon planning rather than immediate borrowing decisions. It groups retirement readiness, contribution strategy, income planning, and return analysis tools into one path.",
            "Start with broad savings and retirement readiness tools before moving into portfolio or market-specific calculators. That sequence keeps the planning anchored on goals and cash-flow needs instead of isolated return assumptions.",
            "When you need deeper analysis, compare IRR, NPV, expected return, asset allocation, and withdrawal-related tools together. The important question is usually sustainability over time, not which single metric looks strongest in isolation.",
            "After this collection, use the everyday money tools only for quick utility math. They stay available, but they should not replace goal-based planning or retirement scenario work.",
        ),
        "faqs": (
            (
                "Which retirement tools should I start with?",
                "Most people should begin with a retirement planner, contribution calculator, and income analysis. Those three calculators establish whether saving pace, target age, and expected retirement cash flow fit together.",
            ),
            (
                "When do IRR and NPV belong in this collection?",
                "Use IRR and NPV when you are comparing projects or investments with multiple cash-flow periods. They are more useful for decision comparison than for general retirement readiness.",
            ),
            (
                "Why keep investment and retirement tools together?",
                "They answer related questions about growth, income, and sustainability over time. Grouping them helps users move from simple savings math into more advanced return and withdrawal trade-offs without leaving the same planning path.",
            ),
        ),
    },
    "Everyday-Money-Tools": {
        "category_title": "Mortgage-First Collections",
        "category_anchor": "featured-collections",
        "related_slugs": (
            "Tip-Calculator",
            "Unit-Conversion",
            "Currency-Converter",
            "Investment-Retirement-Calculators",
        ),
        "intro_paragraphs": (
            "Use this collection for quick utility math that still belongs in the library but should not lead the mortgage journey. It keeps everyday tools available without letting them crowd the higher-intent borrowing and planning paths.",
            "These calculators are best when you need a fast answer for conversions, percentages, discounts, date math, or other practical estimates. They are intentionally grouped one layer deeper so they remain accessible but secondary.",
            "For higher-stakes decisions, move back to the mortgage, debt, refinance, investment, or retirement collections. Those sections are built around decision paths, while this one is built around convenience.",
            "Keeping these tools clustered helps the site stay useful without making broad utility queries compete with the pages that are most relevant to the Ask Mortgage Authority brand.",
        ),
        "faqs": (
            (
                "Why are these tools in a separate collection?",
                "They are useful but less central to the mortgage-first purpose of the site. Grouping them separately keeps them available without letting them dominate the main entry path.",
            ),
            (
                "Which tools belong in this collection?",
                "This collection holds practical utility calculators such as tip, discount, percentage, date, conversion, fuel, and similar quick-answer tools that support general financial planning.",
            ),
            (
                "When should I leave the everyday tools collection?",
                "Move to the mortgage, refinance, debt, investment, or retirement collections when the question becomes a larger decision rather than a quick calculation.",
            ),
        ),
    },
}


@dataclass(frozen=True)
class SeoFaq:
    question: str
    answer: str


@dataclass(frozen=True)
class RelatedCalculator:
    slug: str
    title: str
    description: str


@dataclass(frozen=True)
class RelatedGuide:
    slug: str
    title: str
    description: str


@dataclass(frozen=True)
class SeoPage:
    slug: str
    category_title: str
    category_anchor: str
    intro_paragraphs: Sequence[str]
    related: Sequence[RelatedCalculator]
    guides: Sequence[RelatedGuide]
    faqs: Sequence[SeoFaq]
    html: str


@dataclass(frozen=True)
class CategorySection:
    title: str
    anchor: str
    description: str
    slugs: Sequence[str]


def _clean_text(raw: str) -> str:
    text = TAG_RE.sub(" ", raw or "")
    text = unescape(text)
    return SPACE_RE.sub(" ", text).strip()


def _slugify(value: str) -> str:
    cleaned = _clean_text(value).lower()
    cleaned = re.sub(r"[^a-z0-9]+", "-", cleaned).strip("-")
    return cleaned or "calculators"


def _format_list(items: Sequence[str]) -> str:
    filtered = [item for item in items if item]
    if not filtered:
        return ""
    if len(filtered) == 1:
        return filtered[0]
    if len(filtered) == 2:
        return f"{filtered[0]} and {filtered[1]}"
    return f"{', '.join(filtered[:-1])}, and {filtered[-1]}"


def _parse_home_sections(home_html: str) -> Sequence[CategorySection]:
    matches = list(H2_RE.finditer(home_html))
    sections: List[CategorySection] = []

    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(home_html)
        section_html = home_html[start:end]
        title = _clean_text(match.group("title"))
        attrs = match.group("attrs") or ""
        anchor_match = ID_RE.search(attrs)
        anchor = anchor_match.group("id") if anchor_match else _slugify(title)
        paragraph_match = PARAGRAPH_RE.search(section_html)
        description = _clean_text(paragraph_match.group("content")) if paragraph_match else ""
        slugs: List[str] = []
        seen = set()

        for anchor_match in ANCHOR_RE.finditer(section_html):
            slug = anchor_match.group("slug")
            if slug in seen:
                continue
            seen.add(slug)
            slugs.append(slug)

        sections.append(
            CategorySection(
                title=title,
                anchor=anchor,
                description=description,
                slugs=tuple(slugs),
            )
        )

    return tuple(sections)


def _extract_labels(template_html: str) -> Sequence[str]:
    labels: List[str] = []
    seen = set()

    for match in LABEL_RE.finditer(template_html):
        attrs = match.group("attrs") or ""
        if "secondary" in attrs:
            continue
        text = _clean_text(match.group("text"))
        lowered = text.lower()
        if (
            not text
            or lowered in GENERIC_PAGE_KEYWORDS
            or len(text) <= 2
            or text in seen
        ):
            continue
        seen.add(text)
        labels.append(text)
        if len(labels) == 4:
            break

    return tuple(labels)


def _build_intro_paragraphs(page, section: CategorySection, labels: Sequence[str], related_titles: Sequence[str]) -> Sequence[str]:
    guidance = CATEGORY_GUIDANCE.get(section.anchor, CATEGORY_GUIDANCE["tools-converters"])
    label_text = _format_list(labels[:4])
    related_text = _format_list(related_titles[:3])
    category_context = (
        f" {section.description}"
        if section.description
        else ""
    )

    paragraph_one = (
        f"{page.description} This calculator is part of our {section.title.lower()} collection, "
        f"where readers compare {guidance['focus']} before making a decision.{category_context}"
    )

    if label_text:
        paragraph_two = (
            f"Start with realistic values for {label_text}. Those inputs usually carry the biggest "
            f"weight in the estimate, so it helps to change one assumption at a time and review how the output moves."
        )
    else:
        paragraph_two = (
            f"Use realistic assumptions and test one change at a time. That makes it easier to see how "
            f"{guidance['comparison']} influence the final estimate."
        )

    paragraph_three = (
        f"When you review the output, look beyond the single headline number. Compare conservative and aggressive assumptions, "
        f"because the range between those scenarios often reveals more about {guidance['outcome_focus']} than one estimate on its own."
    )

    if related_text:
        paragraph_four = (
            f"After you review the result, compare it with {related_text}. Looking at related calculators side by side "
            f"can show whether the main trade-off is {guidance['outcome_focus']}, and it gives you a better starting point for a lender conversation or financial planning decision."
        )
    else:
        paragraph_four = (
            f"After you review the result, compare best-case and conservative assumptions so you can judge "
            f"the trade-off between {guidance['outcome_focus']}, then confirm the numbers against live rates, fees, or advisor guidance before acting."
        )

    return (paragraph_one, paragraph_two, paragraph_three, paragraph_four)


def _build_faqs(page, section: CategorySection, labels: Sequence[str], related_titles: Sequence[str]) -> Sequence[SeoFaq]:
    guidance = CATEGORY_GUIDANCE.get(section.anchor, CATEGORY_GUIDANCE["tools-converters"])
    label_text = _format_list(labels[:4]) or "your main inputs"
    related_text = _format_list(related_titles[:3]) or "other calculators in the same category"

    faqs = (
        SeoFaq(
            question=f"How should I use the {page.heading}?",
            answer=(
                f"Use the {page.heading} to test realistic scenarios before you borrow, save, invest, or change a payment strategy. "
                f"Start with {label_text}, review the result, and then adjust one input at a time so you can compare the impact clearly."
            ),
        ),
        SeoFaq(
            question=f"Which inputs affect the {page.heading} the most?",
            answer=(
                f"Inputs such as {label_text} usually drive the result the most. In the {section.title.lower()} category, "
                f"small changes in {guidance['comparison']} can materially change the estimate, so it is worth testing conservative assumptions as well as optimistic ones."
            ),
        ),
        SeoFaq(
            question=f"What should I compare after using the {page.heading}?",
            answer=(
                f"Compare the result with {related_text}. That gives you better context for deciding whether your main priority is "
                f"{guidance['outcome_focus']}, rather than relying on a single estimate in isolation."
            ),
        ),
    )

    return faqs


def _build_related_calculators(slug: str, section: CategorySection, pages: Dict[str, object]) -> Sequence[RelatedCalculator]:
    related: List[RelatedCalculator] = []

    for related_slug in section.slugs:
        if related_slug == slug:
            continue
        related_page = pages.get(related_slug)
        if not related_page:
            continue
        related.append(
            RelatedCalculator(
                slug=related_slug,
                title=related_page.heading,
                description=related_page.description,
            )
        )
        if len(related) == 4:
            break

    return tuple(related)


def _build_related_from_slugs(related_slugs: Sequence[str], pages: Dict[str, object]) -> Sequence[RelatedCalculator]:
    related: List[RelatedCalculator] = []

    for related_slug in related_slugs:
        related_page = pages.get(related_slug)
        if not related_page:
            continue
        related.append(
            RelatedCalculator(
                slug=related_slug,
                title=related_page.heading,
                description=related_page.description,
            )
        )

    return tuple(related)


def _build_seo_html(page, seo_page: SeoPage) -> str:
    breadcrumb_category_href = f"/#{seo_page.category_anchor}"
    related_html = "".join(
        (
            '<li class="calc-related-item">'
            f'<a href="/{escape(item.slug)}" data-calculator="{escape(item.slug)}">'
            f'<span>{escape(item.title)}</span>'
            f'<small>{escape(item.description)}</small>'
            "</a>"
            "</li>"
        )
        for item in seo_page.related
    )
    guide_html = "".join(
        (
            '<li class="calc-related-item">'
            f'<a href="/{escape(item.slug)}" data-calculator="{escape(item.slug)}">'
            f'<span>{escape(item.title)}</span>'
            f'<small>{escape(item.description)}</small>'
            "</a>"
            "</li>"
        )
        for item in seo_page.guides
    )
    faq_accordion_id = f"calcFaqAccordion-{seo_page.slug}"
    faq_items = []

    for index, faq in enumerate(seo_page.faqs, start=1):
        heading_id = f"{faq_accordion_id}-heading-{index}"
        collapse_id = f"{faq_accordion_id}-collapse-{index}"
        faq_items.append(
            f"""
            <div class="accordion-item">
              <h2 class="accordion-header" id="{heading_id}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#{collapse_id}" aria-expanded="false" aria-controls="{collapse_id}">
                  {escape(faq.question)}
                </button>
              </h2>
              <div id="{collapse_id}" class="accordion-collapse collapse" aria-labelledby="{heading_id}" data-bs-parent="#{faq_accordion_id}">
                <div class="accordion-body calc-faq-answer">{escape(faq.answer)}</div>
              </div>
            </div>
            """.strip()
        )

    paragraphs_html = "".join(
        f"<p>{escape(paragraph)}</p>"
        for paragraph in seo_page.intro_paragraphs
    )

    sidebar_sections = []
    if related_html:
        sidebar_sections.append(
            f"""
            <section class="card calc-seo-card">
              <div class="card-body p-4">
                <h2 class="h5 mb-3">Related Calculators</h2>
                <ul class="calc-related-list list-unstyled mb-0">
                  {related_html}
                </ul>
              </div>
            </section>
            """.strip()
        )

    if guide_html:
        sidebar_sections.append(
            f"""
            <section class="card calc-seo-card">
              <div class="card-body p-4">
                <h2 class="h5 mb-3">Helpful Guides</h2>
                <ul class="calc-related-list list-unstyled mb-0">
                  {guide_html}
                </ul>
              </div>
            </section>
            """.strip()
        )

    related_section_html = ""
    if sidebar_sections:
        related_section_html = f"""
        <div class="col-12 col-xl-4">
          <div class="d-grid gap-3">
            {"".join(sidebar_sections)}
          </div>
        </div>
        """.strip()

    return f"""
    <section id="calc-seo-block" class="calc-seo-block mt-4">
      <nav aria-label="Breadcrumb" class="calc-breadcrumb mb-3">
        <ol class="breadcrumb mb-0">
          <li class="breadcrumb-item"><a href="/">Calculators</a></li>
          <li class="breadcrumb-item"><a href="{breadcrumb_category_href}">{escape(seo_page.category_title)}</a></li>
          <li class="breadcrumb-item active" aria-current="page">{escape(page.heading)}</li>
        </ol>
      </nav>

      <div class="row g-3">
        <div class="col-12 col-xl-8">
          <section class="card calc-seo-card h-100">
            <div class="card-body p-4">
              <h2 class="h4 mb-3">How to Use the {escape(page.heading)}</h2>
              <div class="calc-seo-copy">
                {paragraphs_html}
              </div>
            </div>
          </section>
        </div>
        {related_section_html}
      </div>

      <section id="calc-faq-block" class="card calc-seo-card mt-3">
        <div class="card-body p-4">
          <h2 class="h5 mb-3">Frequently Asked Questions</h2>
          <div class="accordion accordion-flush" id="{faq_accordion_id}">
            {"".join(faq_items)}
          </div>
        </div>
      </section>
    </section>
    """.strip()


def build_seo_catalog(
    pages: Dict[str, object],
    home_html: str,
    guide_map: Optional[Dict[str, Sequence[RelatedGuide]]] = None,
) -> Dict[str, SeoPage]:
    sections = _parse_home_sections(home_html)
    section_by_slug = {}

    for section in sections:
        for slug in section.slugs:
            section_by_slug[slug] = section

    seo_catalog: Dict[str, SeoPage] = {}

    for slug, page in pages.items():
        if slug == "home":
            continue
        section = section_by_slug.get(slug)
        if not section:
            continue

        labels = _extract_labels(page.body_html)
        related = _build_related_calculators(slug, section, pages)
        guides = tuple(guide_map.get(slug, ())) if guide_map else ()
        related_titles = [item.title for item in related]
        intro_paragraphs = _build_intro_paragraphs(page, section, labels, related_titles)
        faqs = _build_faqs(page, section, labels, related_titles)
        seo_page = SeoPage(
            slug=slug,
            category_title=section.title,
            category_anchor=section.anchor,
            intro_paragraphs=intro_paragraphs,
            related=related,
            guides=guides,
            faqs=faqs,
            html="",
        )
        seo_catalog[slug] = SeoPage(
            slug=seo_page.slug,
            category_title=seo_page.category_title,
            category_anchor=seo_page.category_anchor,
            intro_paragraphs=seo_page.intro_paragraphs,
            related=seo_page.related,
            guides=seo_page.guides,
            faqs=seo_page.faqs,
            html=_build_seo_html(page, seo_page),
        )

    for slug, config in COLLECTION_PAGE_CONFIGS.items():
        page = pages.get(slug)
        if not page:
            continue

        related = _build_related_from_slugs(config["related_slugs"], pages)
        guides = tuple(guide_map.get(slug, ())) if guide_map else ()
        faqs = tuple(
            SeoFaq(question=question, answer=answer)
            for question, answer in config["faqs"]
        )
        seo_page = SeoPage(
            slug=slug,
            category_title=config["category_title"],
            category_anchor=config["category_anchor"],
            intro_paragraphs=tuple(config["intro_paragraphs"]),
            related=related,
            guides=guides,
            faqs=faqs,
            html="",
        )
        seo_catalog[slug] = SeoPage(
            slug=seo_page.slug,
            category_title=seo_page.category_title,
            category_anchor=seo_page.category_anchor,
            intro_paragraphs=seo_page.intro_paragraphs,
            related=seo_page.related,
            guides=seo_page.guides,
            faqs=seo_page.faqs,
            html=_build_seo_html(page, seo_page),
        )

    return seo_catalog
