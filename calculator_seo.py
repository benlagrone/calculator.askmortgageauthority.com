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
class SeoPage:
    slug: str
    category_title: str
    category_anchor: str
    intro_paragraphs: Sequence[str]
    related: Sequence[RelatedCalculator]
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

    related_section_html = ""
    if related_html:
        related_section_html = f"""
        <div class="col-12 col-xl-4">
          <section class="card calc-seo-card h-100">
            <div class="card-body p-4">
              <h2 class="h5 mb-3">Related Calculators</h2>
              <ul class="calc-related-list list-unstyled mb-0">
                {related_html}
              </ul>
            </div>
          </section>
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


def build_seo_catalog(pages: Dict[str, object], home_html: str) -> Dict[str, SeoPage]:
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
        related_titles = [item.title for item in related]
        intro_paragraphs = _build_intro_paragraphs(page, section, labels, related_titles)
        faqs = _build_faqs(page, section, labels, related_titles)
        seo_page = SeoPage(
            slug=slug,
            category_title=section.title,
            category_anchor=section.anchor,
            intro_paragraphs=intro_paragraphs,
            related=related,
            faqs=faqs,
            html="",
        )
        seo_catalog[slug] = SeoPage(
            slug=seo_page.slug,
            category_title=seo_page.category_title,
            category_anchor=seo_page.category_anchor,
            intro_paragraphs=seo_page.intro_paragraphs,
            related=seo_page.related,
            faqs=seo_page.faqs,
            html=_build_seo_html(page, seo_page),
        )

    return seo_catalog
