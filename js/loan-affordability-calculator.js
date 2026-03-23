(() => {
  const currencyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const toNumber = (val) => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const asCurrency = (val) => currencyFmt.format(isFinite(val) ? val : 0);

  function monthlyPayment(principal, annualRatePct, termYears) {
    const n = termYears * 12;
    const r = annualRatePct / 100 / 12;
    if (n <= 0) return 0;
    if (r === 0) return principal / n;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }

  function solveLoanAmount(paymentPI, annualRatePct, termYears) {
    const n = termYears * 12;
    const r = annualRatePct / 100 / 12;
    if (n <= 0) return 0;
    if (r === 0) return paymentPI * n;
    return paymentPI * (1 - Math.pow(1 + r, -n)) / r;
  }

  function initLoanAffordability() {
    const form = document.getElementById("loan-affordability-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("loan-affordability-results");
    const housingDetail = document.getElementById("la-max-housing-detail");

    const positiveChecks = [
      ["annualIncome", "Gross Annual Income must be greater than 0."],
      ["monthlyDebts", "Monthly Debts must be 0 or greater."],
      ["frontRatio", "Front-End Ratio must be greater than 0."],
      ["backRatio", "Back-End Ratio must be greater than 0."],
      ["downPayment", "Down Payment must be 0 or greater."],
      ["interestRate", "Interest Rate must be greater than 0."],
      ["years", "Loan Term must be greater than 0."],
      ["propertyTax", "Property Tax must be 0 or greater."],
      ["insurance", "Insurance must be 0 or greater."],
      ["hoa", "HOA must be 0 or greater."]
    ];

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const annualIncome = toNumber(form.annualIncome.value);
      const monthlyDebts = toNumber(form.monthlyDebts.value);
      const front = toNumber(form.frontRatio.value) / 100 || 0.28;
      const back = toNumber(form.backRatio.value) / 100 || 0.36;
      const downPayment = toNumber(form.downPayment.value);
      const rate = toNumber(form.interestRate.value);
      const years = toNumber(form.years.value);
      const taxAnnual = toNumber(form.propertyTax.value);
      const insuranceAnnual = toNumber(form.insurance.value);
      const hoaMonthly = toNumber(form.hoa.value);

      let firstInvalidField = null;
      positiveChecks.forEach(([name, message]) => {
        const field = form[name];
        if (!field) return;
        const value = toNumber(field.value);
        const mustBePositive = !["monthlyDebts", "downPayment", "propertyTax", "insurance", "hoa"].includes(name);
        const isValid = mustBePositive ? value > 0 : value >= 0;
        if (!isValid) {
          ui?.showFieldError(field, message);
          firstInvalidField = firstInvalidField || field;
        }
      });

      if (firstInvalidField) {
        firstInvalidField.focus();
        return;
      }

      if (front > back) {
        ui?.showFieldError(form.frontRatio, "Front-End Ratio should usually be less than or equal to the Back-End Ratio.");
        form.frontRatio.focus();
        return;
      }

      const monthlyIncome = annualIncome / 12;
      const maxHousingFront = monthlyIncome * front;
      const maxHousingBack = monthlyIncome * back - monthlyDebts;
      const maxHousing = Math.min(maxHousingFront, maxHousingBack);
      if (maxHousing <= 0) {
        ui?.showFormError(
          form,
          "Current monthly debts already exceed the selected affordability ratios. Lower debts or adjust the ratios to continue."
        );
        ui?.hideResults(resultBox);
        return;
      }

      const pitiExtras = taxAnnual / 12 + insuranceAnnual / 12 + hoaMonthly;
      const maxPI = Math.max(0, maxHousing - pitiExtras);
      const maxLoan = solveLoanAmount(maxPI, rate, years);
      const homePrice = maxLoan + downPayment;

      const paymentPI = monthlyPayment(maxLoan, rate, years);
      const piti = paymentPI + pitiExtras;

      document.getElementById("la-max-loan").textContent = asCurrency(maxLoan);
      document.getElementById("la-home-price").textContent = asCurrency(homePrice);
      document.getElementById("la-pi").textContent = asCurrency(paymentPI);
      document.getElementById("la-piti").textContent = asCurrency(piti);
      document.getElementById("la-max-housing").textContent = asCurrency(maxHousing);
      if (housingDetail) {
        housingDetail.textContent = `Front-end limit ${asCurrency(maxHousingFront)} | Back-end limit ${asCurrency(maxHousingBack)}`;
      }

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "Loan-Affordability-Calculator",
          estimated_home_price: Math.round(homePrice),
          max_loan_amount: Math.round(maxLoan)
        });
      } else {
        resultBox.hidden = false;
      }
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        ui?.hideResults(resultBox);
        if (housingDetail) {
          housingDetail.textContent = "";
        }
        if (!ui) {
          resultBox.hidden = true;
        }
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Loan-Affordability-Calculator") {
      initLoanAffordability();
    }
  });
})();
