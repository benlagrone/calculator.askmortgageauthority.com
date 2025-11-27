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

  function initGrowthStock() {
    const form = document.getElementById("growth-stock-form");
    if (!form) return;

    const resultsBox = document.getElementById("gs-results");
    const noteBox = document.getElementById("gs-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const shares = toNumber(form.shares.value);
      const price = toNumber(form.price.value);
      const growth = toNumber(form.growth.value);
      const yieldPct = toNumber(form.yield.value);
      const years = toNumber(form.years.value);

      if (shares <= 0 || price <= 0 || years < 0) {
        alert("Enter shares, price, and years.");
        return;
      }

      const startValue = shares * price;
      const futurePrice = price * Math.pow(1 + growth / 100, years);
      const futureValue = shares * futurePrice;

      // Dividend stream on growing price (geometric series)
      let dividendsPerShare = 0;
      if (years === 0) {
        dividendsPerShare = 0;
      } else if (growth === 0) {
        dividendsPerShare = price * (yieldPct / 100) * years;
      } else {
        const g = growth / 100;
        dividendsPerShare =
          price * (yieldPct / 100) * ((Math.pow(1 + g, years) - 1) / g);
      }
      const totalDividends = dividendsPerShare * shares;

      const totalEndValue = futureValue + totalDividends;
      const gain = totalEndValue - startValue;
      const totalReturn = startValue > 0 ? gain / startValue : 0;
      const annualized = cagr(startValue, totalEndValue, years > 0 ? years : 1);

      document.getElementById("gs-future-price").textContent = currencyFmt.format(futurePrice);
      document.getElementById("gs-future-value").textContent = currencyFmt.format(futureValue);
      document.getElementById("gs-dividends").textContent = currencyFmt.format(totalDividends);
      document.getElementById("gs-gain").textContent = currencyFmt.format(gain);
      document.getElementById("gs-total-return").textContent = pctFmt.format(totalReturn);
      document.getElementById("gs-cagr").textContent = pctFmt.format(annualized);

      noteBox.innerHTML = `<span class="text-muted">Dividends assumed to track the growing price (constant yield). Taxes and commissions not included.</span>`;
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
    if (evt.detail?.calculatorType === "Growth-Stock-Calculator") {
      initGrowthStock();
    }
  });
})();
