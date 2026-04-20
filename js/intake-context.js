(() => {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  const routeBindings = new WeakSet();
  let activeObservers = [];
  let refreshTimer = null;
  let lastSerializedContext = "";

  const JOURNEY_FIELDS = {
    purchase: [
      "estimated_home_price",
      "estimated_loan_amount",
      "monthly_housing_budget",
      "gross_income_monthly",
      "monthly_debts",
      "down_payment",
      "estimated_dti",
      "estimated_cash_to_close"
    ],
    refinance: [
      "current_loan_balance",
      "current_rate",
      "proposed_rate",
      "monthly_savings",
      "break_even_months",
      "estimated_property_value",
      "estimated_ltv"
    ],
    home_equity: [
      "estimated_property_value",
      "estimated_balance",
      "available_equity",
      "target_cash_out",
      "target_credit_line"
    ],
    debt_income_credit: [
      "gross_income_monthly",
      "monthly_housing_budget",
      "monthly_debts",
      "estimated_dti"
    ],
    general: []
  };

  const ROUTE_CONFIG = {
    "Loan-Affordability-Calculator": {
      pageKind: "calculator",
      formSelector: "#loan-affordability-form",
      resultSelector: "#loan-affordability-results",
      buildContext: buildLoanAffordabilityContext
    },
    "Debt-to-Income-Ratio-Calculator": {
      pageKind: "calculator",
      formSelector: "#dti-calculator-form",
      resultSelector: "#dti-results",
      buildContext: buildDebtToIncomeContext
    },
    "Closing-Costs-Calculator": {
      pageKind: "calculator",
      formSelector: "#closing-costs-form",
      resultSelector: "#closing-costs-results",
      buildContext: buildClosingCostsContext
    },
    "Home-Equity-Calculator": {
      pageKind: "calculator",
      formSelector: "#home-equity-form",
      resultSelector: "#home-equity-results",
      buildContext: buildHomeEquityContext
    },
    "Cash-Out-Refinance-Calculator": {
      pageKind: "calculator",
      formSelector: "#cash-out-refinance-form",
      resultSelector: "#cash-out-refinance-results",
      buildContext: buildCashOutRefinanceContext
    },
    "HELOC-Calculator": {
      pageKind: "calculator",
      formSelector: "#heloc-calculator-form",
      resultSelector: "#heloc-results",
      buildContext: buildHelocContext
    },
    "Loan-Refinance-Calculator": {
      pageKind: "calculator",
      formSelector: "#loan-refinance-form",
      resultSelector: "#loan-refinance-results",
      buildContext: buildLoanRefinanceContext
    },
    "Refinance-Break-Even": {
      pageKind: "calculator",
      formSelector: "#refinance-break-even-form",
      resultSelector: "#refinance-break-even-results",
      buildContext: buildRefinanceBreakEvenContext
    },
    "Home-Buying-Calculators": {
      pageKind: "collection",
      buildContext: (base) => buildCollectionContext(
        base,
        "purchase",
        "purchase",
        "Purchase calculator collection",
        "Use affordability, DTI, and closing-cost tools to shape a realistic home-buying budget."
      )
    },
    "Refinance-Home-Equity-Calculators": {
      pageKind: "collection",
      buildContext: (base) => buildCollectionContext(
        base,
        "general",
        "general_guidance",
        "Refinance and home-equity collection",
        "Use refinance, break-even, HELOC, and home-equity tools to compare payoff, cash-out, and payment trade-offs."
      )
    },
    "Debt-Income-Credit-Calculators": {
      pageKind: "collection",
      buildContext: (base) => buildCollectionContext(
        base,
        "debt_income_credit",
        "general_guidance",
        "Debt, income, and credit collection",
        "Use DTI, payoff, and income tools to pressure-test qualification and cash-flow assumptions."
      )
    }
  };

  function getCurrentSlug() {
    const slug = window.location.pathname.split("/").pop().replace(".html", "");
    return slug || "home";
  }

  function getConfig(slug = getCurrentSlug()) {
    return ROUTE_CONFIG[slug] || null;
  }

  function inferJourneyType(slug) {
    if (/Refinance|HELOC|Equity/i.test(slug)) return "refinance";
    if (/Income|Debt|Credit/i.test(slug)) return "debt_income_credit";
    if (/Buy|Affordability|Closing/i.test(slug)) return "purchase";
    return "general";
  }

  function getPageHeading() {
    const heading = document.querySelector("#app-content h1, #app-content h2");
    return heading ? cleanText(heading.textContent) : "";
  }

  function getPageTitle() {
    const heading = getPageHeading();
    if (heading) return heading;

    const title = cleanText(document.title).replace(/\s*\|\s*Ask Mortgage Authority\s*$/i, "");
    if (title) return title;

    const slug = getCurrentSlug();
    return slug === "home" ? "Mortgage & Financial Calculators" : slug.replace(/-/g, " ");
  }

  function cleanText(value) {
    return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  }

  function parseNumericValue(rawValue) {
    if (rawValue === null || rawValue === undefined) return null;
    if (typeof rawValue === "number") {
      return Number.isFinite(rawValue) ? rawValue : null;
    }

    const cleaned = cleanText(String(rawValue)).replace(/[$,%]/g, "").replace(/,/g, "");
    if (!cleaned || cleaned === "-" || cleaned === "." || cleaned === "-.") {
      return null;
    }

    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function parseMonthsValue(rawValue) {
    const text = cleanText(String(rawValue || ""));
    if (!text) return null;

    const match = text.match(/-?\d+(?:\.\d+)?/);
    if (!match) return null;

    const parsed = parseFloat(match[0]);
    return Number.isFinite(parsed) ? Math.ceil(parsed) : null;
  }

  function roundNumber(value, digits = 2) {
    if (!Number.isFinite(value)) return null;
    return Number(value.toFixed(digits));
  }

  function formatCurrency(value) {
    if (!Number.isFinite(value)) return null;
    return currencyFormatter.format(value);
  }

  function cloneData(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function buildJourneyFields(journeyType, partialFields = {}) {
    const fields = {};
    (JOURNEY_FIELDS[journeyType] || []).forEach((key) => {
      fields[key] = Object.prototype.hasOwnProperty.call(partialFields, key)
        ? partialFields[key]
        : null;
    });

    Object.entries(partialFields).forEach(([key, value]) => {
      fields[key] = value;
    });

    return fields;
  }

  function readField(form, fieldName, type = "number") {
    if (!form || !fieldName || !form[fieldName]) return null;
    const rawValue = form[fieldName].value;

    if (type === "string") return cleanText(rawValue);
    if (type === "boolean") return rawValue === "yes" || rawValue === "true";
    if (type === "months") return parseMonthsValue(rawValue);

    return parseNumericValue(rawValue);
  }

  function readText(selector) {
    const element = document.querySelector(selector);
    if (!element) return null;
    const text = cleanText(element.textContent);
    return text || null;
  }

  function readCurrency(selector) {
    return parseNumericValue(readText(selector));
  }

  function readPercent(selector) {
    return parseNumericValue(readText(selector));
  }

  function readMonths(selector) {
    return parseMonthsValue(readText(selector));
  }

  function readFeaturedCalculators(limit = 6) {
    return Array.from(document.querySelectorAll("#app-content a[data-calculator]"))
      .map((link) => {
        const slug = cleanText(link.getAttribute("data-calculator") || "");
        if (!slug || slug === "home") return null;

        const label = cleanText(
          link.querySelector(".calc-link-card__title, .calc-collection-card__title, .calc-link-card__copy, .calc-collection-card__copy")
            ?.textContent || link.textContent
        );

        return {
          slug,
          label: label || slug.replace(/-/g, " ")
        };
      })
      .filter(Boolean)
      .slice(0, limit);
  }

  function getResultVisibility(selector) {
    const resultElement = selector ? document.querySelector(selector) : null;
    return Boolean(resultElement && !resultElement.hidden);
  }

  function createBaseContext(slug) {
    const config = getConfig(slug);

    return {
      calculator_type: slug,
      page_kind: config?.pageKind || "page",
      page_path: window.location.pathname || "/",
      page_title: getPageTitle(),
      journey_type: inferJourneyType(slug),
      inferred_intent: "general_guidance",
      priority_route: Boolean(config),
      has_results: false,
      inputs: {},
      outputs: {},
      normalized_fields: {},
      derived_summary: {},
      timestamp: new Date().toISOString()
    };
  }

  function buildGenericContext(base) {
    return {
      ...base,
      derived_summary: {
        headline: `Viewing ${base.page_title}.`
      }
    };
  }

  function buildCollectionContext(base, journeyType, inferredIntent, headline, note) {
    const featuredCalculators = readFeaturedCalculators();

    return {
      ...base,
      journey_type: journeyType,
      inferred_intent: inferredIntent,
      outputs: {
        featured_calculators: featuredCalculators
      },
      normalized_fields: buildJourneyFields(journeyType),
      derived_summary: {
        headline,
        note,
        featured_calculators: featuredCalculators.slice(0, 4).map((item) => item.slug)
      }
    };
  }

  function buildLoanAffordabilityContext(base) {
    const form = document.querySelector("#loan-affordability-form");
    const inputs = {
      annualIncome: readField(form, "annualIncome"),
      monthlyDebts: readField(form, "monthlyDebts"),
      frontRatio: readField(form, "frontRatio"),
      backRatio: readField(form, "backRatio"),
      downPayment: readField(form, "downPayment"),
      interestRate: readField(form, "interestRate"),
      years: readField(form, "years"),
      propertyTax: readField(form, "propertyTax"),
      insurance: readField(form, "insurance"),
      hoa: readField(form, "hoa")
    };
    const outputs = {
      estimatedHomePrice: readCurrency("#la-home-price"),
      estimatedLoanAmount: readCurrency("#la-max-loan"),
      principalAndInterest: readCurrency("#la-pi"),
      estimatedPiti: readCurrency("#la-piti"),
      maxHousingPayment: readCurrency("#la-max-housing"),
      housingBudgetDetail: readText("#la-max-housing-detail")
    };
    const grossIncomeMonthly = inputs.annualIncome !== null
      ? roundNumber(inputs.annualIncome / 12, 2)
      : null;
    const estimatedDti = grossIncomeMonthly && outputs.estimatedPiti !== null
      ? roundNumber(((inputs.monthlyDebts || 0) + outputs.estimatedPiti) / grossIncomeMonthly * 100, 2)
      : null;

    return {
      ...base,
      journey_type: "purchase",
      inferred_intent: "purchase",
      has_results: getResultVisibility("#loan-affordability-results"),
      inputs,
      outputs,
      normalized_fields: buildJourneyFields("purchase", {
        estimated_home_price: outputs.estimatedHomePrice,
        estimated_loan_amount: outputs.estimatedLoanAmount,
        monthly_housing_budget: outputs.maxHousingPayment,
        gross_income_monthly: grossIncomeMonthly,
        monthly_debts: inputs.monthlyDebts,
        down_payment: inputs.downPayment,
        estimated_dti: estimatedDti,
        estimated_cash_to_close: null
      }),
      derived_summary: {
        headline: outputs.estimatedHomePrice !== null
          ? `Estimated purchase budget around ${formatCurrency(outputs.estimatedHomePrice)}.`
          : "Purchase affordability inputs are ready for chat.",
        note: outputs.estimatedPiti !== null
          ? `Estimated housing payment is about ${formatCurrency(outputs.estimatedPiti)} with ${formatCurrency(inputs.downPayment || 0)} down.`
          : "Use the calculator result to anchor the home-price range before starting prequalification.",
        key_metric_label: "estimated_home_price",
        key_metric_value: outputs.estimatedHomePrice
      }
    };
  }

  function buildDebtToIncomeContext(base) {
    const form = document.querySelector("#dti-calculator-form");
    const inputs = {
      grossMonthlyIncome: readField(form, "grossMonthlyIncome"),
      housingPayment: readField(form, "housingPayment"),
      autoLoans: readField(form, "autoLoans"),
      studentLoans: readField(form, "studentLoans"),
      creditAndPersonalLoans: readField(form, "creditAndPersonalLoans"),
      otherDebts: readField(form, "otherDebts")
    };
    const outputs = {
      backEndDti: readPercent("#dti-back-end"),
      frontEndDti: readPercent("#dti-front-end"),
      grossMonthlyIncome: readCurrency("#dti-income-output"),
      housingPayment: readCurrency("#dti-housing-output"),
      otherMonthlyDebts: readCurrency("#dti-other-output"),
      totalMonthlyDebt: readCurrency("#dti-total-debt"),
      incomeLeftAfterDebts: readCurrency("#dti-income-left"),
      roomTo36: readCurrency("#dti-room-36"),
      roomTo43: readCurrency("#dti-room-43"),
      statusText: readText("#dti-status")
    };

    return {
      ...base,
      journey_type: "debt_income_credit",
      inferred_intent: "general_guidance",
      has_results: getResultVisibility("#dti-results"),
      inputs,
      outputs,
      normalized_fields: buildJourneyFields("debt_income_credit", {
        gross_income_monthly: inputs.grossMonthlyIncome,
        monthly_housing_budget: inputs.housingPayment,
        monthly_debts: outputs.otherMonthlyDebts,
        estimated_dti: outputs.backEndDti
      }),
      derived_summary: {
        headline: outputs.backEndDti !== null
          ? `Estimated back-end DTI around ${roundNumber(outputs.backEndDti, 2)}%.`
          : "DTI inputs are ready for chat.",
        note: outputs.statusText || "Use DTI to frame qualification, debt reduction, or budget adjustments before a lender conversation.",
        key_metric_label: "estimated_dti",
        key_metric_value: outputs.backEndDti
      }
    };
  }

  function buildClosingCostsContext(base) {
    const form = document.querySelector("#closing-costs-form");
    const inputs = {
      transactionType: readField(form, "transactionType", "string"),
      propertyValue: readField(form, "propertyValue"),
      loanAmount: readField(form, "loanAmount"),
      credits: readField(form, "credits"),
      originationFees: readField(form, "originationFees"),
      appraisalFee: readField(form, "appraisalFee"),
      titleEscrowFees: readField(form, "titleEscrowFees"),
      recordingFees: readField(form, "recordingFees"),
      annualPropertyTax: readField(form, "annualPropertyTax"),
      taxMonths: readField(form, "taxMonths"),
      annualInsurance: readField(form, "annualInsurance"),
      insuranceMonths: readField(form, "insuranceMonths")
    };
    const outputs = {
      heroLabel: readText("#cc-hero-label"),
      cashToClose: readCurrency("#cc-hero-value"),
      downPayment: readCurrency("#cc-down-payment"),
      grossClosingCosts: readCurrency("#cc-gross-closing"),
      netClosingCosts: readCurrency("#cc-net-closing"),
      lenderAndSettlementFees: readCurrency("#cc-fees-total"),
      prepaids: readCurrency("#cc-prepaids"),
      creditsApplied: readCurrency("#cc-credits-output"),
      costPctOfLoan: readPercent("#cc-cost-pct"),
      estimatedLtv: readPercent("#cc-ltv"),
      statusText: readText("#cc-status")
    };
    const isPurchase = inputs.transactionType !== "refinance";

    return {
      ...base,
      journey_type: isPurchase ? "purchase" : "refinance",
      inferred_intent: isPurchase ? "purchase" : "refinance",
      has_results: getResultVisibility("#closing-costs-results"),
      inputs,
      outputs,
      normalized_fields: isPurchase
        ? buildJourneyFields("purchase", {
          estimated_home_price: inputs.propertyValue,
          estimated_loan_amount: inputs.loanAmount,
          monthly_housing_budget: null,
          gross_income_monthly: null,
          monthly_debts: null,
          down_payment: outputs.downPayment,
          estimated_dti: null,
          estimated_cash_to_close: outputs.cashToClose
        })
        : buildJourneyFields("refinance", {
          current_loan_balance: null,
          current_rate: null,
          proposed_rate: null,
          monthly_savings: null,
          break_even_months: null,
          estimated_property_value: inputs.propertyValue,
          estimated_ltv: outputs.estimatedLtv
        }),
      derived_summary: {
        headline: outputs.cashToClose !== null
          ? `${outputs.heroLabel || "Estimated cash to close"} around ${formatCurrency(outputs.cashToClose)}.`
          : "Closing-cost inputs are ready for chat.",
        note: outputs.statusText || "Use this estimate to pressure-test how much cash you need at the table before you talk to a lender.",
        key_metric_label: isPurchase ? "estimated_cash_to_close" : "estimated_ltv",
        key_metric_value: isPurchase ? outputs.cashToClose : outputs.estimatedLtv
      }
    };
  }

  function buildHomeEquityContext(base) {
    const form = document.querySelector("#home-equity-form");
    const inputs = {
      homeValue: readField(form, "homeValue"),
      firstMortgageBalance: readField(form, "firstMortgageBalance"),
      secondLienBalance: readField(form, "secondLienBalance"),
      sellingCostPct: readField(form, "sellingCostPct"),
      maxCltv: readField(form, "maxCltv")
    };
    const outputs = {
      currentEquity: readCurrency("#he-current-equity"),
      totalDebt: readCurrency("#he-total-debt"),
      currentCltv: readPercent("#he-current-cltv"),
      sellingCosts: readCurrency("#he-selling-costs-output"),
      netSaleProceeds: readCurrency("#he-net-sale-proceeds"),
      maxBorrowableBalance: readCurrency("#he-max-borrowable-balance"),
      tappableEquity: readCurrency("#he-tappable-equity"),
      equityAfterTap: readCurrency("#he-equity-after-tap"),
      maxCltvOutput: readPercent("#he-max-cltv-output"),
      statusText: readText("#he-status")
    };

    return {
      ...base,
      journey_type: "home_equity",
      inferred_intent: "general_guidance",
      has_results: getResultVisibility("#home-equity-results"),
      inputs,
      outputs,
      normalized_fields: buildJourneyFields("home_equity", {
        estimated_property_value: inputs.homeValue,
        estimated_balance: outputs.totalDebt,
        available_equity: outputs.tappableEquity,
        target_cash_out: null,
        target_credit_line: null
      }),
      derived_summary: {
        headline: outputs.tappableEquity !== null
          ? `Estimated tappable equity around ${formatCurrency(outputs.tappableEquity)}.`
          : "Home-equity inputs are ready for chat.",
        note: outputs.statusText || "Use this estimate to compare sale proceeds, HELOC capacity, or cash-out refinance headroom.",
        key_metric_label: "available_equity",
        key_metric_value: outputs.tappableEquity
      }
    };
  }

  function buildCashOutRefinanceContext(base) {
    const form = document.querySelector("#cash-out-refinance-form");
    const outputs = {
      netCash: readCurrency("#cor-net-cash"),
      currentBalance: readCurrency("#cor-current-balance-output"),
      maxLoanAmount: readCurrency("#cor-max-loan-amount"),
      currentPayment: readCurrency("#cor-current-payment"),
      newPayment: readCurrency("#cor-new-payment"),
      monthlyChange: readCurrency("#cor-monthly-change"),
      newLoanAmount: readCurrency("#cor-new-loan-amount"),
      currentLtv: readPercent("#cor-current-ltv"),
      newCltv: readPercent("#cor-new-cltv"),
      currentInterest: readCurrency("#cor-current-interest"),
      newInterest: readCurrency("#cor-new-interest"),
      interestChange: readCurrency("#cor-interest-change"),
      breakEvenMonths: readMonths("#cor-break-even"),
      breakEvenLabel: readText("#cor-break-even"),
      breakEvenNote: readText("#cor-break-even-note"),
      statusText: readText("#cor-status")
    };
    const inputs = {
      currentBalance: readField(form, "currentBalance"),
      currentRate: readField(form, "currentRate"),
      currentYears: readField(form, "currentYears"),
      currentMonths: readField(form, "currentMonths"),
      homeValue: readField(form, "homeValue"),
      desiredCashOut: readField(form, "desiredCashOut"),
      closingCosts: readField(form, "closingCosts"),
      maxCltv: readField(form, "maxCltv"),
      newRate: readField(form, "newRate"),
      newYears: readField(form, "newYears"),
      newMonths: readField(form, "newMonths"),
      financeClosingCosts: readField(form, "financeClosingCosts", "boolean")
    };
    const monthlySavings = outputs.currentPayment !== null && outputs.newPayment !== null
      ? roundNumber(outputs.currentPayment - outputs.newPayment, 2)
      : null;

    return {
      ...base,
      journey_type: "refinance",
      inferred_intent: "cash_out_refinance",
      has_results: getResultVisibility("#cash-out-refinance-results"),
      inputs,
      outputs,
      normalized_fields: buildJourneyFields("refinance", {
        current_loan_balance: inputs.currentBalance,
        current_rate: inputs.currentRate,
        proposed_rate: inputs.newRate,
        monthly_savings: monthlySavings,
        break_even_months: outputs.breakEvenMonths,
        estimated_property_value: inputs.homeValue,
        estimated_ltv: outputs.newCltv,
        target_cash_out: inputs.desiredCashOut
      }),
      derived_summary: {
        headline: outputs.netCash !== null
          ? `Estimated cash-out proceeds around ${formatCurrency(outputs.netCash)}.`
          : "Cash-out refinance inputs are ready for chat.",
        note: outputs.statusText || outputs.breakEvenNote || "Use this to compare net proceeds against the payment and interest trade-off.",
        key_metric_label: "target_cash_out",
        key_metric_value: outputs.netCash
      }
    };
  }

  function buildHelocContext(base) {
    const form = document.querySelector("#heloc-calculator-form");
    const inputs = {
      homeValue: readField(form, "homeValue"),
      mortgageBalance: readField(form, "mortgageBalance"),
      requestedLine: readField(form, "requestedLine"),
      maxCltv: readField(form, "maxCltv"),
      interestRate: readField(form, "interestRate"),
      drawYears: readField(form, "drawYears"),
      repaymentYears: readField(form, "repaymentYears")
    };
    const outputs = {
      availableLine: readCurrency("#heloc-available-line"),
      requestedOutput: readCurrency("#heloc-requested-output"),
      approvedLine: readCurrency("#heloc-approved-line"),
      drawPayment: readCurrency("#heloc-draw-payment"),
      repaymentPayment: readCurrency("#heloc-repayment-payment"),
      combinedLtv: readPercent("#heloc-combined-ltv"),
      remainingEquity: readCurrency("#heloc-remaining-equity"),
      equityCushion: readText("#heloc-equity-cushion"),
      statusText: readText("#heloc-status")
    };

    return {
      ...base,
      journey_type: "home_equity",
      inferred_intent: "heloc",
      has_results: getResultVisibility("#heloc-results"),
      inputs,
      outputs,
      normalized_fields: buildJourneyFields("home_equity", {
        estimated_property_value: inputs.homeValue,
        estimated_balance: inputs.mortgageBalance,
        available_equity: outputs.availableLine,
        target_cash_out: null,
        target_credit_line: inputs.requestedLine
      }),
      derived_summary: {
        headline: outputs.approvedLine !== null
          ? `Estimated HELOC line around ${formatCurrency(outputs.approvedLine)}.`
          : "HELOC inputs are ready for chat.",
        note: outputs.statusText || outputs.equityCushion || "Use this estimate to compare line size, CLTV, and payment impact.",
        key_metric_label: "target_credit_line",
        key_metric_value: outputs.approvedLine
      }
    };
  }

  function buildLoanRefinanceContext(base) {
    const form = document.querySelector("#loan-refinance-form");
    const inputs = {
      loanAmount: readField(form, "loanAmount"),
      paymentMade: readField(form, "paymentMade"),
      interestRate: readField(form, "interestRate"),
      years: readField(form, "years"),
      months: readField(form, "months"),
      interestRateNew: readField(form, "interestRateNew"),
      yearsNew: readField(form, "yearsNew"),
      monthsNew: readField(form, "monthsNew")
    };
    const outputs = {
      remainingCurrentBalance: readCurrency("#lr-balance-old"),
      currentMonthlyPayment: readCurrency("#lr-monthly-old"),
      remainingInterestOld: readCurrency("#lr-interest-old"),
      totalNewPayment: readCurrency("#lr-total-new"),
      newMonthlyPayment: readCurrency("#lr-monthly-new"),
      interestNew: readCurrency("#lr-interest-new"),
      interestSaved: readCurrency("#lr-saved"),
      monthlyChange: readCurrency("#lr-monthly-change"),
      monthlyChangeNote: readText("#lr-monthly-change-note"),
      heroNote: readText("#lr-hero-note")
    };
    const monthlySavings = outputs.currentMonthlyPayment !== null && outputs.newMonthlyPayment !== null
      ? roundNumber(outputs.currentMonthlyPayment - outputs.newMonthlyPayment, 2)
      : null;

    return {
      ...base,
      journey_type: "refinance",
      inferred_intent: "refinance",
      has_results: getResultVisibility("#loan-refinance-results"),
      inputs,
      outputs,
      normalized_fields: buildJourneyFields("refinance", {
        current_loan_balance: outputs.remainingCurrentBalance,
        current_rate: inputs.interestRate,
        proposed_rate: inputs.interestRateNew,
        monthly_savings: monthlySavings,
        break_even_months: null,
        estimated_property_value: null,
        estimated_ltv: null
      }),
      derived_summary: {
        headline: outputs.interestSaved !== null
          ? `Estimated refinance interest impact around ${formatCurrency(outputs.interestSaved)}.`
          : "Refinance comparison inputs are ready for chat.",
        note: outputs.heroNote || outputs.monthlyChangeNote || "Use this comparison to judge whether the lower rate offsets the new term structure.",
        key_metric_label: "monthly_savings",
        key_metric_value: monthlySavings
      }
    };
  }

  function buildRefinanceBreakEvenContext(base) {
    const form = document.querySelector("#refinance-break-even-form");
    const inputs = {
      currentMonthlyPayment: readField(form, "currentMonthlyPayment"),
      newLoanAmount: readField(form, "newLoanAmount"),
      newInterestRate: readField(form, "newInterestRate"),
      loanTerm: readField(form, "loanTerm"),
      closingCosts: readField(form, "closingCosts")
    };
    const outputs = {
      breakEvenMonths: readMonths("#rbe-break-even"),
      breakEvenLabel: readText("#rbe-break-even"),
      currentMonthlyPayment: readCurrency("#rbe-current-payment-output"),
      newMonthlyPayment: readCurrency("#rbe-new-monthly-payment"),
      monthlySavings: readCurrency("#rbe-monthly-savings"),
      closingCosts: readCurrency("#rbe-closing-costs-output"),
      firstYearSavings: readCurrency("#rbe-first-year-savings"),
      heroNote: readText("#rbe-hero-note")
    };

    return {
      ...base,
      journey_type: "refinance",
      inferred_intent: "refinance",
      has_results: getResultVisibility("#refinance-break-even-results"),
      inputs,
      outputs,
      normalized_fields: buildJourneyFields("refinance", {
        current_loan_balance: null,
        current_rate: null,
        proposed_rate: inputs.newInterestRate,
        monthly_savings: outputs.monthlySavings,
        break_even_months: outputs.breakEvenMonths,
        estimated_property_value: null,
        estimated_ltv: null
      }),
      derived_summary: {
        headline: outputs.breakEvenLabel
          ? `Estimated refinance break-even: ${outputs.breakEvenLabel}.`
          : "Refinance break-even inputs are ready for chat.",
        note: outputs.heroNote || "Use the break-even timeline to decide whether the refinance still makes sense for your expected holding period.",
        key_metric_label: "break_even_months",
        key_metric_value: outputs.breakEvenMonths
      }
    };
  }

  function buildContextForSlug(slug) {
    const base = createBaseContext(slug);
    const config = getConfig(slug);
    const context = config?.buildContext ? config.buildContext(base) : buildGenericContext(base);

    return {
      ...context,
      page_path: window.location.pathname || "/",
      page_title: getPageTitle(),
      timestamp: new Date().toISOString()
    };
  }

  function disconnectObservers() {
    activeObservers.forEach((observer) => observer.disconnect());
    activeObservers = [];
  }

  function observeElement(element) {
    if (!element) return;

    const observer = new MutationObserver(() => {
      scheduleRefresh("dom-mutation");
    });

    observer.observe(element, {
      attributes: true,
      attributeFilter: ["hidden", "class"],
      childList: true,
      subtree: true,
      characterData: true
    });

    activeObservers.push(observer);
  }

  function bindRouteInteractions(slug) {
    disconnectObservers();

    const config = getConfig(slug);
    if (!config) return;

    const form = config.formSelector ? document.querySelector(config.formSelector) : null;
    const resultElement = config.resultSelector ? document.querySelector(config.resultSelector) : null;

    if (form && !routeBindings.has(form)) {
      routeBindings.add(form);
      form.addEventListener("input", () => scheduleRefresh("form-input"));
      form.addEventListener("change", () => scheduleRefresh("form-change"));
      form.addEventListener("submit", () => scheduleRefresh("form-submit"));
      form.addEventListener("reset", () => scheduleRefresh("form-reset"));
    }

    observeElement(document.getElementById("app-content"));
    observeElement(resultElement);
  }

  function updateStoredContext(context, reason) {
    const serialized = JSON.stringify(context);
    if (serialized === lastSerializedContext) {
      return cloneData(window.__AMA_INTAKE_CONTEXT__ || context);
    }

    lastSerializedContext = serialized;
    window.__AMA_INTAKE_CONTEXT__ = cloneData(context);
    document.dispatchEvent(new CustomEvent("ama:intake-context-updated", {
      detail: {
        reason,
        context: cloneData(window.__AMA_INTAKE_CONTEXT__),
        message: {
          type: "ama:set-context",
          context: cloneData(window.__AMA_INTAKE_CONTEXT__)
        }
      }
    }));

    return cloneData(window.__AMA_INTAKE_CONTEXT__);
  }

  function refreshContext(reason = "manual") {
    const slug = getCurrentSlug();
    const context = buildContextForSlug(slug);
    return updateStoredContext(context, reason);
  }

  function scheduleRefresh(reason = "scheduled") {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      refreshContext(reason);
    }, 60);
  }

  document.addEventListener("calculator:loaded", (event) => {
    const slug = event.detail?.calculatorType || getCurrentSlug();
    bindRouteInteractions(slug);
    scheduleRefresh("calculator-loaded");
  });

  document.addEventListener("DOMContentLoaded", () => {
    bindRouteInteractions(getCurrentSlug());
    scheduleRefresh("dom-content-loaded");
  });

  window.IntakeContext = {
    buildMessage(type = "ama:set-context") {
      const context = cloneData(window.__AMA_INTAKE_CONTEXT__ || buildContextForSlug(getCurrentSlug()));
      return { type, context };
    },
    getCurrentContext() {
      return cloneData(window.__AMA_INTAKE_CONTEXT__ || buildContextForSlug(getCurrentSlug()));
    },
    getRouteConfig(slug = getCurrentSlug()) {
      return getConfig(slug);
    },
    isPriorityRoute(slug = getCurrentSlug()) {
      return Boolean(getConfig(slug));
    },
    refresh(reason = "manual") {
      return refreshContext(reason);
    }
  };
})();
