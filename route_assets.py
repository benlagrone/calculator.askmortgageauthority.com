from __future__ import annotations

from pathlib import Path
from typing import Dict, Iterable, List, Sequence


APP_DIR = Path(__file__).resolve().parent
JS_DIR = APP_DIR / "js"

LEGACY_ROUTE_SCRIPTS: Sequence[str] = (
    "js/jquery.min.js",
    "js/utils.min.js",
    "js/countyList.min.js",
    "js/calcs.js",
)

LEGACY_SLUGS = {
    "Annual-Percentage-Rate",
    "Debt-Consolidation",
    "Early-Payoff",
    "Payment-Amortization",
    "Prepayment-Savings",
    "Rent-Vs-Own",
    "Tax-Savings",
}

SCRIPT_OVERRIDES: Dict[str, Sequence[str]] = {
    "Financial-Calculators": ("js/financial-calculator.js",),
    "Compound-Interest-Calculator": ("js/compound-interest.js",),
    "Return-On-Investment-ROI-Calculator": ("js/roi-calculator.js",),
    "Tax-Equivalent-Yield-Calculator": ("js/tax-equivalent-calculator.js",),
    "US-Health-Savings-Account-Calculator": ("js/hsa-calculator.js",),
    "Refinance-Break-Even": ("js/refinance-break-even-calculator.js",),
    "Loan-Interest-Only-Calculator": ("js/interest-only-calculator.js",),
    "Loan-Rent-Or-Buy-Calculator": (),
    "Debt-Income-Credit-Calculators": (),
    "Home-Buying-Calculators": (),
    "Refinance-Home-Equity-Calculators": (),
    "Investment-Retirement-Calculators": (),
    "Everyday-Money-Tools": (),
}


def _default_script_for_slug(slug: str) -> Sequence[str]:
    candidate = f"js/{slug.lower()}.js"
    if (JS_DIR / candidate.split("/", 1)[1]).exists():
        return (candidate,)
    return ()


def get_route_scripts(slug: str) -> Sequence[str]:
    if not slug or slug == "home":
        return ()
    if slug in LEGACY_SLUGS:
        return LEGACY_ROUTE_SCRIPTS
    if slug in SCRIPT_OVERRIDES:
        return SCRIPT_OVERRIDES[slug]
    return _default_script_for_slug(slug)


def build_route_script_manifest(slugs: Iterable[str]) -> Dict[str, List[str]]:
    return {
        slug: list(get_route_scripts(slug))
        for slug in slugs
    }
