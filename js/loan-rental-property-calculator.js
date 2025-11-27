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

  function monthlyPayment(principal, annualRatePct, years) {
    const n = years * 12;
    const r = annualRatePct / 100 / 12;
    if (n <= 0) return 0;
    if (r === 0) return principal / n;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }

  function initRentalProperty() {
    const form = document.getElementById("rental-property-form");
    if (!form) return;
    const resultBox = document.getElementById("rental-property-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const price = toNumber(form.price.value);
      const down = toNumber(form.downPayment.value);
      const rate = toNumber(form.rate.value);
      const years = toNumber(form.years.value);
      const rent = toNumber(form.rent.value);
      const vacancyPct = toNumber(form.vacancyPct.value) / 100;
      const taxAnnual = toNumber(form.propertyTax.value);
      const insAnnual = toNumber(form.insurance.value);
      const hoaMonthly = toNumber(form.hoa.value);
      const maintPct = toNumber(form.maintenancePct.value) / 100;
      const mgmtPct = toNumber(form.managementPct.value) / 100;

      const loan = Math.max(0, price - down);
      const pmt = monthlyPayment(loan, rate, years);

      const vacancyReserve = rent * vacancyPct;
      const maintMonthly = rent * maintPct;
      const mgmtMonthly = rent * mgmtPct;
      const monthlyExpenses =
        taxAnnual / 12 + insAnnual / 12 + hoaMonthly + vacancyReserve + maintMonthly + mgmtMonthly;

      const cashFlow = rent - monthlyExpenses - pmt;
      const annualCashFlow = cashFlow * 12;
      const noi = rent * 12 - vacancyReserve * 12 - maintMonthly * 12 - mgmtMonthly * 12 - taxAnnual - insAnnual - hoaMonthly * 12;
      const capRate = price > 0 ? (noi / price) * 100 : 0;
      const cocReturn = down > 0 ? (annualCashFlow / down) * 100 : 0;

      document.getElementById("rp-cashflow").textContent = asCurrency(cashFlow);
      document.getElementById("rp-annual-cashflow").textContent = asCurrency(annualCashFlow);
      document.getElementById("rp-cap-rate").textContent = `${capRate.toFixed(2)}%`;
      document.getElementById("rp-coc").textContent = `${cocReturn.toFixed(2)}%`;

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
    if (evt.detail?.calculatorType === "Loan-Rental-Property-Calculator") {
      initRentalProperty();
    }
  });
})();
