(() => {
  const currencyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function toNumber(value) {
    if (!value) return 0;
    const cleaned = value.toString().replace(/,/g, "");
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function asCurrency(value) {
    return currencyFmt.format(Number.isFinite(value) ? value : 0);
  }

  function monthlyPayment(principal, ratePct, years) {
    const months = years * 12;
    const monthlyRate = ratePct / 100 / 12;
    if (months <= 0) return 0;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = value;
  }

  function initRefinanceBreakEven() {
    const form = document.getElementById("refinance-break-even-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("refinance-break-even-results");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const currentMonthlyPayment = toNumber(form.currentMonthlyPayment.value);
      const newLoanAmount = toNumber(form.newLoanAmount.value);
      const newInterestRate = toNumber(form.newInterestRate.value);
      const loanTerm = toNumber(form.loanTerm.value);
      const closingCosts = toNumber(form.closingCosts.value);

      const fieldChecks = [
        [form.currentMonthlyPayment, currentMonthlyPayment > 0, "Current Monthly Payment must be greater than 0."],
        [form.newLoanAmount, newLoanAmount > 0, "New Loan Amount must be greater than 0."],
        [form.newInterestRate, newInterestRate > 0, "New Interest Rate must be greater than 0."],
        [form.loanTerm, loanTerm > 0, "Loan Term must be greater than 0."],
        [form.closingCosts, closingCosts >= 0, "Closing Costs must be 0 or greater."]
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

      const newMonthlyPayment = monthlyPayment(newLoanAmount, newInterestRate, loanTerm);
      const monthlySavings = currentMonthlyPayment - newMonthlyPayment;
      const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : null;
      const firstYearSavings = monthlySavings * 12 - closingCosts;

      setText("rbe-current-payment-output", asCurrency(currentMonthlyPayment));
      setText("rbe-new-monthly-payment", asCurrency(newMonthlyPayment));
      setText("rbe-monthly-savings", asCurrency(monthlySavings));
      setText("rbe-closing-costs-output", asCurrency(closingCosts));
      setText("rbe-first-year-savings", asCurrency(firstYearSavings));
      setText(
        "rbe-break-even",
        breakEvenMonths !== null ? `${breakEvenMonths} months` : "No breakeven"
      );
      setText(
        "rbe-hero-note",
        breakEvenMonths !== null
          ? `Monthly savings of ${asCurrency(monthlySavings)} recover the closing costs in about ${breakEvenMonths} months.`
          : "The refinance does not lower the monthly payment in this scenario, so the closing costs do not break even."
      );

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "Refinance-Break-Even",
          break_even_months: breakEvenMonths,
          monthly_savings: Math.round(monthlySavings)
        });
      } else {
        resultBox.hidden = false;
      }
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (ui) {
          ui.hideResults(resultBox);
        } else {
          resultBox.hidden = true;
        }
      });
    }
  }

  document.addEventListener("calculator:loaded", (event) => {
    if (event.detail?.calculatorType === "Refinance-Break-Even") {
      initRefinanceBreakEven();
    }
  });
})();
