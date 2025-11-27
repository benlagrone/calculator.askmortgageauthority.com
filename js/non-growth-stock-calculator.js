(() => {
  const currencyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  const pctFmt = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  });

  const toNumber = (val) => {
    if (val === undefined || val === null) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const cagr = (start, end, years) => {
    if (start <= 0 || years <= 0) return 0;
    return Math.pow(end / start, 1 / years) - 1;
  };

  function initNonGrowth() {
    const form = document.getElementById("non-growth-stock-form");
    if (!form) return;

    const resultsBox = document.getElementById("ng-results");
    const noteBox = document.getElementById("ng-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const shares = toNumber(form.shares.value);
      const price = toNumber(form.price.value);
      const yieldPct = toNumber(form.yield.value);
      const drift = toNumber(form.drift.value);
      const years = toNumber(form.years.value);

      if (shares <= 0 || price <= 0 || years < 0) {
        alert("Enter shares, price, and years.");
        return;
      }

      const startValue = shares * price;
      const endPrice = price * Math.pow(1 + drift / 100, years);
      const endValue = shares * endPrice;

      // Dividend stream on (slightly) changing price
      let dividendsPerShare = 0;
      if (years === 0) {
        dividendsPerShare = 0;
      } else if (drift === 0) {
        dividendsPerShare = price * (yieldPct / 100) * years;
      } else {
        const g = drift / 100;
        dividendsPerShare =
          price * (yieldPct / 100) * ((Math.pow(1 + g, years) - 1) / g);
      }
      const totalDividends = dividendsPerShare * shares;

      const totalEndValue = endValue + totalDividends;
      const gain = totalEndValue - startValue;
      const totalReturn = startValue > 0 ? gain / startValue : 0;
      const annualized = cagr(startValue, totalEndValue, years > 0 ? years : 1);

      document.getElementById("ng-end-price").textContent = currencyFmt.format(endPrice);
      document.getElementById("ng-end-value").textContent = currencyFmt.format(endValue);
      document.getElementById("ng-dividends").textContent = currencyFmt.format(totalDividends);
      document.getElementById("ng-gain").textContent = currencyFmt.format(gain);
      document.getElementById("ng-total-return").textContent = pctFmt.format(totalReturn);
      document.getElementById("ng-cagr").textContent = pctFmt.format(annualized);

      noteBox.innerHTML = `<span class="text-muted">Assumes a mostly flat price with optional drift and dividends based on the evolving price. Taxes/fees not included.</span>`;
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
    if (evt.detail?.calculatorType === "Non-Growth-Stock-Calculator") {
      initNonGrowth();
    }
  });
})();
