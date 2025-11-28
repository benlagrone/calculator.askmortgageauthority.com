(() => {
  const iconByCalc = {
    "Financial-Calculators": "fa-solid fa-calculator",
    "Annual-Percentage-Rate": "fa-solid fa-percent",
    "Payment-Amortization": "fa-solid fa-file-invoice-dollar",
    "Early-Payoff": "fa-solid fa-clock",
    "Prepayment-Savings": "fa-solid fa-piggy-bank",
    "Refinance-Break-Even": "fa-solid fa-scale-balanced",
    "Debt-Consolidation": "fa-solid fa-scale-balanced",
    "Rent-Vs-Own": "fa-solid fa-house",
    "Loan-Rent-Or-Buy-Calculator": "fa-solid fa-house",
    "Loan-Comparison-Calculator": "fa-solid fa-right-left",
    "Loan-Refinance-Calculator": "fa-solid fa-rotate-left",
    "Commercial-Loan-Calculator": "fa-solid fa-building-columns",
    "Loan-Affordability-Calculator": "fa-solid fa-wallet",
    "Loan-Tax-Saving-Calculator": "fa-solid fa-scale-unbalanced",
    "Loan-Points-Calculator": "fa-solid fa-bullseye",
    "Adjustable-Rate-Calculator": "fa-solid fa-sliders",
    "Loan-Adjust-Vs-Fixed-Calculator": "fa-solid fa-sliders",
    "Loan-Biweekly-Calculator": "fa-solid fa-calendar-week",
    "Loan-Interest-Only-Calculator": "fa-solid fa-droplet",
    "Loan-Rental-Property-Calculator": "fa-solid fa-building",
    "Auto-Loan-Calculator": "fa-solid fa-car",
    "Auto-Lease-Calculator": "fa-solid fa-file-lines",
    "TVM-Calculator": "fa-solid fa-hourglass-half",
    "Currency-Converter": "fa-solid fa-coins",
    "Compound-Interest-Calculator": "fa-solid fa-chart-line",
    "Return-On-Investment-ROI-Calculator": "fa-solid fa-arrow-trend-up",
    "IRR-NPV-Calculator": "fa-solid fa-chart-area",
    "Bond-Calculator": "fa-solid fa-scroll",
    "Tax-Equivalent-Yield-Calculator": "fa-solid fa-scale-balanced",
    "Rule-72-Calculator": "fa-solid fa-stopwatch",
    "College-Savings-Calculator": "fa-solid fa-graduation-cap",
    "Investment-Income-Calculator": "fa-solid fa-chart-pie",
    "HSA-Calculator": "fa-solid fa-briefcase-medical",
    "Savings-Goal-Calculator": "fa-solid fa-bullseye",
    "Retirement-Planner": "fa-solid fa-clipboard-list",
    "Retirement-401k-Calculator": "fa-solid fa-building-columns",
    "Retirement-401k-Save-Max-Calculator": "fa-solid fa-chart-column",
    "Retirement-Savings-Analysis": "fa-solid fa-piggy-bank",
    "Retirement-Income-Analysis": "fa-solid fa-sack-dollar",
    "Retirement-Calculator": "fa-solid fa-umbrella-beach",
    "Traditional-IRA-vs-Roth-IRA": "fa-solid fa-scale-balanced",
    "Required-Minimum-Distribution": "fa-solid fa-file-shield",
    "Social-Security-Estimator": "fa-solid fa-id-card",
    "Asset-Allocation-Calculator": "fa-solid fa-diagram-project",
    "Annuity-Calculator": "fa-solid fa-handshake",
    "Credit-Card-Payoff-Calculator": "fa-solid fa-credit-card",
    "Credit-Card-Minimum-Payment-Calculator": "fa-regular fa-credit-card",
    "Stock-Return-Calculator": "fa-solid fa-chart-line",
    "Growth-Stock-Calculator": "fa-solid fa-rocket",
    "Non-Growth-Stock-Calculator": "fa-solid fa-coins",
    "CAPM-Calculator": "fa-solid fa-scale-balanced",
    "Expected-Return-Calculator": "fa-solid fa-chart-line",
    "Holding-Period-Return-Calculator": "fa-solid fa-stopwatch",
    "Weighted-Average-Cost-of-Capital-Calculator": "fa-solid fa-diagram-project",
    "Option-Calculator": "fa-solid fa-chart-area",
    "Tip-Calculator": "fa-solid fa-utensils",
    "Discount-Calculator": "fa-solid fa-tag",
    "Percentage-Calculator": "fa-solid fa-percent",
    "Date-Calculator": "fa-regular fa-calendar-days",
    "Unit-Conversion": "fa-solid fa-arrows-rotate",
    "US-Inflation-Calculator": "fa-solid fa-chart-column",
    "US-Treasury-Bill-Calculator": "fa-solid fa-building-columns",
    "Margin-and-Markup-Calculator": "fa-solid fa-percent",
    "Business-Forecast-Calculator": "fa-solid fa-chart-line",
    "Fuel-Calculator": "fa-solid fa-gas-pump",
    "Hourly-to-Salary-Calculator": "fa-solid fa-wallet",
    "Salary-Increase-Calculator": "fa-solid fa-arrow-up",
    "Paycheck-Calculator": "fa-solid fa-money-check-dollar",
    "Net-Distribution-Calculator": "fa-solid fa-money-bill-wave",
    "Financial-Ratios": "fa-solid fa-chart-column",
    "Loan-Calculator": "fa-solid fa-house"
  };

  const applyIcons = () => {
    const icons = document.querySelectorAll(".calc-icon");
    icons.forEach((iconEl) => {
      const calc = iconEl.closest("[data-calculator]")?.getAttribute("data-calculator");
      const iconClass = (calc && iconByCalc[calc]) || "fa-solid fa-calculator";
      iconEl.className = `calc-icon fa-3x mb-3 mx-0 p-2 ${iconClass}`;
    });
  };

  // Run immediately in case the DOM is already loaded, and re-run after template loads.
  applyIcons();
  document.addEventListener("DOMContentLoaded", applyIcons);
  document.addEventListener("calculator:loaded", applyIcons);
})();
