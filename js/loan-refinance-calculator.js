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

  function monthlyPayment(principal, ratePct, months) {
    if (months <= 0) return 0;
    const monthlyRate = ratePct / 100 / 12;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  }

  function remainingBalance(principal, ratePct, totalMonths, paymentsMade) {
    const monthlyRate = ratePct / 100 / 12;
    const payment = monthlyPayment(principal, ratePct, totalMonths);
    if (monthlyRate === 0) return Math.max(0, principal - payment * paymentsMade);
    return Math.max(
      0,
      principal * Math.pow(1 + monthlyRate, paymentsMade) -
        payment * ((Math.pow(1 + monthlyRate, paymentsMade) - 1) / monthlyRate)
    );
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = value;
  }

  function initLoanRefinance() {
    const form = document.getElementById("loan-refinance-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("loan-refinance-results");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const loanAmount = toNumber(form.loanAmount.value);
      const rateOld = toNumber(form.interestRate.value);
      const yearsOld = toNumber(form.years.value);
      const monthsOld = toNumber(form.months.value);
      const paymentsMade = toNumber(form.paymentMade.value);
      const rateNew = toNumber(form.interestRateNew.value);
      const yearsNew = toNumber(form.yearsNew.value);
      const monthsNew = toNumber(form.monthsNew.value);

      const totalMonthsOld = yearsOld * 12 + monthsOld;
      const totalMonthsNew = yearsNew * 12 + monthsNew;

      const fieldChecks = [
        [form.loanAmount, loanAmount > 0, "Original Loan Amount must be greater than 0."],
        [form.interestRate, rateOld > 0, "Current Rate must be greater than 0."],
        [form.years, yearsOld > 0 || monthsOld > 0, "Current Loan Term must be greater than 0."],
        [form.months, monthsOld >= 0, "Extra months on the current loan must be 0 or greater."],
        [form.paymentMade, paymentsMade >= 0, "Payments Made must be 0 or greater."],
        [form.interestRateNew, rateNew > 0, "New Rate must be greater than 0."],
        [form.yearsNew, yearsNew > 0 || monthsNew > 0, "New Loan Term must be greater than 0."],
        [form.monthsNew, monthsNew >= 0, "Extra months on the new loan must be 0 or greater."]
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

      if (paymentsMade >= totalMonthsOld) {
        ui?.showFieldError(
          form.paymentMade,
          "Payments Made must be less than the full current loan term."
        );
        firstInvalidField = firstInvalidField || form.paymentMade;
      }

      if (firstInvalidField) {
        firstInvalidField.focus();
        ui?.hideResults(resultBox);
        return;
      }

      const paidMonths = Math.min(paymentsMade, totalMonthsOld);
      const currentMonthlyPayment = monthlyPayment(loanAmount, rateOld, totalMonthsOld);
      const balanceOld = remainingBalance(loanAmount, rateOld, totalMonthsOld, paidMonths);
      const remainingMonthsOld = Math.max(0, totalMonthsOld - paidMonths);
      const totalPayRemainingOld = currentMonthlyPayment * remainingMonthsOld;
      const remainingInterestOld = totalPayRemainingOld - balanceOld;

      const newMonthlyPayment = monthlyPayment(balanceOld, rateNew, totalMonthsNew);
      const totalPayNew = newMonthlyPayment * totalMonthsNew;
      const interestNew = totalPayNew - balanceOld;
      const interestSaved = remainingInterestOld - interestNew;
      const monthlyChange = currentMonthlyPayment - newMonthlyPayment;

      setText("lr-balance-old", asCurrency(balanceOld));
      setText("lr-monthly-old", asCurrency(currentMonthlyPayment));
      setText("lr-interest-old", asCurrency(remainingInterestOld));
      setText("lr-total-new", asCurrency(totalPayNew));
      setText("lr-monthly-new", asCurrency(newMonthlyPayment));
      setText("lr-interest-new", asCurrency(interestNew));
      setText("lr-saved", asCurrency(interestSaved));
      setText("lr-monthly-change", asCurrency(Math.abs(monthlyChange)));

      if (monthlyChange > 0) {
        setText(
          "lr-monthly-change-note",
          "Estimated decrease in the monthly principal-and-interest payment."
        );
      } else if (monthlyChange < 0) {
        setText(
          "lr-monthly-change-note",
          "Estimated increase in the monthly principal-and-interest payment."
        );
      } else {
        setText("lr-monthly-change-note", "Monthly payment is roughly unchanged.");
      }

      setText(
        "lr-hero-note",
        interestSaved >= 0
          ? `The refinance lowers payment by ${asCurrency(Math.max(0, monthlyChange))} per month and reduces projected remaining interest by ${asCurrency(interestSaved)}.`
          : `This refinance increases total projected interest by ${asCurrency(Math.abs(interestSaved))}, even though the payment may still be lower.`
      );

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "Loan-Refinance-Calculator",
          interest_saved: Math.round(interestSaved),
          new_monthly_payment: Math.round(newMonthlyPayment)
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
    if (event.detail?.calculatorType === "Loan-Refinance-Calculator") {
      initLoanRefinance();
    }
  });
})();
