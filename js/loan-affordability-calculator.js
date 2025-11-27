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
    if (!form) return;
    const resultBox = document.getElementById("loan-affordability-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
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

      if (!annualIncome || !rate || !years) {
        alert("Please enter income, rate, and term.");
        return;
      }

      const monthlyIncome = annualIncome / 12;
      const maxHousingFront = monthlyIncome * front;
      const maxHousingBack = monthlyIncome * back - monthlyDebts;
      const maxHousing = Math.min(maxHousingFront, maxHousingBack);
      if (maxHousing <= 0) {
        alert("Debts are too high for the chosen ratios.");
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
      document.getElementById("la-max-housing").textContent =
        `${asCurrency(maxHousing)} (front: ${asCurrency(maxHousingFront)}, back: ${asCurrency(maxHousingBack)})`;

      resultBox.hidden = false;
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resultBox.hidden = true;
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Loan-Affordability-Calculator") {
      initLoanAffordability();
    }
  });
})();
