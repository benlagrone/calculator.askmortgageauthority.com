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

  const fvMonthly = (pv, monthly, annualRatePct, years) => {
    const r = annualRatePct / 100 / 12;
    const n = Math.max(0, years * 12);
    if (n === 0) return pv;
    if (r === 0) return pv + monthly * n;
    return pv * Math.pow(1 + r, n) + monthly * ((Math.pow(1 + r, n) - 1) / r);
  };

  function initIraRoth() {
    const form = document.getElementById("ira-roth-form");
    if (!form) return;

    const resultsBox = document.getElementById("ir-results");
    const noteBox = document.getElementById("ir-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const current = toNumber(form.current.value);
      const monthly = toNumber(form.monthly.value);
      const years = toNumber(form.years.value);
      const annualReturn = toNumber(form.annualReturn.value);
      const taxNow = toNumber(form.taxNow.value);
      const taxLater = toNumber(form.taxLater.value);

      if (years < 0 || annualReturn < 0 || taxNow < 0 || taxLater < 0) {
        alert("Enter non-negative values for years, returns, and tax rates.");
        return;
      }

      // Traditional: full monthly is invested pre-tax; tax hits at retirement.
      const tradBalance = fvMonthly(current, monthly, annualReturn, years);
      const tradAfterTax = tradBalance * (1 - taxLater / 100);

      // Roth: contributions are after-tax today; growth is tax-free.
      const rothMonthly = monthly * (1 - taxNow / 100);
      const rothBalance = fvMonthly(current, rothMonthly, annualReturn, years);

      const diff = rothBalance - tradAfterTax;

      document.getElementById("ir-trad-balance").textContent = currencyFmt.format(tradBalance);
      document.getElementById("ir-trad-after").textContent = currencyFmt.format(tradAfterTax);
      document.getElementById("ir-roth-balance").textContent = currencyFmt.format(rothBalance);
      document.getElementById("ir-difference").textContent = currencyFmt.format(diff);

      if (diff > 0) {
        noteBox.innerHTML = `<span class="text-success">Roth comes out ahead by ${currencyFmt.format(diff)} after taxes.</span>`;
      } else if (diff < 0) {
        noteBox.innerHTML = `<span class="text-danger">Traditional comes out ahead by ${currencyFmt.format(Math.abs(diff))} after taxes.</span>`;
      } else {
        noteBox.innerHTML = `<span class="text-muted">Both approaches are equal with these assumptions.</span>`;
      }

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
    if (evt.detail?.calculatorType === "Traditional-IRA-vs-Roth-IRA") {
      initIraRoth();
    }
  });
})();
