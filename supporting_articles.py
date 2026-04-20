import json
from dataclasses import dataclass
from html import escape
from typing import Dict, List, Sequence, Tuple


SITE_NAME = "Ask Mortgage Authority"
SITE_URL = "https://calculator.askmortgageauthority.com"
ARTICLE_LASTMOD = "2026-04-03"
ARTICLE_UPDATED_LABEL = "April 3, 2026"


@dataclass(frozen=True)
class ArticleSection:
    title: str
    paragraphs: Sequence[str]


@dataclass(frozen=True)
class SupportingArticleSpec:
    slug: str
    title: str
    description: str
    collection_slug: str
    calculator_slugs: Sequence[str]
    target_slugs: Sequence[str]
    key_points: Sequence[str]
    sections: Sequence[ArticleSection]


@dataclass(frozen=True)
class SupportingArticlePage:
    slug: str
    title: str
    description: str
    heading: str
    canonical: str
    body_html: str
    target_slugs: Sequence[str]


@dataclass(frozen=True)
class GuideLink:
    slug: str
    title: str
    description: str


ARTICLE_SPECS: Tuple[SupportingArticleSpec, ...] = (
    SupportingArticleSpec(
        slug="How-to-Calculate-Mortgage-Payment-with-Taxes-and-Insurance",
        title="How to Calculate Mortgage Payment With Taxes and Insurance",
        description="Understand how principal, interest, taxes, insurance, and mortgage insurance work together so your mortgage payment estimate matches the real monthly cost.",
        collection_slug="Home-Buying-Calculators",
        calculator_slugs=(
            "Financial-Calculators",
            "Closing-Costs-Calculator",
            "Loan-Affordability-Calculator",
        ),
        target_slugs=(
            "Financial-Calculators",
            "Closing-Costs-Calculator",
            "Loan-Affordability-Calculator",
            "Home-Buying-Calculators",
        ),
        key_points=(
            "Principal and interest are only one part of the real monthly payment.",
            "Property taxes, homeowners insurance, PMI, HOA dues, and escrow choices can materially change affordability.",
            "A payment estimate is only useful if it matches the costs you will actually carry each month.",
        ),
        sections=(
            ArticleSection(
                title="Start with principal and interest",
                paragraphs=(
                    "The core mortgage payment starts with loan amount, interest rate, and term. That gives you the principal-and-interest portion of the payment, which is the number people often quote first because it is easy to compare across lenders.",
                    "That number is useful, but it is incomplete for home-buying decisions. On real owner-occupied loans, the monthly obligation usually also includes property taxes and homeowners insurance through escrow, and many buyers also carry mortgage insurance for a period of time.",
                ),
            ),
            ArticleSection(
                title="Add taxes, insurance, and mortgage insurance",
                paragraphs=(
                    "Property taxes are typically quoted as an annual amount or local tax rate, then converted to a monthly escrow amount. Homeowners insurance works the same way. If your down payment is small, private mortgage insurance can add another monthly cost until the loan reaches the required equity threshold.",
                    "These line items are exactly why a payment that looks comfortable on a rate sheet can feel tight in practice. A payment comparison that ignores taxes and insurance can understate the real monthly obligation by several hundred dollars depending on property value and local tax levels.",
                ),
            ),
            ArticleSection(
                title="Do not ignore housing costs outside the note",
                paragraphs=(
                    "Escrowed items are not the only non-principal cost. HOA dues, flood insurance, and maintenance reserves are not always included in lender payment examples, but they still affect whether the home is workable for your budget.",
                    "That is why the best workflow is to estimate the all-in payment first, then compare that result with affordability and debt-to-income math. The monthly number only becomes decision-grade when it is tied back to the full cash-flow picture.",
                ),
            ),
            ArticleSection(
                title="Use the right calculator sequence",
                paragraphs=(
                    "Start with a payment calculator to estimate principal, interest, taxes, and insurance. Then use closing-cost and affordability tools to see whether the upfront cash and monthly obligation still fit together.",
                    "If the numbers are close, test a conservative case with higher taxes, higher insurance, or a small PMI buffer. It is better to discover the strain in the estimate stage than after you are comparing properties or loan offers.",
                ),
            ),
        ),
    ),
    SupportingArticleSpec(
        slug="APR-vs-Interest-Rate",
        title="APR vs Interest Rate",
        description="See why the note rate is not the same as the full borrowing cost and when APR is the better comparison metric for competing mortgage offers.",
        collection_slug="Home-Buying-Calculators",
        calculator_slugs=(
            "Annual-Percentage-Rate",
            "Loan-Points-Calculator",
            "Loan-Comparison-Calculator",
        ),
        target_slugs=(
            "Annual-Percentage-Rate",
            "Loan-Points-Calculator",
            "Loan-Comparison-Calculator",
            "Home-Buying-Calculators",
        ),
        key_points=(
            "Interest rate shows the price of borrowing on the note itself.",
            "APR rolls selected fees into the cost comparison so offers with points or lender fees are easier to compare.",
            "APR is most useful when you are comparing similar loan structures, not radically different products or time horizons.",
        ),
        sections=(
            ArticleSection(
                title="What the interest rate tells you",
                paragraphs=(
                    "The interest rate is the contractual rate used to calculate interest on the loan balance. It directly affects the principal-and-interest payment and is usually the headline number borrowers see first in ads and lender quotes.",
                    "That rate matters, but it does not capture what you paid to get the rate. If one lender charges points or larger lender fees and another does not, the same quoted rate can lead to meaningfully different borrowing costs.",
                ),
            ),
            ArticleSection(
                title="What APR is trying to solve",
                paragraphs=(
                    "APR spreads certain upfront borrowing costs across the life of the loan so offers can be compared on a more apples-to-apples basis. It is meant to answer a different question than the note rate: not just what the loan accrues at, but what the financing costs when fees are considered.",
                    "That makes APR especially useful when comparing fixed-rate loans with similar terms. If one option carries points or a heavy fee structure, APR usually makes that trade-off more visible than the note rate alone.",
                ),
            ),
            ArticleSection(
                title="Where borrowers get tripped up",
                paragraphs=(
                    "APR is not a perfect decision tool in every case. If you expect to keep the loan only a few years, the break-even on points and fees may matter more than the life-of-loan framing built into APR. If you are comparing very different loan types, the payment path and risk profile may matter more than a single summary number.",
                    "That is why APR should be used with payment, point, and horizon-based comparisons. It is one strong comparison lens, not the only lens that matters.",
                ),
            ),
            ArticleSection(
                title="How to compare offers well",
                paragraphs=(
                    "Use APR to compare fee-adjusted borrowing cost, then use a loan-comparison calculator to test monthly payment, upfront cash, and the cost over the period you realistically expect to keep the loan.",
                    "When points are involved, calculate the break-even directly. A slightly lower rate is only a win if you stay in the loan long enough for the monthly savings to recover the upfront cost.",
                ),
            ),
        ),
    ),
    SupportingArticleSpec(
        slug="When-Refinancing-Breaks-Even",
        title="When Refinancing Breaks Even",
        description="Learn how to tell whether lower monthly savings are large enough to recover refinance costs before you sell, move, or refinance again.",
        collection_slug="Refinance-Home-Equity-Calculators",
        calculator_slugs=(
            "Refinance-Break-Even",
            "Loan-Refinance-Calculator",
            "Cash-Out-Refinance-Calculator",
        ),
        target_slugs=(
            "Refinance-Break-Even",
            "Loan-Refinance-Calculator",
            "Cash-Out-Refinance-Calculator",
            "Refinance-Home-Equity-Calculators",
        ),
        key_points=(
            "Break-even is the point where monthly savings recover the upfront refinance cost.",
            "A lower rate is not automatically a win if fees are high or the reset term extends interest too far into the future.",
            "Your likely holding period matters as much as the new rate.",
        ),
        sections=(
            ArticleSection(
                title="Break-even starts with total cost, not excitement about the new rate",
                paragraphs=(
                    "Refinancing only creates value when the savings or strategic benefit exceed the costs. That means you need a clear view of lender fees, title and settlement charges, prepaid items, and any cash you are rolling into the new balance.",
                    "The cleanest first pass is to divide total refinance cost by the expected monthly savings. That gives you a rough break-even month count, which is the baseline answer to whether the move is worth pursuing at all.",
                ),
            ),
            ArticleSection(
                title="Monthly savings do not tell the full story",
                paragraphs=(
                    "A refinance can lower the payment simply by stretching the term again, even if the total interest paid over time is worse. That is why payment reduction alone is not enough. You need to compare remaining balance, new term length, total interest, and the time horizon you expect to stay in the property.",
                    "Cash-out refinances make this even more important because the new balance and costs often rise together. The question becomes whether the cash extracted or strategic use of funds justifies the new debt structure.",
                ),
            ),
            ArticleSection(
                title="The holding period is usually the deciding variable",
                paragraphs=(
                    "If you plan to move, sell, or refinance again before the break-even date, the lower rate is not doing enough work. If you expect to stay well beyond break-even, the savings may compound into a meaningful gain.",
                    "The mistake is treating refinance math as permanent when many borrowers have a short or uncertain holding period. Decision quality improves a lot when you test conservative and optimistic stay durations side by side.",
                ),
            ),
            ArticleSection(
                title="Use refinance calculators as a sequence",
                paragraphs=(
                    "Start with break-even. Then compare current-versus-new loan structure, and finally test any cash-out scenario if equity access is part of the goal.",
                    "That order keeps the refinance decision grounded in cost and timing rather than in the maximum amount you could borrow. When the cost case works first, the rest of the decision becomes much clearer.",
                ),
            ),
        ),
    ),
    SupportingArticleSpec(
        slug="Rent-vs-Buy-Framework",
        title="Rent vs Buy Framework",
        description="Use a structured framework for comparing rent, ownership costs, time horizon, and upfront cash instead of relying on one headline monthly payment.",
        collection_slug="Home-Buying-Calculators",
        calculator_slugs=(
            "Rent-Vs-Own",
            "Loan-Rent-Or-Buy-Calculator",
            "Closing-Costs-Calculator",
        ),
        target_slugs=(
            "Rent-Vs-Own",
            "Loan-Rent-Or-Buy-Calculator",
            "Closing-Costs-Calculator",
            "Home-Buying-Calculators",
        ),
        key_points=(
            "Monthly payment alone is not enough to compare renting and buying.",
            "Time horizon, closing costs, taxes, maintenance, and expected rent growth all change the outcome.",
            "A good rent-vs-buy decision compares flexibility, risk, and cash use as well as cost.",
        ),
        sections=(
            ArticleSection(
                title="Start with the monthly housing cost, then widen the frame",
                paragraphs=(
                    "Most rent-versus-buy conversations start with payment because it is the easiest number to see. That is useful, but the comparison is too narrow if it stops there. Ownership includes closing costs, taxes, insurance, maintenance, and the opportunity cost of the cash tied up in the home.",
                    "Renting has its own trade-offs: rent increases, less control, and less equity creation. The decision gets clearer when both paths are modeled with realistic recurring and one-time costs instead of only comparing rent to principal and interest.",
                ),
            ),
            ArticleSection(
                title="Time horizon changes almost everything",
                paragraphs=(
                    "The longer you expect to stay, the more likely ownership costs can be spread across enough time for buying to look stronger. A short time horizon makes selling costs and upfront cash more important and can make renting the more flexible choice even if the payment difference is not huge.",
                    "That is why rent-versus-buy comparisons should always include a planned stay duration. Without it, the model looks precise while leaving out one of the biggest drivers of the outcome.",
                ),
            ),
            ArticleSection(
                title="Do not ignore the cash question",
                paragraphs=(
                    "Buying does not just create a monthly payment. It also requires down payment funds, closing costs, reserves, and tolerance for repairs and ownership variability. That cash could have other uses, so the decision is partly about liquidity and optionality, not just monthly budget.",
                    "If buying only works by draining reserves or leaving no room for maintenance, the ownership case is weaker than a simple payment comparison suggests.",
                ),
            ),
            ArticleSection(
                title="Compare the next decision, not the perfect future",
                paragraphs=(
                    "The best rent-versus-buy model does not try to predict the market perfectly. It compares a realistic buy path and a realistic rent path using assumptions you would actually be willing to live with.",
                    "Use a rent-vs-buy calculator together with closing-cost and payment tools so the decision reflects cash to close, all-in payment, and the likely time in the property instead of a single optimistic scenario.",
                ),
            ),
        ),
    ),
    SupportingArticleSpec(
        slug="Roth-vs-Traditional-IRA-Decision-Guide",
        title="Roth vs Traditional IRA Decision Guide",
        description="Compare the tax timing, income assumptions, and retirement cash-flow trade-offs that usually matter most when choosing between a Roth IRA and a traditional IRA.",
        collection_slug="Investment-Retirement-Calculators",
        calculator_slugs=(
            "Traditional-IRA-vs-Roth-IRA",
            "Retirement-Planner",
            "Retirement-Calculator",
        ),
        target_slugs=(
            "Traditional-IRA-vs-Roth-IRA",
            "Retirement-Planner",
            "Retirement-Calculator",
            "Investment-Retirement-Calculators",
        ),
        key_points=(
            "The core choice is when you want the tax cost to land: now or later.",
            "Expected current and future tax rates matter more than generic rules of thumb.",
            "Withdrawal flexibility and income-planning strategy can be as important as the initial deduction.",
        ),
        sections=(
            ArticleSection(
                title="The real question is tax timing",
                paragraphs=(
                    "A traditional IRA generally gives you the tax benefit up front, while a Roth IRA usually asks you to pay tax now in exchange for tax-free qualified withdrawals later. Both can be useful, but they solve different planning problems.",
                    "That makes the decision less about which account is universally better and more about where you expect your tax burden to be when the money is contributed versus when it is eventually spent.",
                ),
            ),
            ArticleSection(
                title="Current versus future tax rate is the center of the decision",
                paragraphs=(
                    "If your current marginal tax rate is meaningfully higher than what you expect in retirement, a traditional IRA can be compelling because the deduction is worth more today. If you believe your future rate will be similar or higher, Roth treatment may be more attractive because the taxes are handled before the assets compound.",
                    "The hard part is that future tax rate is rarely a single number. Retirement income sources, Social Security timing, pensions, and other withdrawals all shape the real picture.",
                ),
            ),
            ArticleSection(
                title="Flexibility matters too",
                paragraphs=(
                    "Roth assets can offer more flexibility in retirement planning because qualified withdrawals are not taxed the same way as traditional IRA withdrawals. That can help when you are trying to manage taxable income across years.",
                    "Traditional balances, on the other hand, may line up better when the current-year deduction creates meaningful immediate value or cash-flow relief. The right answer is often a mix instead of an all-or-nothing choice.",
                ),
            ),
            ArticleSection(
                title="Model the contribution strategy in context",
                paragraphs=(
                    "Use an IRA comparison calculator first, then widen the view with a retirement planner. The account type decision is better when it sits inside the broader retirement income plan instead of being made in isolation.",
                    "If the outcome is close, test a split-contribution strategy. Diversifying the tax treatment of future withdrawals often gives more planning flexibility than betting everything on one tax outcome.",
                ),
            ),
        ),
    ),
    SupportingArticleSpec(
        slug="RMD-Basics",
        title="RMD Basics",
        description="Understand what required minimum distributions are, when they start to matter, and how they affect retirement cash flow and tax planning.",
        collection_slug="Investment-Retirement-Calculators",
        calculator_slugs=(
            "Required-Minimum-Distribution",
            "Retirement-Income-Analysis",
            "Retirement-Planner",
        ),
        target_slugs=(
            "Required-Minimum-Distribution",
            "Retirement-Income-Analysis",
            "Retirement-Planner",
            "Investment-Retirement-Calculators",
        ),
        key_points=(
            "RMDs force withdrawals from certain retirement accounts once the rules apply.",
            "The withdrawal amount affects taxable income and can change retirement-income planning.",
            "RMD planning belongs inside the bigger withdrawal and cash-flow strategy.",
        ),
        sections=(
            ArticleSection(
                title="What an RMD is doing",
                paragraphs=(
                    "A required minimum distribution is the minimum amount that must be withdrawn from certain retirement accounts once the rules begin to apply. The point is simple: tax-deferred money is not meant to stay sheltered forever.",
                    "The exact timing and mechanics depend on the account type and current rules, but the planning implication is consistent. Future withdrawals may be driven by regulation, not only by personal spending preference.",
                ),
            ),
            ArticleSection(
                title="Why RMDs matter before they arrive",
                paragraphs=(
                    "RMDs can change taxable income in retirement and influence how efficiently you draw down assets. Waiting until the required-distribution year to think about the issue can leave fewer options.",
                    "That is why RMD planning often sits alongside broader retirement-income modeling. The better the forecast around income needs and account balances, the easier it is to understand whether future required withdrawals could create tax pressure or cash-flow distortion.",
                ),
            ),
            ArticleSection(
                title="Account balance and timing both matter",
                paragraphs=(
                    "The larger the tax-deferred balance, the more likely RMDs become a material planning factor. They matter even more if you already expect income from Social Security, pensions, or other withdrawals because the combined income picture may not look like the early-retirement estimate people originally had in mind.",
                    "That does not automatically make RMDs a problem. It simply means the withdrawal plan should be modeled with real balances and realistic future income sources rather than left as a vague later issue.",
                ),
            ),
            ArticleSection(
                title="Model RMDs with the full retirement picture",
                paragraphs=(
                    "Use an RMD calculator for the rule-driven estimate, then compare that output with retirement-income and retirement-planning tools. The important question is not only what the minimum is, but what it does to the rest of the retirement cash-flow plan.",
                    "That approach makes it easier to decide whether the current savings mix and withdrawal assumptions still line up with the retirement lifestyle you are actually targeting.",
                ),
            ),
        ),
    ),
    SupportingArticleSpec(
        slug="How-to-Estimate-Retirement-Income-Gaps",
        title="How to Estimate Retirement Income Gaps",
        description="Estimate the gap between likely retirement income and expected spending so your retirement target is tied to cash flow rather than account balance alone.",
        collection_slug="Investment-Retirement-Calculators",
        calculator_slugs=(
            "Retirement-Income-Analysis",
            "Retirement-Planner",
            "Retirement-Savings-Analysis",
        ),
        target_slugs=(
            "Retirement-Income-Analysis",
            "Retirement-Planner",
            "Retirement-Savings-Analysis",
            "Investment-Retirement-Calculators",
        ),
        key_points=(
            "A large account balance still may not match the spending level you want in retirement.",
            "The key comparison is expected income sources versus expected spending needs.",
            "Gap analysis works best when you test conservative cases instead of a single optimistic forecast.",
        ),
        sections=(
            ArticleSection(
                title="Start with spending, not with the account balance",
                paragraphs=(
                    "Retirement planning gets distorted when the entire conversation is about how much is in the account. The more practical starting point is the monthly or annual spending level you expect to need once work income stops.",
                    "That turns the problem into a cash-flow question. You are no longer asking whether the balance looks large. You are asking whether the income it can support will actually cover the lifestyle you are planning for.",
                ),
            ),
            ArticleSection(
                title="List the income sources before the shortfall",
                paragraphs=(
                    "Estimate the retirement income sources that are likely to be available, such as Social Security, pensions, annuities, rental income, or planned portfolio withdrawals. Then compare that expected income to the spending target.",
                    "The difference between those two numbers is the income gap. That gap is often more useful than a generic savings target because it reveals the actual planning shortfall you still need to solve.",
                ),
            ),
            ArticleSection(
                title="Use conservative assumptions on returns and withdrawals",
                paragraphs=(
                    "Gap analysis can look deceptively comfortable if growth assumptions are aggressive or expenses are understated. A stronger model tests less favorable market conditions, a longer lifespan, and some flexibility in spending needs.",
                    "That does not mean the result should be pessimistic by default. It means the plan should remain workable even if returns or timing are less forgiving than the best-case path.",
                ),
            ),
            ArticleSection(
                title="Translate the gap into action",
                paragraphs=(
                    "Once you know the likely gap, the next questions become operational: save more, work longer, reduce the target spending level, delay Social Security, or adjust the asset mix. Those are better decisions when the gap is measured clearly.",
                    "Use income-analysis and retirement-planner tools together so the gap estimate feeds directly into contribution, retirement-age, and withdrawal-rate decisions instead of sitting as an abstract number.",
                ),
            ),
        ),
    ),
    SupportingArticleSpec(
        slug="IRR-vs-NPV",
        title="IRR vs NPV",
        description="Compare what internal rate of return and net present value each tell you about a project so you can use both metrics without confusing their jobs.",
        collection_slug="Investment-Retirement-Calculators",
        calculator_slugs=(
            "IRR-NPV-Calculator",
            "Return-On-Investment-ROI-Calculator",
            "Expected-Return-Calculator",
        ),
        target_slugs=(
            "IRR-NPV-Calculator",
            "Return-On-Investment-ROI-Calculator",
            "Expected-Return-Calculator",
            "Investment-Retirement-Calculators",
        ),
        key_points=(
            "IRR gives you a rate-based view of a cash-flow stream.",
            "NPV shows the dollar value created after discounting future cash flows.",
            "The metrics are related, but they answer different decision questions.",
        ),
        sections=(
            ArticleSection(
                title="What IRR is useful for",
                paragraphs=(
                    "Internal rate of return converts a stream of cash flows into an implied rate of return. That makes it intuitive when you want to compare projects on a rate basis or test whether an investment clears a required return threshold.",
                    "The appeal of IRR is that it compresses uneven cash flows into a single rate-like output. That makes cross-comparison easier, but it can also hide the absolute dollar value of the project.",
                ),
            ),
            ArticleSection(
                title="What NPV is solving",
                paragraphs=(
                    "Net present value discounts future cash flows back to today using a chosen discount rate and tells you how much value is created in present-value dollars. It is not trying to be a rate. It is trying to answer whether the project adds value after the time value of money is accounted for.",
                    "That makes NPV particularly useful when scale matters. A project with a lower-looking percentage return may still create more actual value if the cash flows are larger or better timed.",
                ),
            ),
            ArticleSection(
                title="Where the confusion shows up",
                paragraphs=(
                    "People often treat IRR as the cleaner answer because it looks like a yield, but two projects can have similar IRRs while producing very different present-value outcomes. They also forget that NPV depends on the chosen discount rate, which means it should be tied to a defensible required return.",
                    "Used poorly, each metric can mislead. Used together, they provide a much more complete picture of rate, scale, and timing.",
                ),
            ),
            ArticleSection(
                title="Use both metrics on the same cash-flow set",
                paragraphs=(
                    "A practical workflow is to calculate NPV and IRR together, then compare the result with simpler ROI or expected-return estimates only as a secondary frame. If the project does not create value at the required discount rate, a headline rate alone should not rescue it.",
                    "This is why IRR and NPV belong in the same calculator cluster. They are companion metrics, not substitutes.",
                ),
            ),
        ),
    ),
    SupportingArticleSpec(
        slug="Rule-of-72-Limitations",
        title="Rule of 72 Limitations",
        description="Learn when the Rule of 72 is useful, where it starts to drift from reality, and why it should stay a shortcut instead of a full planning method.",
        collection_slug="Investment-Retirement-Calculators",
        calculator_slugs=(
            "Rule-72-Calculator",
            "Compound-Interest-Calculator",
            "Expected-Return-Calculator",
        ),
        target_slugs=(
            "Rule-72-Calculator",
            "Compound-Interest-Calculator",
            "Expected-Return-Calculator",
            "Investment-Retirement-Calculators",
        ),
        key_points=(
            "The Rule of 72 is a shortcut for estimating doubling time.",
            "It is directionally useful, but it gets rougher at extreme rates or more complicated cash-flow assumptions.",
            "Real planning still needs compounding math, contribution assumptions, and time-horizon testing.",
        ),
        sections=(
            ArticleSection(
                title="Why the Rule of 72 is popular",
                paragraphs=(
                    "The Rule of 72 is memorable because it turns a return assumption into an approximate doubling time with almost no effort. Divide 72 by the annual rate of return, and you get a quick estimate of how long it takes money to double.",
                    "For educational purposes and fast mental math, that is genuinely useful. It helps people build intuition about how much return changes the pace of growth.",
                ),
            ),
            ArticleSection(
                title="Where the shortcut starts to drift",
                paragraphs=(
                    "The Rule of 72 is not a full compounding engine. It gets rougher at very low or very high rates, and it does not incorporate ongoing contributions, withdrawals, taxes, or uneven return paths.",
                    "That means it can be helpful for a first pass, but it should not be mistaken for a retirement projection, savings plan, or investment-decision model.",
                ),
            ),
            ArticleSection(
                title="Context matters more than the shortcut",
                paragraphs=(
                    "Two portfolios with the same assumed return can behave very differently if one includes ongoing contributions, different volatility, or a different tax structure. The Rule of 72 does not capture that context.",
                    "When the decision affects real savings targets or retirement readiness, exact compounding assumptions matter more than a quick heuristic.",
                ),
            ),
            ArticleSection(
                title="Use it as a first glance, then widen the analysis",
                paragraphs=(
                    "Start with the Rule of 72 if you want intuition. Then move to compound-interest or broader return calculators to test actual balances, contribution schedules, and realistic time horizons.",
                    "That sequence preserves the speed of the shortcut without letting it stand in for the deeper math that real planning requires.",
                ),
            ),
        ),
    ),
    SupportingArticleSpec(
        slug="Treasury-Bill-Yield-Basics",
        title="Treasury Bill Yield Basics",
        description="Understand the basic yield concepts behind Treasury bills so discount price, maturity, and annualized return are easier to interpret.",
        collection_slug="Investment-Retirement-Calculators",
        calculator_slugs=(
            "US-Treasury-Bill-Calculator",
            "Bond-Calculator",
            "Tax-Equivalent-Yield-Calculator",
        ),
        target_slugs=(
            "US-Treasury-Bill-Calculator",
            "Bond-Calculator",
            "Tax-Equivalent-Yield-Calculator",
            "Investment-Retirement-Calculators",
        ),
        key_points=(
            "Treasury bills are bought at a discount and mature at face value.",
            "Quoted yield and actual dollar earnings are related but not identical ways of viewing the return.",
            "Maturity length and comparable after-tax alternatives both matter when evaluating bill yields.",
        ),
        sections=(
            ArticleSection(
                title="Treasury bills work through discount pricing",
                paragraphs=(
                    "Treasury bills are short-term government securities that do not pay periodic coupons. Instead, they are typically purchased at a discount and mature at face value. The difference between purchase price and maturity value is the earnings component.",
                    "That structure makes bill math feel slightly different from standard bond math because the return is tied to discount price and time to maturity rather than to recurring interest payments.",
                ),
            ),
            ArticleSection(
                title="Why quoted yield can feel confusing",
                paragraphs=(
                    "People often see a quoted yield and assume it works exactly like a savings-account rate. In practice, bill returns are tied to the purchase discount and annualized over the time remaining until maturity. That means the same security can be described through price, discount, or yield-oriented lenses.",
                    "None of those views are wrong. They are just different ways of expressing the same short-term return mechanics.",
                ),
            ),
            ArticleSection(
                title="Compare maturity and alternatives, not only the headline yield",
                paragraphs=(
                    "A bill with a different maturity is not always directly comparable on the headline number alone. Time to maturity shapes liquidity and reinvestment decisions, which matters when you are using bills for cash management or short-term parking of funds.",
                    "The comparison also gets better when you test alternatives such as taxable bank yields or tax-equivalent returns. The best option is not always the one with the most attractive surface quote.",
                ),
            ),
            ArticleSection(
                title="Use calculators to turn the quote into a decision",
                paragraphs=(
                    "Start with a Treasury bill calculator to convert discount pricing into expected dollar return and annualized yield. Then compare that result with other fixed-income or tax-aware yield tools if you are deciding where short-term cash should sit.",
                    "This is the fastest way to move from a quoted rate into an actual decision about return, liquidity, and tax context.",
                ),
            ),
        ),
    ),
)


