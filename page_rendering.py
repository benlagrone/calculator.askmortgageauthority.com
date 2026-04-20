import json
import os
import re
import time
from dataclasses import dataclass
from html import escape, unescape
from pathlib import Path
from typing import Dict, Optional
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from route_assets import build_route_script_manifest


SITE_NAME = "Ask Mortgage Authority"
SITE_URL = "https://calculator.askmortgageauthority.com"
APP_CONTENT_MARKER = '<div id="app-content" class="container"></div>'
APP_CONTENT_OPEN_TAG = '<div id="app-content" class="container">'
MAIN_JS_MARKER = '<script src="js/main.js"></script>'
LOCAL_ASSET_RE = re.compile(
    r'(?P<prefix>\b(?:src|href)=["\'])(?P<path>(?:css|js|assets)/[^"\']+)(?P<suffix>["\'])',
    re.IGNORECASE,
)
TITLE_RE = re.compile(r"<title>.*?</title>", re.IGNORECASE | re.DOTALL)
META_TITLE_RE = re.compile(
    r'<meta name="title" content=".*?">',
    re.IGNORECASE | re.DOTALL,
)
META_DESCRIPTION_RE = re.compile(
    r'<meta name="description" content=".*?">',
    re.IGNORECASE | re.DOTALL,
)
HOME_WEBPAGE_SCHEMA_RE = re.compile(
    r'\s*<script type="application/ld\+json">\s*\{.*?"@type": "WebPage".*?</script>',
    re.DOTALL,
)
FIRST_HEADING_RE = re.compile(
    r"<h(?P<level>[12])(?P<attrs>[^>]*)>(?P<content>.*?)</h[12]>",
    re.IGNORECASE | re.DOTALL,
)
DESCRIPTION_RE = re.compile(
    r'<p[^>]*class="[^"]*mortgage-calculators-widget-description[^"]*"[^>]*>(.*?)</p>',
    re.IGNORECASE | re.DOTALL,
)
GENERIC_PARAGRAPH_RE = re.compile(r"<p[^>]*>(.*?)</p>", re.IGNORECASE | re.DOTALL)
TAG_RE = re.compile(r"<[^>]+>")
MULTISPACE_RE = re.compile(r"\s+")
ASSET_RELEASE_NAME = os.getenv("CALCULATORS_RELEASE_NAME") or f"dev-{int(time.time())}"
ROUTE_SCRIPT_MANIFEST: Dict[str, list[str]] = {}


@dataclass(frozen=True)
class Page:
    slug: str
    title: str
    description: str
    canonical: str
    body_html: str
    heading: str
    is_home: bool = False


def _clean_text(raw_text: str) -> str:
    text = TAG_RE.sub(" ", raw_text or "")
    text = unescape(text)
    return MULTISPACE_RE.sub(" ", text).strip()


def _trim_description(text: str, limit: int = 160) -> str:
    if len(text) <= limit:
        return text
    clipped = text[: limit - 1].rsplit(" ", 1)[0].rstrip(" ,;:-")
    return f"{clipped}."


def _extract_heading(template_html: str, slug: str) -> str:
    match = FIRST_HEADING_RE.search(template_html)
    if match:
        heading = _clean_text(match.group("content"))
        if heading:
            return heading
    return slug.replace("-", " ")


def _extract_description(template_html: str, heading: str) -> str:
    for pattern in (DESCRIPTION_RE, GENERIC_PARAGRAPH_RE):
        match = pattern.search(template_html)
        if not match:
            continue
        description = _clean_text(match.group(1))
        if description:
            return _trim_description(description)
    return _trim_description(
        f"Use the {heading} on {SITE_NAME} to compare scenarios and estimate results."
    )


def _promote_primary_heading(template_html: str) -> str:
    match = FIRST_HEADING_RE.search(template_html)
    if not match or match.group("level") == "1":
        return template_html
    start, end = match.span()
    replacement = (
        f'<h1{match.group("attrs")}>{match.group("content")}</h1>'
    )
    return f"{template_html[:start]}{replacement}{template_html[end:]}"


def build_page_catalog(templates_dir: Path) -> Dict[str, Page]:
    pages: Dict[str, Page] = {}

    for template_path in sorted(templates_dir.glob("*.html")):
        slug = template_path.stem
        raw_html = template_path.read_text(encoding="utf-8")
        is_home = slug == "home"
        heading = _extract_heading(raw_html, slug)
        description = _extract_description(raw_html, heading)

        if is_home:
            title = "Mortgage & Financial Calculators | Ask Mortgage Authority"
            description = (
                "Use 40+ mortgage, refinance, APR, payment, retirement, and "
                "investment calculators. Fast, accurate tools by Ask Mortgage Authority."
            )
            canonical = f"{SITE_URL}/"
            body_html = raw_html
        else:
            title = f"{heading} | Ask Mortgage Authority"
            canonical = f"{SITE_URL}/{slug}"
            body_html = _promote_primary_heading(raw_html)

        pages[slug] = Page(
            slug=slug,
            title=title,
            description=description,
            canonical=canonical,
            body_html=body_html,
            heading=heading,
            is_home=is_home,
        )

    global ROUTE_SCRIPT_MANIFEST
    ROUTE_SCRIPT_MANIFEST = build_route_script_manifest(pages.keys())
    return pages


