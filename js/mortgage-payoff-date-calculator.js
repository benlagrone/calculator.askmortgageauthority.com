(() => {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
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

  function formatMonthsBreakdown(value) {
    const totalMonths = Math.max(0, Math.round(value || 0));
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years > 0 && months > 0) {
      return `${years} years ${months} months`;
    }
    if (years > 0) {
      return `${years} years`;
    }
    return `${months} months`;
  }

  function monthlyPayment(principal, annualRatePct, months) {
    if (principal <= 0 || months <= 0) return 0;
    const monthlyRate = annualRatePct / 100 / 12;
    if (monthlyRate === 0) {
      return principal / months;
    }
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  function simulatePayoff(balance, annualRatePct, paymentAmount) {
    const monthlyRate = annualRatePct / 100 / 12;
    if (balance <= 0 || paymentAmount <= 0) return null;
    if (monthlyRate > 0 && paymentAmount <= balance * monthlyRate) return null;

    let currentBalance = balance;
    let totalInterest = 0;
    let totalPaid = 0;
    let months = 0;
    const maxMonths = 7200;

    while (currentBalance > 0.01 && months < maxMonths) {
      const interest = monthlyRate === 0 ? 0 : currentBalance * monthlyRate;
      const payment = Math.min(currentBalance + interest, paymentAmount);
      const principal = payment - interest;
      if (principal <= 0) return null;

      currentBalance = Math.max(0, currentBalance - principal);
      totalInterest += interest;
      totalPaid += payment;
      months += 1;
    }

    if (months >= maxMonths) {
      return null;
    }

    return {
      months,
      totalInterest,
      totalPaid
    };
  }

  function addMonths(date, offset) {
    return new Date(date.getFullYear(), date.getMonth() + offset, 1);
  }

  function parseMonthValue(value) {
    if (!value || !/^\d{4}-\d{2}$/.test(value)) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  function defaultMonthValue() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
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

  function initMortgagePayoffDateCalculator() {
    const form = document.getElementById("mortgage-payoff-date-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("mortgage-payoff-date-results");
    const statusEl = document.getElementById("mpd-status");
    const startMonthField = form.startMonth;

    if (startMonthField && !startMonthField.value) {
      startMonthField.value = defaultMonthValue();
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const balance = parseNumber(form.balance.value);
      const rate = parseNumber(form.rate.value);
      const years = parseNumber(form.years.value);
      const months = parseNumber(form.months.value);
      const extraPayment = parseNumber(form.extraPayment.value);
      const totalMonths = years * 12 + months;

      const fieldChecks = [
        [form.balance, balance > 0, "Current Mortgage Balance must be greater than 0."],
        [form.rate, rate >= 0 && rate <= 25, "Interest Rate must be between 0 and 25%."],
        [form.years, totalMonths > 0, "Remaining Loan Term must be greater than 0."],
        [form.months, months >= 0 && months <= 11, "Extra months must be between 0 and 11."],
        [form.extraPayment, extraPayment >= 0, "Extra Monthly Principal must be 0 or greater."]
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

      const scheduledPayment = monthlyPayment(balance, rate, totalMonths);
      if (scheduledPayment <= 0) {
        ui?.showFieldError(form.balance, "Unable to calculate a scheduled payment from these inputs.");
        firstInvalidField = firstInvalidField || form.balance;
      }

      const acceleratedPayment = scheduledPayment + extraPayment;
      const firstMonthInterest = balance * (rate / 100 / 12);
      if (rate > 0 && acceleratedPayment <= firstMonthInterest) {
        ui?.showFieldError(
          form.extraPayment,
          "The scheduled payment plus extra principal must exceed the first month's interest."
        );
        firstInvalidField = firstInvalidField || form.extraPayment;
      }

      if (firstInvalidField) {
        firstInvalidField.focus();
        ui?.hideResults(resultBox);
        return;
      }

      const scheduledSchedule = simulatePayoff(balance, rate, scheduledPayment);
      const acceleratedSchedule = simulatePayoff(balance, rate, acceleratedPayment);
      if (!scheduledSchedule || !acceleratedSchedule) {
        ui?.showFormError(form, "Unable to build a payoff schedule from these inputs.");
        ui?.hideResults(resultBox);
        return;
      }

      const startDate = parseMonthValue(form.startMonth.value);
      const scheduledDate = addMonths(startDate, scheduledSchedule.months - 1);
      const acceleratedDate = addMonths(startDate, acceleratedSchedule.months - 1);
      const timeSavedMonths = scheduledSchedule.months - acceleratedSchedule.months;
      const interestSaved = scheduledSchedule.totalInterest - acceleratedSchedule.totalInterest;

      setText("mpd-payoff-date", monthYearFormatter.format(acceleratedDate));
      setText("mpd-scheduled-payment", formatCurrency(scheduledPayment));
      setText("mpd-extra-payment-output", formatCurrency(extraPayment));
      setText("mpd-scheduled-date", monthYearFormatter.format(scheduledDate));
      setText("mpd-accelerated-date", monthYearFormatter.format(acceleratedDate));
      setText("mpd-time-saved", timeSavedMonths > 0 ? formatMonthsBreakdown(timeSavedMonths) : "No change");
      setText("mpd-scheduled-months", formatMonthsBreakdown(scheduledSchedule.months));
      setText("mpd-accelerated-months", formatMonthsBreakdown(acceleratedSchedule.months));
      setText("mpd-scheduled-interest", formatCurrency(scheduledSchedule.totalInterest));
      setText("mpd-accelerated-interest", formatCurrency(acceleratedSchedule.totalInterest));
      setText("mpd-interest-saved", formatCurrency(Math.max(0, interestSaved)));

      if (extraPayment <= 0) {
        setStatus(
          statusEl,
          "is-tight",
          `No extra principal is included, so the projected payoff date stays on the current schedule through ${monthYearFormatter.format(scheduledDate)}.`
        );
      } else if (timeSavedMonths > 0) {
        setStatus(
          statusEl,
          "is-fit",
          `Adding ${formatCurrency(extraPayment)} per month could move payoff up by ${formatMonthsBreakdown(timeSavedMonths)} and reduce projected remaining interest by ${formatCurrency(Math.max(0, interestSaved))}.`
        );
      } else {
        setStatus(
          statusEl,
          "is-tight",
          `The added ${formatCurrency(extraPayment)} per month does not materially change the payoff schedule with the current rounding assumptions.`
        );
      }

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "Mortgage-Payoff-Date-Calculator",
          scheduled_payment: Math.round(scheduledPayment),
          accelerated_months: acceleratedSchedule.months,
          time_saved_months: timeSavedMonths,
          interest_saved: Math.round(Math.max(0, interestSaved))
        });
      } else {
        resultBox.hidden = false;
      }
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        window.setTimeout(() => {
          if (startMonthField) {
            startMonthField.value = defaultMonthValue();
          }
          if (statusEl) {
            statusEl.textContent = "";
            statusEl.className = "calc-results-status";
          }
          if (ui) {
            ui.hideResults(resultBox);
          } else {
            resultBox.hidden = true;
          }
        }, 0);
      });
    }
  }

  document.addEventListener("calculator:loaded", (event) => {
    if (event.detail?.calculatorType === "Mortgage-Payoff-Date-Calculator") {
      initMortgagePayoffDateCalculator();
    }
  });
})();
