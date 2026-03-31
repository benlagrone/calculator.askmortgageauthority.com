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

  function monthlyPayment(principal, ratePct, months) {
    if (months <= 0) return 0;
    const monthlyRate = ratePct / 100 / 12;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
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

  function formatMonths(value) {
    const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
    return `${Math.ceil(safeValue)} months`;
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

  function initCashOutRefinanceCalculator() {
    const form = document.getElementById("cash-out-refinance-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("cash-out-refinance-results");
    const statusEl = document.getElementById("cor-status");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const currentBalance = parseNumber(form.currentBalance.value);
      const currentRate = parseNumber(form.currentRate.value);
      const currentYears = parseNumber(form.currentYears.value);
      const currentMonths = parseNumber(form.currentMonths.value);
      const homeValue = parseNumber(form.homeValue.value);
      const desiredCashOut = parseNumber(form.desiredCashOut.value);
      const closingCosts = parseNumber(form.closingCosts.value);
      const maxCltv = parseNumber(form.maxCltv.value);
      const newRate = parseNumber(form.newRate.value);
      const newYears = parseNumber(form.newYears.value);
      const newMonths = parseNumber(form.newMonths.value);
      const financeClosingCosts = form.financeClosingCosts.value === "yes";

      const currentTermMonths = currentYears * 12 + currentMonths;
      const newTermMonths = newYears * 12 + newMonths;
      const maxLoanAmount = homeValue * (maxCltv / 100);
      const newLoanAmount = currentBalance + desiredCashOut + (financeClosingCosts ? closingCosts : 0);
      const availableHeadroom = maxLoanAmount - currentBalance;
      const requestedHeadroom = desiredCashOut + (financeClosingCosts ? closingCosts : 0);

      const fieldChecks = [
        [form.currentBalance, currentBalance > 0, "Current Mortgage Balance must be greater than 0."],
        [form.currentRate, currentRate > 0 && currentRate <= 25, "Current Interest Rate must be between 0 and 25%."],
        [form.currentYears, currentYears > 0 || currentMonths > 0, "Remaining Term must be greater than 0."],
        [form.currentMonths, currentMonths >= 0, "Extra months on the current loan must be 0 or greater."],
        [form.homeValue, homeValue > 0, "Current Home Value must be greater than 0."],
        [form.desiredCashOut, desiredCashOut >= 0, "Desired Cash to Borrower must be 0 or greater."],
        [form.closingCosts, closingCosts >= 0, "Estimated Closing Costs must be 0 or greater."],
        [form.maxCltv, maxCltv > 0 && maxCltv <= 100, "Max CLTV Allowed must be between 0 and 100%."],
        [form.newRate, newRate > 0 && newRate <= 25, "New Interest Rate must be between 0 and 25%."],
        [form.newYears, newYears > 0 || newMonths > 0, "New Loan Term must be greater than 0."],
        [form.newMonths, newMonths >= 0, "Extra months on the new loan must be 0 or greater."]
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
          form.currentBalance,
          "Current Mortgage Balance must be lower than the current home value for a cash-out estimate."
        );
        firstInvalidField = firstInvalidField || form.currentBalance;
      }

      if (availableHeadroom <= 0) {
        ui?.showFieldError(
          form.maxCltv,
          "The selected CLTV does not leave room for cash out above the current mortgage balance."
        );
        firstInvalidField = firstInvalidField || form.maxCltv;
      } else if (requestedHeadroom > availableHeadroom) {
        const maxBorrowerCash = financeClosingCosts
          ? Math.max(0, availableHeadroom - closingCosts)
          : Math.max(0, availableHeadroom);

        ui?.showFieldError(
          form.desiredCashOut,
          `This scenario exceeds the selected CLTV. Reduce the desired cash to ${formatCurrency(maxBorrowerCash)} or less, or raise the home value / CLTV assumption.`
        );
        firstInvalidField = firstInvalidField || form.desiredCashOut;
      }

      if (firstInvalidField) {
        firstInvalidField.focus();
        ui?.hideResults(resultBox);
        return;
      }

      const currentPayment = monthlyPayment(currentBalance, currentRate, currentTermMonths);
      const newPayment = monthlyPayment(newLoanAmount, newRate, newTermMonths);
      const currentInterest = currentPayment * currentTermMonths - currentBalance;
      const newInterest = newPayment * newTermMonths - newLoanAmount;
      const paymentDelta = newPayment - currentPayment;
      const paymentSavings = currentPayment - newPayment;
      const currentLtv = (currentBalance / homeValue) * 100;
      const newCltv = (newLoanAmount / homeValue) * 100;
      const outOfPocketCosts = financeClosingCosts ? 0 : closingCosts;
      const netCash = desiredCashOut - outOfPocketCosts;
      const interestChange = newInterest - currentInterest;

      let breakEvenValue = "Not applicable";
      let breakEvenNote = "No cash-payback break-even applies to this scenario.";
      if (outOfPocketCosts > 0 && paymentSavings > 0) {
        const breakEvenMonths = outOfPocketCosts / paymentSavings;
        breakEvenValue = formatMonths(breakEvenMonths);
        breakEvenNote = `Estimated months for payment savings of ${formatCurrency(paymentSavings)} to recover ${formatCurrency(outOfPocketCosts)} paid at closing.`;
      } else if (outOfPocketCosts > 0 && paymentSavings <= 0) {
        breakEvenValue = "No break-even";
        breakEvenNote = "There is no payment-savings break-even because the new payment does not drop.";
      } else if (financeClosingCosts) {
        breakEvenValue = "Costs financed";
        breakEvenNote = "Closing costs are rolled into the new balance, so the trade-off shows up through higher debt and interest rather than an out-of-pocket break-even.";
      }

      setText("cor-net-cash", formatCurrency(netCash));
      setText("cor-current-balance-output", formatCurrency(currentBalance));
      setText("cor-max-loan-amount", formatCurrency(maxLoanAmount));
      setText("cor-current-payment", formatCurrency(currentPayment));
      setText("cor-new-payment", formatCurrency(newPayment));
      setText("cor-monthly-change", formatSignedCurrency(paymentDelta));
      setText("cor-new-loan-amount", formatCurrency(newLoanAmount));
      setText("cor-current-ltv", formatPercent(currentLtv));
      setText("cor-new-cltv", formatPercent(newCltv));
      setText("cor-current-interest", formatCurrency(currentInterest));
      setText("cor-new-interest", formatCurrency(newInterest));
      setText("cor-interest-change", formatSignedCurrency(interestChange));
      setText("cor-break-even", breakEvenValue);
      setText("cor-break-even-note", breakEvenNote);

      if (paymentDelta > 0) {
        setText("cor-monthly-change-note", "Estimated increase in the monthly principal-and-interest payment.");
      } else if (paymentDelta < 0) {
        setText("cor-monthly-change-note", "Estimated decrease in the monthly principal-and-interest payment.");
      } else {
        setText("cor-monthly-change-note", "Monthly payment is roughly unchanged.");
      }

      if (interestChange > 0) {
        setText("cor-interest-change-note", "Projected lifetime interest is higher on the new loan.");
      } else if (interestChange < 0) {
        setText("cor-interest-change-note", "Projected lifetime interest is lower on the new loan.");
      } else {
        setText("cor-interest-change-note", "Projected lifetime interest is roughly unchanged.");
      }

      if (netCash <= 0) {
        setStatus(
          statusEl,
          "is-over",
          "Closing costs absorb the available proceeds in this scenario, so there is no positive net cash benefit."
        );
      } else if (paymentDelta > 0) {
        setStatus(
          statusEl,
          "is-tight",
          `This scenario puts about ${formatCurrency(netCash)} in hand, but it raises the monthly payment by ${formatCurrency(paymentDelta)} and increases the balance to ${formatCurrency(newLoanAmount)}.`
        );
      } else {
        setStatus(
          statusEl,
          "is-fit",
          `This scenario delivers about ${formatCurrency(netCash)} in net cash while keeping the monthly payment ${paymentDelta < 0 ? "lower" : "flat"} and the new CLTV near ${formatPercent(newCltv)}.`
        );
      }

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "Cash-Out-Refinance-Calculator",
          net_cash: Math.round(netCash),
          new_loan_amount: Math.round(newLoanAmount),
          new_cltv: Number(newCltv.toFixed(2)),
          monthly_payment_change: Math.round(paymentDelta),
          interest_change: Math.round(interestChange)
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
    if (event.detail?.calculatorType === "Cash-Out-Refinance-Calculator") {
      initCashOutRefinanceCalculator();
    }
  });
})();
