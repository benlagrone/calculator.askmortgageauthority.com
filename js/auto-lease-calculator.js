(() => {
  const currencyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  const toNumber = (val) => {
    if (val === undefined || val === null) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  function initAutoLease() {
    const form = document.getElementById("auto-lease-form");
    if (!form) return;

    const resultsBox = document.getElementById("lease-results");
    const noteBox = document.getElementById("lease-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const price = toNumber(form.price.value);
      const down = toNumber(form.down.value);
      const residualPct = toNumber(form.residualPct.value);
      const moneyFactor = toNumber(form.moneyFactor.value);
      const termMonths = toNumber(form.termMonths.value);
      const fees = toNumber(form.fees.value);
      const taxPct = toNumber(form.taxPct.value);

      if (price <= 0 || termMonths <= 0 || residualPct <= 0 || moneyFactor < 0) {
        alert("Enter price, residual %, money factor, and term.");
        return;
      }

      const capCost = Math.max(0, price + fees - down);
      const residualAmount = price * (residualPct / 100);
      const depreciation = (capCost - residualAmount) / termMonths;
      const financeCharge = (capCost + residualAmount) * moneyFactor;
      const basePayment = depreciation + financeCharge;
      const paymentWithTax = basePayment * (1 + taxPct / 100);
      const totalPaid = paymentWithTax * termMonths + down;

      document.getElementById("lease-cap").textContent = currencyFmt.format(capCost);
      document.getElementById("lease-residual-amt").textContent = currencyFmt.format(residualAmount);
      document.getElementById("lease-base-payment").textContent = currencyFmt.format(basePayment);
      document.getElementById("lease-total-payment").textContent = currencyFmt.format(paymentWithTax);
      document.getElementById("lease-total-paid").textContent = currencyFmt.format(totalPaid);

      noteBox.innerHTML = `<span class="text-muted">Base payment = depreciation + finance charge. Money factor ~ APR/2400. Taxes apply per state rules.</span>`;
      resultsBox.hidden = false;
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resultsBox.hidden = true;
        noteBox.textContent = "";
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Auto-Lease-Calculator") {
      initAutoLease();
    }
  });
})();
