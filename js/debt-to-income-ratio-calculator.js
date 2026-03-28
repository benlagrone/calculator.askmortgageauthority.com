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

  function formatSignedCurrency(value) {
    const safeValue = Number.isFinite(value) ? value : 0;
    if (safeValue < 0) {
      return `-${formatCurrency(Math.abs(safeValue))}`;
    }
    return formatCurrency(safeValue);
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

  function initDebtToIncomeCalculator() {
    const form = document.getElementById("dti-calculator-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("dti-results");
    const statusEl = document.getElementById("dti-status");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const grossMonthlyIncome = parseNumber(form.grossMonthlyIncome.value);
      const housingPayment = parseNumber(form.housingPayment.value);
      const autoLoans = parseNumber(form.autoLoans.value);
      const studentLoans = parseNumber(form.studentLoans.value);
      const creditAndPersonalLoans = parseNumber(form.creditAndPersonalLoans.value);
      const otherDebts = parseNumber(form.otherDebts.value);

      const fieldChecks = [
        [form.grossMonthlyIncome, grossMonthlyIncome > 0, "Gross Monthly Income must be greater than 0."],
        [form.housingPayment, housingPayment > 0, "Monthly Housing Payment must be greater than 0."],
        [form.autoLoans, autoLoans >= 0, "Car or Auto Loans must be 0 or greater."],
        [form.studentLoans, studentLoans >= 0, "Student Loans must be 0 or greater."],
        [form.creditAndPersonalLoans, creditAndPersonalLoans >= 0, "Credit Cards and Personal Loans must be 0 or greater."],
        [form.otherDebts, otherDebts >= 0, "Alimony, Child Support, or Other Debts must be 0 or greater."]
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

      const otherMonthlyDebts =
        autoLoans + studentLoans + creditAndPersonalLoans + otherDebts;
      const totalMonthlyDebt = housingPayment + otherMonthlyDebts;
      const frontEndDti = (housingPayment / grossMonthlyIncome) * 100;
      const backEndDti = (totalMonthlyDebt / grossMonthlyIncome) * 100;
      const incomeLeftAfterDebts = grossMonthlyIncome - totalMonthlyDebt;
      const roomTo36 = grossMonthlyIncome * 0.36 - totalMonthlyDebt;
      const roomTo43 = grossMonthlyIncome * 0.43 - totalMonthlyDebt;

      setText("dti-back-end", formatPercent(backEndDti));
      setText("dti-front-end", formatPercent(frontEndDti));
      setText("dti-income-output", formatCurrency(grossMonthlyIncome));
      setText("dti-housing-output", formatCurrency(housingPayment));
      setText("dti-other-output", formatCurrency(otherMonthlyDebts));
      setText("dti-total-debt", formatCurrency(totalMonthlyDebt));
      setText("dti-income-left", formatSignedCurrency(incomeLeftAfterDebts));
      setText("dti-room-36", formatSignedCurrency(roomTo36));
      setText("dti-room-43", formatSignedCurrency(roomTo43));
      setText(
        "dti-room-36-note",
        roomTo36 >= 0
          ? "Remaining room before reaching a 36% total-debt benchmark."
          : "Amount above a conservative 36% total-debt benchmark."
      );
      setText(
        "dti-room-43-note",
        roomTo43 >= 0
          ? "Remaining room before reaching a 43% total-debt benchmark."
          : "Amount above a common 43% total-debt benchmark."
      );

      if (frontEndDti <= 28 && backEndDti <= 36) {
        setStatus(
          statusEl,
          "is-fit",
          "This scenario is within conservative mortgage guideline ranges for both front-end and back-end DTI."
        );
      } else if (frontEndDti <= 31 && backEndDti <= 43) {
        setStatus(
          statusEl,
          "is-tight",
          "This scenario is within common mortgage qualification ranges, but it is tighter than conservative guideline targets."
        );
      } else {
        setStatus(
          statusEl,
          "is-over",
          "This scenario is above common mortgage guideline ranges, so qualification may require a different loan program, stronger compensating factors, or lower debts."
        );
      }

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "Debt-to-Income-Ratio-Calculator",
          front_end_dti: Number(frontEndDti.toFixed(2)),
          back_end_dti: Number(backEndDti.toFixed(2)),
          total_monthly_debt: Math.round(totalMonthlyDebt)
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
    if (event.detail?.calculatorType === "Debt-to-Income-Ratio-Calculator") {
      initDebtToIncomeCalculator();
    }
  });
})();
