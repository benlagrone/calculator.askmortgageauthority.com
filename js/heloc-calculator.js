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
    return `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;
  }

  function monthlyPayment(principal, annualRatePct, years) {
    const months = years * 12;
    const monthlyRate = annualRatePct / 100 / 12;
    if (months <= 0 || principal <= 0) {
      return 0;
    }
    if (monthlyRate === 0) {
      return principal / months;
    }
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
  }

  function setStatus(statusEl, type, text) {
    if (!statusEl) return;
    statusEl.className = `calc-results-status ${type}`;
    statusEl.textContent = text;
  }

  function initHelocCalculator() {
    const form = document.getElementById("heloc-calculator-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("heloc-results");
    const statusEl = document.getElementById("heloc-status");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const homeValue = parseNumber(form.homeValue.value);
      const mortgageBalance = parseNumber(form.mortgageBalance.value);
      const requestedLine = parseNumber(form.requestedLine.value);
      const maxCltv = parseNumber(form.maxCltv.value);
      const interestRate = parseNumber(form.interestRate.value);
      const drawYears = parseNumber(form.drawYears.value);
      const repaymentYears = parseNumber(form.repaymentYears.value);

      const fieldChecks = [
        [form.homeValue, homeValue > 0, "Current Home Value must be greater than 0."],
        [form.mortgageBalance, mortgageBalance >= 0, "Current Mortgage Balance must be 0 or greater."],
        [form.requestedLine, requestedLine > 0, "Requested HELOC Line must be greater than 0."],
        [form.maxCltv, maxCltv > 0 && maxCltv <= 100, "Max Combined LTV must be between 0 and 100."],
        [form.interestRate, interestRate > 0, "Estimated HELOC Rate must be greater than 0."],
        [form.drawYears, drawYears > 0, "Draw Period must be greater than 0."],
        [form.repaymentYears, repaymentYears > 0, "Repayment Period must be greater than 0."]
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

      if (mortgageBalance >= homeValue) {
        ui?.showFormError(
          form,
          "The current mortgage balance is greater than or equal to the home value. Update the property value or balance to estimate a HELOC."
        );
        ui?.hideResults(resultBox);
        return;
      }

      const maxCombinedBalance = homeValue * (maxCltv / 100);
      const availableLine = Math.max(0, maxCombinedBalance - mortgageBalance);

      if (availableLine <= 0) {
        ui?.showFormError(
          form,
          "At the selected combined LTV limit, there is no remaining equity available for a HELOC."
        );
        ui?.hideResults(resultBox);
        return;
      }

      const approvedLine = Math.min(requestedLine, availableLine);
      const combinedBalance = mortgageBalance + approvedLine;
      const combinedLtv = (combinedBalance / homeValue) * 100;
      const remainingEquity = Math.max(0, homeValue - combinedBalance);
      const unusedCapacity = Math.max(0, availableLine - approvedLine);
      const excessRequest = Math.max(0, requestedLine - availableLine);
      const drawPayment = approvedLine * (interestRate / 100 / 12);
      const repaymentPayment = monthlyPayment(approvedLine, interestRate, repaymentYears);

      setText("heloc-available-line", formatCurrency(availableLine));
      setText("heloc-requested-output", formatCurrency(requestedLine));
      setText("heloc-approved-line", formatCurrency(approvedLine));
      setText("heloc-draw-payment", formatCurrency(drawPayment));
      setText("heloc-repayment-payment", formatCurrency(repaymentPayment));
      setText("heloc-combined-ltv", formatPercent(combinedLtv));
      setText("heloc-remaining-equity", formatCurrency(remainingEquity));
      setText(
        "heloc-equity-cushion",
        unusedCapacity > 0
          ? `${formatCurrency(unusedCapacity)} of borrowing capacity remains under the selected CLTV limit.`
          : "This estimate uses the full available line under the selected CLTV limit."
      );

      if (excessRequest > 0) {
        setStatus(
          statusEl,
          "is-over",
          `Requested line exceeds the estimated limit by ${formatCurrency(excessRequest)}.`
        );
      } else if (unusedCapacity <= 5000) {
        setStatus(
          statusEl,
          "is-tight",
          "Requested line is close to the estimated maximum available amount."
        );
      } else {
        setStatus(
          statusEl,
          "is-fit",
          `Requested line fits within the estimate with ${formatCurrency(unusedCapacity)} in remaining capacity.`
        );
      }

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "HELOC-Calculator",
          available_line: Math.round(availableLine),
          approved_line: Math.round(approvedLine),
          combined_ltv: Number(combinedLtv.toFixed(2))
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
    if (event.detail?.calculatorType === "HELOC-Calculator") {
      initHelocCalculator();
    }
  });
})();