def _build_related_links(slugs: Sequence[str], pages: Dict[str, object]) -> str:
    items = []
    for slug in slugs:
        page = pages.get(slug)
        if not page:
            continue
        items.append(
            (
                '<li class="calc-related-item">'
                f'<a href="/{escape(slug)}" data-calculator="{escape(slug)}">'
                f"<span>{escape(page.heading)}</span>"
                f"<small>{escape(page.description)}</small>"
                "</a>"
                "</li>"
            )
        )
    return "".join(items)


def _build_article_schema(spec: SupportingArticleSpec, canonical: str) -> str:
    schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": spec.title,
        "description": spec.description,
        "datePublished": ARTICLE_LASTMOD,
        "dateModified": ARTICLE_LASTMOD,
        "mainEntityOfPage": canonical,
        "author": {
            "@type": "Organization",
            "name": SITE_NAME,
        },
        "publisher": {
            "@type": "Organization",
            "name": SITE_NAME,
            "logo": {
                "@type": "ImageObject",
                "url": f"{SITE_URL}/assets/logo-bg.png",
            },
        },
    }
    return json.dumps(schema, separators=(",", ":"))


def _render_article_body(spec: SupportingArticleSpec, pages: Dict[str, object]) -> str:
    collection_page = pages.get(spec.collection_slug)
    collection_title = collection_page.heading if collection_page else spec.collection_slug.replace("-", " ")
    collection_description = collection_page.description if collection_page else "Browse the matching calculator collection."
    calculator_links_html = _build_related_links(spec.calculator_slugs, pages)
    section_markup = []

    for section in spec.sections:
        paragraphs_html = "".join(
            f"<p>{escape(paragraph)}</p>"
            for paragraph in section.paragraphs
        )
        section_markup.append(
            f"""
            <section class="calc-article-section">
              <h2>{escape(section.title)}</h2>
              {paragraphs_html}
            </section>
            """.strip()
        )

    highlights_html = "".join(
        f"<li>{escape(point)}</li>"
        for point in spec.key_points
    )
    canonical = f"{SITE_URL}/{spec.slug}"
    article_schema = _build_article_schema(spec, canonical)

    return f"""
<div class="mortgage-calculators-widget-wrapper">
  <div class="container mt-4">
    <nav aria-label="Breadcrumb" class="calc-breadcrumb mb-3">
      <ol class="breadcrumb mb-0">
        <li class="breadcrumb-item"><a href="/">Calculators</a></li>
        <li class="breadcrumb-item"><a href="/{escape(spec.collection_slug)}" data-calculator="{escape(spec.collection_slug)}">{escape(collection_title)}</a></li>
        <li class="breadcrumb-item active" aria-current="page">{escape(spec.title)}</li>
      </ol>
    </nav>

    <section class="calc-article-hero">
      <span class="calc-collection-eyebrow">Supporting Guide</span>
      <div class="row g-3 align-items-end">
        <div class="col-12 col-xl-8">
          <h1 class="mb-3">{escape(spec.title)}</h1>
          <p class="calc-article-hero__copy mb-0">{escape(spec.description)}</p>
        </div>
        <div class="col-12 col-xl-4">
          <div class="calc-article-meta-card">
            <span class="calc-article-meta-card__label">Updated</span>
            <strong>{ARTICLE_UPDATED_LABEL}</strong>
          </div>
        </div>
      </div>
    </section>

    <div class="row g-3 mt-1">
      <div class="col-12 col-xl-8">
        <article class="card calc-seo-card calc-article-card h-100">
          <div class="card-body p-4 p-lg-5">
            <section class="calc-article-highlights">
              <h2 class="h5 mb-3">Key Takeaways</h2>
              <ul class="mb-0">
                {highlights_html}
              </ul>
            </section>
            {"".join(section_markup)}
            <p class="calc-article-note mb-0">These guides are educational and meant to help you frame the right comparison. Use the matching calculators to test your own numbers before making a lending, savings, or investment decision.</p>
          </div>
        </article>
      </div>

      <div class="col-12 col-xl-4">
        <div class="d-grid gap-3">
          <section class="card calc-seo-card">
            <div class="card-body p-4">
              <h2 class="h5 mb-3">Use This Guide With</h2>
              <ul class="calc-related-list list-unstyled mb-0">
                {calculator_links_html}
              </ul>
            </div>
          </section>

          <section class="card calc-seo-card">
            <div class="card-body p-4">
              <h2 class="h5 mb-3">Browse the Full Collection</h2>
              <a href="/{escape(spec.collection_slug)}" class="calc-link-card" data-calculator="{escape(spec.collection_slug)}">
                <span class="calc-link-card__title">{escape(collection_title)}</span>
                <span class="calc-link-card__copy">{escape(collection_description)}</span>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
  <script type="application/ld+json">{article_schema}</script>
</div>
""".strip()


def build_article_catalog(pages: Dict[str, object]) -> Dict[str, SupportingArticlePage]:
    article_catalog: Dict[str, SupportingArticlePage] = {}

    for spec in ARTICLE_SPECS:
        canonical = f"{SITE_URL}/{spec.slug}"
        article_catalog[spec.slug] = SupportingArticlePage(
            slug=spec.slug,
            title=f"{spec.title} | Ask Mortgage Authority",
            description=spec.description,
            heading=spec.title,
            canonical=canonical,
            body_html=_render_article_body(spec, pages),
            target_slugs=tuple(spec.target_slugs),
        )

    return article_catalog


def build_guide_map(
    article_catalog: Dict[str, SupportingArticlePage],
) -> Dict[str, Tuple[GuideLink, ...]]:
    guide_map: Dict[str, List[GuideLink]] = {}

    for article in article_catalog.values():
        guide = GuideLink(
            slug=article.slug,
            title=article.heading,
            description=article.description,
        )
        for target_slug in article.target_slugs:
            guide_map.setdefault(target_slug, []).append(guide)

    return {
        slug: tuple(links)
        for slug, links in guide_map.items()
    }
