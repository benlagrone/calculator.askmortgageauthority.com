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

  function formatMonthsToYears(months) {
    if (!months || months <= 0) return "0 months";
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    if (years === 0) return `${remMonths} months`;
    if (remMonths === 0) return `${years} years`;
    return `${years} years ${remMonths} months`;
  }

  function buildSchedule(options) {
    const {
      principal,
      annualRate,
      termMonths,
      extraPayment = 0,
      monthlyEscrow = 0,
      pmiPercent = 0,
      propertyPrice = 0,
      cancelPmi = true
    } = options;

    const monthlyRate = annualRate > 0 ? annualRate / 1200 : 0;
    const basePayment =
      monthlyRate > 0
        ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths))
        : principal / termMonths;

    let balance = principal;
    let month = 0;
    let totalInterest = 0;
    let totalPmi = 0;
    let totalEscrow = 0;
    let pmiEndMonth = null;
    const maxMonths = termMonths + 600;

    while (balance > 0 && month < maxMonths) {
      month += 1;
      const interest = monthlyRate > 0 ? balance * monthlyRate : 0;
      const principalPayment = basePayment - interest;
      const extra = extraPayment > 0 ? extraPayment : 0;

      let paymentToPrincipal = principalPayment + extra;
      if (paymentToPrincipal > balance) {
        paymentToPrincipal = balance;
      }

      balance -= paymentToPrincipal;
      totalInterest += interest;

      const ltv = propertyPrice > 0 ? balance / propertyPrice : 1;
      const includePmi = pmiPercent > 0 && (!cancelPmi || ltv > 0.8);
      const pmi =
        includePmi && pmiPercent > 0 ? (principal * (pmiPercent / 100)) / 12 : 0;

      if (!includePmi && pmiEndMonth === null && pmiPercent > 0) {
        pmiEndMonth = month;
      }

      totalPmi += pmi;
      totalEscrow += monthlyEscrow;

      if (balance <= 0) {
        if (pmiEndMonth === null && pmiPercent > 0 && cancelPmi) {
          pmiEndMonth = month;
        }
        break;
      }
    }

    return {
      months: month,
      totalInterest,
      totalPmi,
      totalEscrow,
      basePayment,
      firstPmi: pmiPercent > 0 ? (principal * (pmiPercent / 100)) / 12 : 0,
      pmiEndMonth
    };
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = value;
  }

  function setupFinancialCalculator() {
    const form = document.getElementById("financial-calculator-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("financial-calculator-result");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const loanAmount = parseNumber(form.loanAmount.value);
      const interestRate = parseNumber(form.interestRate.value);
      const years = parseNumber(form.years.value);
      const extraMonthlyPayment = parseNumber(form.extraMonthlyPayment.value);
      const propertyTax = parseNumber(form.propertyTax.value);
      const insurance = parseNumber(form.insurance.value);
      const otherFee = parseNumber(form.otherFee.value);
      const pmiPercent = parseNumber(form.pmi.value);
      const propertyPrice = parseNumber(form.propertyPrice.value);
      const cancelPmi = form.cancelPMI.checked;
      const termMonths = years * 12;

      const fieldChecks = [
        [form.loanAmount, loanAmount > 0, "Loan Amount must be greater than 0."],
        [form.interestRate, interestRate > 0, "Interest Rate must be greater than 0."],
        [form.years, years > 0, "Loan Term must be greater than 0."],
        [form.extraMonthlyPayment, extraMonthlyPayment >= 0, "Extra Principal Payment must be 0 or greater."],
        [form.propertyTax, propertyTax >= 0, "Property Tax must be 0 or greater."],
        [form.insurance, insurance >= 0, "Insurance must be 0 or greater."],
        [form.otherFee, otherFee >= 0, "Other Fees must be 0 or greater."],
        [form.pmi, pmiPercent >= 0, "PMI must be 0 or greater."],
        [form.propertyPrice, propertyPrice >= 0, "Property Price must be 0 or greater."]
      ];

      let firstInvalidField = null;
      fieldChecks.forEach(([field, isValid, message]) => {
        if (!field) return;
        if (isValid) {
          ui?.clearFieldError(field);
          if ((field.value || "").trim()) {
            ui?.markFieldValid(field);
          }
          return;
        }
        ui?.showFieldError(field, message);
        firstInvalidField = firstInvalidField || field;
      });

      if (cancelPmi && pmiPercent > 0 && propertyPrice <= 0) {
        ui?.showFieldError(
          form.propertyPrice,
          "Enter Property Price to estimate when PMI can drop off at 80% LTV."
        );
        firstInvalidField = firstInvalidField || form.propertyPrice;
      }

      if (propertyPrice > 0 && loanAmount > propertyPrice) {
        ui?.showFieldError(
          form.propertyPrice,
          "Property Price should be greater than or equal to the Loan Amount."
        );
        firstInvalidField = firstInvalidField || form.propertyPrice;
      }

      if (firstInvalidField) {
        firstInvalidField.focus();
        ui?.hideResults(resultBox);
        return;
      }

      const monthlyEscrow = (propertyTax + insurance + otherFee) / 12;

      const baseSchedule = buildSchedule({
        principal: loanAmount,
        annualRate: interestRate,
        termMonths,
        extraPayment: 0,
        monthlyEscrow,
        pmiPercent,
        propertyPrice,
        cancelPmi
      });

      const withExtraSchedule = buildSchedule({
        principal: loanAmount,
        annualRate: interestRate,
        termMonths,
        extraPayment: extraMonthlyPayment,
        monthlyEscrow,
        pmiPercent,
        propertyPrice,
        cancelPmi
      });

      const monthlyWithPmi =
        withExtraSchedule.basePayment + monthlyEscrow + withExtraSchedule.firstPmi;
      const monthlyWithoutPmi = withExtraSchedule.basePayment + monthlyEscrow;
      const totalPayment =
        loanAmount +
        withExtraSchedule.totalInterest +
        withExtraSchedule.totalPmi +
        withExtraSchedule.totalEscrow;
      const annualPayment = monthlyWithoutPmi * 12;
      const mortgageConstant = withExtraSchedule.basePayment / loanAmount;
      const interestSaving =
        baseSchedule.totalInterest - withExtraSchedule.totalInterest;
      const payoffEarlierByMonths =
        baseSchedule.months - withExtraSchedule.months;
      const hasPmi = pmiPercent > 0;
      const hasExtra = extraMonthlyPayment > 0;

      setText(
        "fc-hero-payment",
        formatCurrency(hasPmi ? monthlyWithPmi : monthlyWithoutPmi)
      );

      if (hasPmi) {
        const monthsWithPmi =
          withExtraSchedule.pmiEndMonth || withExtraSchedule.months || termMonths;
        if (cancelPmi && propertyPrice > 0) {
          setText(
            "fc-hero-note",
            `This estimate includes PMI for roughly ${monthsWithPmi} month(s), then drops to ${formatCurrency(monthlyWithoutPmi)} once PMI falls off.`
          );
          setText("fc-pmi-summary", formatCurrency(withExtraSchedule.firstPmi));
          setText(
            "fc-pmi-note",
            `Monthly PMI estimate for the first ${monthsWithPmi} month(s).`
          );
        } else {
          setText(
            "fc-hero-note",
            `This estimate includes a monthly PMI cost of ${formatCurrency(withExtraSchedule.firstPmi)} for the scenario shown.`
          );
          setText("fc-pmi-summary", formatCurrency(withExtraSchedule.firstPmi));
          setText(
            "fc-pmi-note",
            "PMI stays in the estimate because no auto-cancel property value scenario was modeled."
          );
        }
      } else {
        setText(
          "fc-hero-note",
          "This estimate reflects principal, interest, taxes, insurance, and other fees without PMI."
        );
        setText("fc-pmi-summary", "No PMI");
        setText("fc-pmi-note", "PMI is not included in this scenario.");
      }

      setText("fc-monthly-base", formatCurrency(monthlyWithoutPmi));
      setText("fc-total-payment", formatCurrency(totalPayment));
      setText("fc-total-interest", formatCurrency(withExtraSchedule.totalInterest));
      setText("fc-annual-payment", formatCurrency(annualPayment));
      setText(
        "fc-mortgage-constant",
        `${(mortgageConstant * 100).toFixed(3)}% of loan amount`
      );

      if (hasExtra) {
        setText("fc-extra-summary", formatCurrency(interestSaving));
        setText(
          "fc-extra-note",
          payoffEarlierByMonths > 0
            ? `Estimated payoff acceleration: ${formatMonthsToYears(payoffEarlierByMonths)} earlier.`
            : "Extra payment does not materially change the payoff date in this scenario."
        );
      } else {
        setText("fc-extra-summary", "No extra payment");
        setText("fc-extra-note", "Add an extra principal payment to estimate interest savings and payoff acceleration.");
      }

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "Financial-Calculators",
          monthly_payment: Math.round(hasPmi ? monthlyWithPmi : monthlyWithoutPmi),
          total_interest: Math.round(withExtraSchedule.totalInterest)
        });
      } else if (resultBox) {
        resultBox.hidden = false;
      }
    });

    const resetButton = form.querySelector("[data-reset]");
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        if (ui) {
          ui.hideResults(resultBox);
        } else if (resultBox) {
          resultBox.hidden = true;
        }
      });
    }

    const calcLoanButton = form.querySelector("[data-calc-loan]");
    if (calcLoanButton) {
      calcLoanButton.addEventListener("click", () => {
        const input = window.prompt(
          "Enter property price * down payment (for example: 375000*20%)"
        );
        if (!input) return;
        const cleaned = input.replace(/,/g, "").replace("%", "");
        const parts = cleaned.split("*");
        const price = parseNumber(parts[0]);
        const downPct = parts[1] ? parseNumber(parts[1]) : 0;
        if (!price) return;
        const loanAmount =
          parts.length === 1 ? price : price - (price * downPct) / 100;
        form.loanAmount.value = loanAmount.toLocaleString("en-US");
        if (!form.propertyPrice.value) {
          form.propertyPrice.value = price.toLocaleString("en-US");
        }
      });
    }
  }

  document.addEventListener("calculator:loaded", (event) => {
    if (event.detail?.calculatorType === "Financial-Calculators") {
      setupFinancialCalculator();
    }
  });
})();
