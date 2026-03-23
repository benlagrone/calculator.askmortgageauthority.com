(() => {
  const currencyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const toNumber = (value) => {
    if (!value) return 0;
    const cleaned = value.toString().replace(/,/g, "");
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const asCurrency = (value) => currencyFmt.format(Number.isFinite(value) ? value : 0);

  function monthlyPayment(principal, annualRatePct, termYears) {
    const months = termYears * 12;
    const monthlyRate = annualRatePct / 100 / 12;
    if (months <= 0) return 0;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = value;
  }

  function initLoanPoints() {
    const form = document.getElementById("loan-points-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("loan-points-results");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const loanAmount = toNumber(form.loanAmount.value);
      const years = toNumber(form.years.value);
      const rateBase = toNumber(form.rateBase.value);
      const ratePoints = toNumber(form.ratePoints.value);
      const pointsPct = toNumber(form.pointsPct.value);
      const closingCosts = toNumber(form.closingCosts.value);

      const fieldChecks = [
        [form.loanAmount, loanAmount > 0, "Loan Amount must be greater than 0."],
        [form.years, years > 0, "Loan Term must be greater than 0."],
        [form.rateBase, rateBase > 0, "Rate Without Points must be greater than 0."],
        [form.ratePoints, ratePoints > 0, "Rate With Points must be greater than 0."],
        [form.pointsPct, pointsPct >= 0, "Points must be 0 or greater."],
        [form.closingCosts, closingCosts >= 0, "Other Closing Costs must be 0 or greater."]
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

      if (ratePoints >= rateBase) {
        ui?.showFieldError(
          form.ratePoints,
          "Rate With Points should be lower than the rate without points for this comparison."
        );
        firstInvalidField = firstInvalidField || form.ratePoints;
      }

      if (firstInvalidField) {
        firstInvalidField.focus();
        ui?.hideResults(resultBox);
        return;
      }

      const pointsCost = loanAmount * (pointsPct / 100) + closingCosts;
      const paymentBase = monthlyPayment(loanAmount, rateBase, years);
      const paymentPoints = monthlyPayment(loanAmount, ratePoints, years);
      const totalBase = paymentBase * years * 12;
      const totalPoints = paymentPoints * years * 12;
      const interestBase = totalBase - loanAmount;
      const interestPoints = totalPoints - loanAmount + pointsCost;
      const monthlySavings = paymentBase - paymentPoints;
      const breakevenMonths = monthlySavings > 0 ? pointsCost / monthlySavings : null;

      setText("lp-points-cost", asCurrency(pointsCost));
      setText("lp-monthly-base", asCurrency(paymentBase));
      setText("lp-monthly-points", asCurrency(paymentPoints));
      setText("lp-monthly-savings", asCurrency(monthlySavings));
      setText("lp-interest-base", asCurrency(interestBase));
      setText("lp-interest-points", asCurrency(interestPoints));
      setText(
        "lp-breakeven",
        breakevenMonths !== null ? `${breakevenMonths.toFixed(1)} months` : "No breakeven"
      );
      setText(
        "lp-hero-note",
        breakevenMonths !== null
          ? `The lower rate saves about ${asCurrency(monthlySavings)} per month, which offsets the upfront points cost in roughly ${breakevenMonths.toFixed(1)} months.`
          : "The rate reduction does not create monthly savings in this scenario, so the upfront points cost does not break even."
      );

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "Loan-Points-Calculator",
          breakeven_months:
            breakevenMonths !== null ? Number(breakevenMonths.toFixed(1)) : null,
          points_cost: Math.round(pointsCost)
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
    if (event.detail?.calculatorType === "Loan-Points-Calculator") {
      initLoanPoints();
    }
  });
})();
