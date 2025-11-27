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

  function initHpr() {
    const form = document.getElementById("hpr-form");
    if (!form) return;

    const resultsBox = document.getElementById("hpr-results");
    const noteBox = document.getElementById("hpr-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const shares = toNumber(form.shares.value);
      const buyPrice = toNumber(form.buyPrice.value);
      const sellPrice = toNumber(form.sellPrice.value);
      const dividends = toNumber(form.dividends.value);
      const yearsHeld = toNumber(form.yearsHeld.value);

      if (shares <= 0 || buyPrice < 0 || sellPrice < 0) {
        alert("Enter shares, buy price, and sell price.");
        return;
      }

      const cost = shares * buyPrice;
      const endingValue = shares * sellPrice + dividends;
      const gain = endingValue - cost;
      const totalReturn = cost > 0 ? gain / cost : 0;
      const annualized = yearsHeld > 0 ? cagr(cost, endingValue, yearsHeld) : 0;

      document.getElementById("hpr-cost").textContent = currencyFmt.format(cost);
      document.getElementById("hpr-ending").textContent = currencyFmt.format(endingValue);
      document.getElementById("hpr-gain").textContent = currencyFmt.format(gain);
      document.getElementById("hpr-total-return").textContent = pctFmt.format(totalReturn);
      document.getElementById("hpr-cagr").textContent = pctFmt.format(annualized);

      noteBox.innerHTML = `<span class="text-muted">Holding Period Return includes dividends. Taxes and fees are not included.</span>`;
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
    if (evt.detail?.calculatorType === "Holding-Period-Return-Calculator") {
      initHpr();
    }
  });
})();