def build_not_found_page() -> Page:
    body_html = """
<div class="mortgage-calculators-widget-wrapper">
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="card border-0 shadow-sm">
          <div class="card-body p-4 p-lg-5">
            <h1 class="mb-3">Calculator page not found</h1>
            <p class="text-muted mb-4">
              The page you requested does not exist or may have moved. Start from the calculator hub to find the right tool.
            </p>
            <div class="d-flex flex-wrap gap-2">
              <a class="btn btn-primary" href="/">View calculator hub</a>
              <a class="btn btn-outline-secondary" href="/Financial-Calculators">Open loan calculator</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
""".strip()
    return Page(
        slug="",
        title="Page Not Found | Ask Mortgage Authority",
        description="The requested calculator page could not be found.",
        canonical=f"{SITE_URL}/",
        body_html=body_html,
        heading="Calculator page not found",
        is_home=False,
    )


def _replace_meta(html_text: str, title: str, description: str) -> str:
    html_text = TITLE_RE.sub(f"<title>{escape(title)}</title>", html_text, count=1)
    html_text = META_TITLE_RE.sub(
        f'<meta name="title" content="{escape(title)}">',
        html_text,
        count=1,
    )
    html_text = META_DESCRIPTION_RE.sub(
        f'<meta name="description" content="{escape(description)}">',
        html_text,
        count=1,
    )
    return html_text


def _append_release_query(asset_path: str) -> str:
    split = urlsplit(asset_path)
    query_items = [
        (key, value)
        for key, value in parse_qsl(split.query, keep_blank_values=True)
        if key != "release"
    ]
    query_items.append(("release", ASSET_RELEASE_NAME))
    return urlunsplit(
        (
            split.scheme,
            split.netloc,
            split.path,
            urlencode(query_items),
            split.fragment,
        )
    )


def _apply_asset_release_name(html_text: str) -> str:
    def replace(match: re.Match) -> str:
        return (
            f'{match.group("prefix")}'
            f'{_append_release_query(match.group("path"))}'
            f'{match.group("suffix")}'
        )

    return LOCAL_ASSET_RE.sub(replace, html_text)


def _build_page_schema(page: Page, seo_page=None) -> str:
    breadcrumb_items = [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Calculators",
            "item": f"{SITE_URL}/",
        }
    ]
    if seo_page:
        breadcrumb_items.append(
            {
                "@type": "ListItem",
                "position": 2,
                "name": seo_page.category_title,
                "item": f"{SITE_URL}/#{seo_page.category_anchor}",
            }
        )
        breadcrumb_position = 3
    else:
        breadcrumb_position = 2

    breadcrumb_items.append(
        {
            "@type": "ListItem",
            "position": breadcrumb_position,
            "name": page.heading,
            "item": page.canonical,
        }
    )

    schema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": page.heading,
        "url": page.canonical,
        "description": page.description,
        "isPartOf": {
            "@type": "WebSite",
            "name": SITE_NAME,
            "url": f"{SITE_URL}/",
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumb_items,
        },
    }
    return json.dumps(schema, separators=(",", ":"))


def _build_faq_schema(seo_page) -> str:
    schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer,
                },
            }
            for faq in seo_page.faqs
        ],
    }
    return json.dumps(schema, separators=(",", ":"))


def _append_head_extras(
    html_text: str,
    page: Page,
    initial_slug: Optional[str],
    robots: Optional[str],
    seo_page=None,
) -> str:
    extras = [
        f'<link rel="canonical" href="{escape(page.canonical)}">',
        f'<meta property="og:site_name" content="{SITE_NAME}">',
        '<meta property="og:type" content="website">',
        f'<meta property="og:title" content="{escape(page.title)}">',
        f'<meta property="og:description" content="{escape(page.description)}">',
        f'<meta property="og:url" content="{escape(page.canonical)}">',
        f'<meta property="og:image" content="{SITE_URL}/assets/logo-bg.png">',
        '<meta name="twitter:card" content="summary">',
        f'<meta name="twitter:title" content="{escape(page.title)}">',
        f'<meta name="twitter:description" content="{escape(page.description)}">',
    ]
    if robots:
        extras.append(f'<meta name="robots" content="{escape(robots)}">')
    if not page.is_home:
        extras.append(
            f'<script type="application/ld+json">{_build_page_schema(page, seo_page)}</script>'
        )
    if seo_page and seo_page.faqs:
        extras.append(
            f'<script type="application/ld+json">{_build_faq_schema(seo_page)}</script>'
        )

    extras_markup = "\n    ".join(extras)
    html_text = html_text.replace(
        "</head>",
        f"    {extras_markup}\n  </head>",
        1,
    )

    boot_script = (
        "<script>"
        f"window.__INITIAL_CALCULATOR_SLUG__ = {json.dumps(initial_slug)};"
        f"window.__CALCULATOR_ASSET_RELEASE__ = {json.dumps(ASSET_RELEASE_NAME)};"
        f"window.__CALCULATOR_SCRIPT_MANIFEST__ = {json.dumps(ROUTE_SCRIPT_MANIFEST)};"
        "</script>\n    "
        f"{MAIN_JS_MARKER}"
    )
    return html_text.replace(MAIN_JS_MARKER, boot_script, 1)


def render_page(
    shell_html: str,
    page: Page,
    initial_slug: Optional[str],
    robots: Optional[str] = None,
    seo_page=None,
) -> str:
    page_body = page.body_html
    if seo_page and getattr(seo_page, "html", ""):
        page_body = f"{page_body}\n{seo_page.html}"

    html_text = shell_html.replace(
        APP_CONTENT_MARKER,
        f'{APP_CONTENT_OPEN_TAG}{page_body}</div>',
        1,
    )
    html_text = _replace_meta(html_text, page.title, page.description)
    if not page.is_home:
        html_text = HOME_WEBPAGE_SCHEMA_RE.sub("", html_text, count=1)
    html_text = _append_head_extras(html_text, page, initial_slug, robots, seo_page)
    return _apply_asset_release_name(html_text)
