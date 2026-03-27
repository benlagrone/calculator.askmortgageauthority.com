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

  function formatPercent(value) {
    const safeValue = Number.isFinite(value) ? value : 0;
    return `${safeValue.toFixed(2)}%`;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = value;
  }

  function setStatus(statusEl, type, text) {
    if (!statusEl) return;
    statusEl.className = `calc-results-status ${type}`;
    statusEl.textContent = text;
  }

  function initClosingCostsCalculator() {
    const form = document.getElementById("closing-costs-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("closing-costs-results");
    const statusEl = document.getElementById("cc-status");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const transactionType = form.transactionType.value;
      const propertyValue = parseNumber(form.propertyValue.value);
      const loanAmount = parseNumber(form.loanAmount.value);
      const credits = parseNumber(form.credits.value);
      const originationFees = parseNumber(form.originationFees.value);
      const appraisalFee = parseNumber(form.appraisalFee.value);
      const titleEscrowFees = parseNumber(form.titleEscrowFees.value);
      const recordingFees = parseNumber(form.recordingFees.value);
      const annualPropertyTax = parseNumber(form.annualPropertyTax.value);
      const taxMonths = parseNumber(form.taxMonths.value);
      const annualInsurance = parseNumber(form.annualInsurance.value);
      const insuranceMonths = parseNumber(form.insuranceMonths.value);

      const fieldChecks = [
        [form.transactionType, !!transactionType, "Transaction Type is required."],
        [form.propertyValue, propertyValue > 0, "Home Price or Appraised Value must be greater than 0."],
        [form.loanAmount, loanAmount > 0, "Loan Amount must be greater than 0."],
        [form.credits, credits >= 0, "Seller or Lender Credits must be 0 or greater."],
        [form.originationFees, originationFees >= 0, "Origination and Underwriting Fees must be 0 or greater."],
        [form.appraisalFee, appraisalFee >= 0, "Appraisal Fee must be 0 or greater."],
        [form.titleEscrowFees, titleEscrowFees >= 0, "Title and Escrow Fees must be 0 or greater."],
        [form.recordingFees, recordingFees >= 0, "Recording and Miscellaneous Fees must be 0 or greater."],
        [form.annualPropertyTax, annualPropertyTax >= 0, "Annual Property Tax must be 0 or greater."],
        [form.taxMonths, taxMonths >= 0 && taxMonths <= 12, "Prepaid Tax Months must be between 0 and 12."],
        [form.annualInsurance, annualInsurance >= 0, "Annual Homeowners Insurance must be 0 or greater."],
        [form.insuranceMonths, insuranceMonths >= 0 && insuranceMonths <= 12, "Prepaid Insurance Months must be between 0 and 12."]
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

      if (transactionType === "purchase" && loanAmount > propertyValue) {
        ui?.showFormError(
          form,
          "For a purchase estimate, the loan amount cannot exceed the home price. Lower the loan amount or update the purchase price."
        );
        ui?.hideResults(resultBox);
        return;
      }

      const lenderAndSettlementFees =
        originationFees + appraisalFee + titleEscrowFees + recordingFees;
      const prepaidTaxes = (annualPropertyTax / 12) * taxMonths;
      const prepaidInsurance = (annualInsurance / 12) * insuranceMonths;
      const prepaids = prepaidTaxes + prepaidInsurance;
      const grossClosingCosts = lenderAndSettlementFees + prepaids;
      const netClosingCosts = Math.max(0, grossClosingCosts - credits);
      const downPayment =
        transactionType === "purchase" ? Math.max(0, propertyValue - loanAmount) : 0;
      const cashToClose = transactionType === "purchase"
        ? downPayment + netClosingCosts
        : netClosingCosts;
      const costPctOfLoan = loanAmount > 0 ? (netClosingCosts / loanAmount) * 100 : 0;
      const ltv = propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;

      setText(
        "cc-hero-label",
        transactionType === "purchase"
          ? "Estimated cash to close"
          : "Estimated net costs due at closing"
      );
      setText("cc-hero-value", formatCurrency(cashToClose));
      setText("cc-down-payment", formatCurrency(downPayment));
      setText(
        "cc-down-payment-note",
        transactionType === "purchase"
          ? "Based on purchase price minus loan amount."
          : "Refinance estimate assumes no down payment."
      );
      setText("cc-gross-closing", formatCurrency(grossClosingCosts));
      setText("cc-net-closing", formatCurrency(netClosingCosts));
      setText("cc-fees-total", formatCurrency(lenderAndSettlementFees));
      setText("cc-prepaids", formatCurrency(prepaids));
      setText("cc-credits-output", formatCurrency(credits));
      setText("cc-cost-pct", formatPercent(costPctOfLoan));
      setText("cc-ltv", formatPercent(ltv));

      if (credits >= grossClosingCosts && grossClosingCosts > 0) {
        setStatus(
          statusEl,
          "is-fit",
          "Credits fully offset the estimated closing costs in this scenario."
        );
      } else if (transactionType === "purchase") {
        setStatus(
          statusEl,
          "is-fit",
          `${formatCurrency(downPayment)} down payment plus ${formatCurrency(netClosingCosts)} in net closing costs produces an estimated cash to close of ${formatCurrency(cashToClose)}.`
        );
      } else {
        setStatus(
          statusEl,
          "is-tight",
          `This refinance estimate assumes the ${formatCurrency(netClosingCosts)} in net closing costs is paid out of pocket at closing rather than rolled into the new loan.`
        );
      }

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "Closing-Costs-Calculator",
          transaction_type: transactionType,
          gross_closing_costs: Math.round(grossClosingCosts),
          net_closing_costs: Math.round(netClosingCosts),
          cash_to_close: Math.round(cashToClose)
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
    if (event.detail?.calculatorType === "Closing-Costs-Calculator") {
      initClosingCostsCalculator();
    }
  });
})();
