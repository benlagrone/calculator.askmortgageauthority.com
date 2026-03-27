(() => {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function parseNumber(value) {
    if (!value) return 0;
    const cleaned = value.toString().replace(/,/g, "");
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatCurrency(value) {
    return currencyFormatter.format(Number.isFinite(value) ? value : 0);
  }

  function formatYears(value) {
    const years = Number.isFinite(value) ? value : 0;
    return `${years.toFixed(years % 1 === 0 ? 0 : 1)} years`;
  }

  function monthlyPayment(principal, annualRatePct, years) {
    const months = Math.round(years * 12);
    const monthlyRate = annualRatePct / 100 / 12;

    if (months <= 0 || principal <= 0) {
      return 0;
    }

    if (monthlyRate === 0) {
      return principal / months;
    }

    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  function buildScenario({ amount, annualRatePct, years, upfrontCosts, horizonYears }) {
    const totalMonths = Math.round(years * 12);
    const horizonMonths = Math.min(totalMonths, Math.round(horizonYears * 12));
    const monthly = monthlyPayment(amount, annualRatePct, years);
    const monthlyRate = annualRatePct / 100 / 12;
    let balance = amount;
    let horizonInterest = 0;

    for (let month = 0; month < horizonMonths; month += 1) {
      if (balance <= 0) {
        break;
      }

      const interestPortion = monthlyRate === 0 ? 0 : balance * monthlyRate;
      const principalPortion = Math.min(balance, monthly - interestPortion);

      horizonInterest += interestPortion;
      balance -= principalPortion;
    }

    const totalPayment = monthly * totalMonths;
    const totalInterest = Math.max(0, totalPayment - amount);

    return {
      amount,
      annualRatePct,
      years,
      upfrontCosts,
      monthly,
      totalInterest,
      totalPayment,
      horizonInterest,
      horizonCost: horizonInterest + upfrontCosts,
      lifetimeCost: totalInterest + upfrontCosts
    };
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
  }

  function compareMetric(a, b, epsilon = 0.01) {
    if (Math.abs(a - b) <= epsilon) {
      return { winner: "Tie", diff: 0 };
    }

    if (a < b) {
      return { winner: "Loan A", diff: b - a };
    }

    return { winner: "Loan B", diff: a - b };
  }

  function setStatus(statusEl, type, text) {
    if (!statusEl) return;
    statusEl.className = `calc-results-status ${type}`;
    statusEl.textContent = text;
  }

  function initLoanComparison() {
    const form = document.getElementById("loan-comparison-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("loan-comparison-results");
    const statusEl = document.getElementById("lc-status");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const horizonYears = parseNumber(form.comparisonHorizon.value);
      const amount1 = parseNumber(form.loanAmount1.value);
      const rate1 = parseNumber(form.interestRate1.value);
      const years1 = parseNumber(form.years1.value);
      const fees1 = parseNumber(form.upfrontCosts1.value);
      const amount2 = parseNumber(form.loanAmount2.value);
      const rate2 = parseNumber(form.interestRate2.value);
      const years2 = parseNumber(form.years2.value);
      const fees2 = parseNumber(form.upfrontCosts2.value);

      const fieldChecks = [
        [form.comparisonHorizon, horizonYears > 0 && horizonYears <= 50, "Comparison Horizon must be between 0 and 50 years."],
        [form.loanAmount1, amount1 > 0, "Loan Amount for Loan A must be greater than 0."],
        [form.interestRate1, rate1 >= 0 && rate1 <= 100, "Interest Rate for Loan A must be between 0 and 100."],
        [form.years1, years1 > 0 && years1 <= 50, "Loan Term for Loan A must be between 0 and 50 years."],
        [form.upfrontCosts1, fees1 >= 0, "Upfront Costs for Loan A must be 0 or greater."],
        [form.loanAmount2, amount2 > 0, "Loan Amount for Loan B must be greater than 0."],
        [form.interestRate2, rate2 >= 0 && rate2 <= 100, "Interest Rate for Loan B must be between 0 and 100."],
        [form.years2, years2 > 0 && years2 <= 50, "Loan Term for Loan B must be between 0 and 50 years."],
        [form.upfrontCosts2, fees2 >= 0, "Upfront Costs for Loan B must be 0 or greater."]
      ];

      let firstInvalidField = null;
      fieldChecks.forEach(([field, isValid, message]) => {
        if (isValid) {
          ui?.clearFieldError(field);
          ui?.markFieldValid(field);
          return;
        }

        ui?.showFieldError(field, message);
        firstInvalidField = firstInvalidField || field;
      });

      if (firstInvalidField) {
        firstInvalidField.focus();
        ui?.hideResults(resultBox);
        return;
      }

      const loanA = buildScenario({
        amount: amount1,
        annualRatePct: rate1,
        years: years1,
        upfrontCosts: fees1,
        horizonYears
      });

      const loanB = buildScenario({
        amount: amount2,
        annualRatePct: rate2,
        years: years2,
        upfrontCosts: fees2,
        horizonYears
      });

      const monthlyResult = compareMetric(loanA.monthly, loanB.monthly);
      const horizonResult = compareMetric(loanA.horizonCost, loanB.horizonCost);
      const lifetimeResult = compareMetric(loanA.lifetimeCost, loanB.lifetimeCost);

      const heroText = monthlyResult.winner === "Tie"
        ? "Tie on monthly payment"
        : `${monthlyResult.winner} saves ${formatCurrency(monthlyResult.diff)}/mo`;

      let statusType = "is-fit";
      let statusText = `${monthlyResult.winner} has the better monthly payment profile.`;

      if (monthlyResult.winner === "Tie" && horizonResult.winner === "Tie" && lifetimeResult.winner === "Tie") {
        statusType = "is-tight";
        statusText = "Both loan scenarios are effectively identical on payment and cost.";
      } else if (
        monthlyResult.winner !== "Tie" &&
        horizonResult.winner !== "Tie" &&
        lifetimeResult.winner !== "Tie" &&
        monthlyResult.winner === horizonResult.winner &&
        monthlyResult.winner === lifetimeResult.winner
      ) {
        statusType = "is-fit";
        statusText = `${monthlyResult.winner} wins on monthly payment, short-term cost, and lifetime cost.`;
      } else {
        statusType = "is-tight";
        statusText = `${monthlyResult.winner === "Tie" ? "The loans tie on payment" : `${monthlyResult.winner} lowers the monthly payment`}, but review the short-term and lifetime cost tradeoff below.`;
      }

      setText("lc-hero", heroText);
      setStatus(statusEl, statusType, statusText);

      setText("lc-monthly-diff", monthlyResult.winner === "Tie" ? "Tie" : formatCurrency(monthlyResult.diff));
      setText(
        "lc-monthly-diff-note",
        monthlyResult.winner === "Tie"
          ? "Both options produce nearly the same principal-and-interest payment."
          : `${monthlyResult.winner} has the lower monthly principal-and-interest payment.`
      );

      setText("lc-horizon-winner", horizonResult.winner);
      setText(
        "lc-horizon-note",
        horizonResult.winner === "Tie"
          ? `Both loans cost about the same over the first ${horizonYears} years.`
          : `${horizonResult.winner} saves ${formatCurrency(horizonResult.diff)} in interest and fees over the first ${horizonYears} years.`
      );

      setText("lc-lifetime-winner", lifetimeResult.winner);
      setText(
        "lc-lifetime-note",
        lifetimeResult.winner === "Tie"
          ? "Both loans have nearly the same lifetime interest and fee cost."
          : `${lifetimeResult.winner} saves ${formatCurrency(lifetimeResult.diff)} in lifetime interest and fees.`
      );

      setText("lc-title1", `${formatCurrency(amount1)} at ${rate1.toFixed(2)}%`);
      setText("lc-title2", `${formatCurrency(amount2)} at ${rate2.toFixed(2)}%`);

      setText("lc-monthly1", formatCurrency(loanA.monthly));
      setText("lc-monthly2", formatCurrency(loanB.monthly));
      setText("lc-fees-output1", formatCurrency(fees1));
      setText("lc-fees-output2", formatCurrency(fees2));
      setText("lc-horizon-cost1", formatCurrency(loanA.horizonCost));
      setText("lc-horizon-cost2", formatCurrency(loanB.horizonCost));
      setText("lc-interest1", formatCurrency(loanA.totalInterest));
      setText("lc-interest2", formatCurrency(loanB.totalInterest));
      setText("lc-total-cost1", formatCurrency(loanA.lifetimeCost));
      setText("lc-total-cost2", formatCurrency(loanB.lifetimeCost));
      setText("lc-term-output1", formatYears(years1));
      setText("lc-term-output2", formatYears(years2));

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "Loan-Comparison-Calculator",
          monthly_winner: monthlyResult.winner,
          short_term_winner: horizonResult.winner,
          lifetime_winner: lifetimeResult.winner,
          monthly_difference: Math.round(monthlyResult.diff),
          short_term_difference: Math.round(horizonResult.diff),
          lifetime_difference: Math.round(lifetimeResult.diff)
        });
      } else {
        resultBox.hidden = false;
      }
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (statusEl) {
          statusEl.textContent = "";
          statusEl.className = "calc-results-status";
        }

        if (ui) {
          ui.hideResults(resultBox);
        } else {
          resultBox.hidden = true;
        }
      });
    }
  }

  document.addEventListener("calculator:loaded", (event) => {
    if (event.detail?.calculatorType === "Loan-Comparison-Calculator") {
      initLoanComparison();
    }
  });
})();
