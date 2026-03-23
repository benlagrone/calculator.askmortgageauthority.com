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

  function asPercent(value) {
    return `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;
  }

  function formatMonths(months) {
    if (months <= 0) return "Now";
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    if (years === 0) return `${remMonths} months`;
    if (remMonths === 0) return `${years} years`;
    return `${years} years ${remMonths} months`;
  }

  function monthlyPayment(principal, annualRatePct, years) {
    const months = years * 12;
    const monthlyRate = annualRatePct / 100 / 12;
    if (months <= 0) return 0;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  function monthsToTargetBalance(balance, annualRatePct, years, targetBalance, extraPrincipal) {
    if (balance <= targetBalance) {
      return 0;
    }

    const payment = monthlyPayment(balance, annualRatePct, years);
    const monthlyRate = annualRatePct / 100 / 12;
    const maxMonths = years * 12 + 600;
    let currentBalance = balance;

    for (let month = 1; month <= maxMonths; month += 1) {
      const interest = monthlyRate > 0 ? currentBalance * monthlyRate : 0;
      const principalPayment = payment - interest + extraPrincipal;
      const appliedPrincipal = Math.max(0, Math.min(currentBalance, principalPayment));
      currentBalance -= appliedPrincipal;

      if (currentBalance <= targetBalance) {
        return month;
      }

      if (appliedPrincipal <= 0) {
        return null;
      }
    }

    return null;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = value;
  }

  function setStatus(element, type, text) {
    if (!element) return;
    element.className = `calc-results-status ${type}`;
    element.textContent = text;
  }

  function initPmiRemovalCalculator() {
    const form = document.getElementById("pmi-removal-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("pmi-removal-results");
    const statusEl = document.getElementById("pmi-status");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const currentBalance = toNumber(form.currentBalance.value);
      const homeValue = toNumber(form.homeValue.value);
      const interestRate = toNumber(form.interestRate.value);
      const remainingYears = toNumber(form.remainingYears.value);
      const targetLtv = toNumber(form.targetLtv.value);
      const monthlyPmi = toNumber(form.monthlyPmi.value);
      const extraPrincipal = toNumber(form.extraPrincipal.value);

      const fieldChecks = [
        [form.currentBalance, currentBalance > 0, "Current Loan Balance must be greater than 0."],
        [form.homeValue, homeValue > 0, "Current Home Value must be greater than 0."],
        [form.interestRate, interestRate > 0, "Interest Rate must be greater than 0."],
        [form.remainingYears, remainingYears > 0, "Remaining Loan Term must be greater than 0."],
        [form.targetLtv, targetLtv > 0 && targetLtv < 100, "PMI Removal Threshold must be between 0 and 100."],
        [form.monthlyPmi, monthlyPmi >= 0, "Monthly PMI Cost must be 0 or greater."],
        [form.extraPrincipal, extraPrincipal >= 0, "Extra Monthly Principal must be 0 or greater."]
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

      if (currentBalance >= homeValue) {
        ui?.showFieldError(
          form.homeValue,
          "Current Home Value must be greater than the Current Loan Balance."
        );
        firstInvalidField = firstInvalidField || form.homeValue;
      }

      if (firstInvalidField) {
        firstInvalidField.focus();
        ui?.hideResults(resultBox);
        return;
      }

      const currentLtv = (currentBalance / homeValue) * 100;
      const targetBalance = homeValue * (targetLtv / 100);
      const additionalPrincipalNeeded = Math.max(0, currentBalance - targetBalance);
      const scheduledPayment = monthlyPayment(currentBalance, interestRate, remainingYears);
      const paymentWithExtra = scheduledPayment + extraPrincipal;
      const monthsUntilRemoval = monthsToTargetBalance(
        currentBalance,
        interestRate,
        remainingYears,
        targetBalance,
        extraPrincipal
      );
      const totalPmiCost =
        monthsUntilRemoval === null ? null : monthlyPmi * monthsUntilRemoval;

      setText("pmi-current-ltv", asPercent(currentLtv));
      setText("pmi-target-balance", asCurrency(targetBalance));
      setText("pmi-principal-needed", asCurrency(additionalPrincipalNeeded));
      setText(
        "pmi-total-cost",
        totalPmiCost !== null ? asCurrency(totalPmiCost) : "No estimate"
      );
      setText("pmi-scheduled-payment", asCurrency(scheduledPayment));
      setText("pmi-payment-with-extra", asCurrency(paymentWithExtra));
      setText(
        "pmi-extra-note",
        extraPrincipal > 0
          ? `Includes ${asCurrency(extraPrincipal)} in extra principal each month.`
          : "No extra principal included in this estimate."
      );

      if (currentBalance <= targetBalance) {
        setText("pmi-time-to-removal", "Now");
        setStatus(
          statusEl,
          "is-fit",
          "Current balance is already at or below the selected PMI removal threshold."
        );
      } else if (monthsUntilRemoval === null) {
        setText("pmi-time-to-removal", "No estimate");
        setStatus(
          statusEl,
          "is-over",
          "This loan configuration does not reach the target balance within the modeled term."
        );
      } else if (monthsUntilRemoval <= 12) {
        setText("pmi-time-to-removal", formatMonths(monthsUntilRemoval));
        setStatus(
          statusEl,
          "is-fit",
          `Estimated PMI removal within ${formatMonths(monthsUntilRemoval)}.`
        );
      } else {
        setText("pmi-time-to-removal", formatMonths(monthsUntilRemoval));
        setStatus(
          statusEl,
          "is-tight",
          `Estimated PMI removal in ${formatMonths(monthsUntilRemoval)}.`
        );
      }

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "PMI-Removal-Calculator",
          months_until_removal: monthsUntilRemoval,
          current_ltv: Number(currentLtv.toFixed(2))
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
    if (event.detail?.calculatorType === "PMI-Removal-Calculator") {
      initPmiRemovalCalculator();
    }
  });
})();
