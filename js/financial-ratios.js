(() => {
  const pctFmt = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const toNumber = (val) => {
    if (val === undefined || val === null) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const formatRatio = (val) => (isFinite(val) ? val.toFixed(2) : "--");

  function initFinancialRatios() {
    const form = document.getElementById("financial-ratios-form");
    if (!form) return;

    const resultsBox = document.getElementById("fr-results");
    const noteBox = document.getElementById("fr-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const currentAssets = toNumber(form.currentAssets.value);
      const currentLiabilities = toNumber(form.currentLiabilities.value);
      const totalDebt = toNumber(form.totalDebt.value);
      const totalEquity = toNumber(form.totalEquity.value);
      const revenue = toNumber(form.revenue.value);
      const netIncome = toNumber(form.netIncome.value);

      if (currentAssets <= 0 || currentLiabilities <= 0 || totalEquity <= 0 || revenue <= 0) {
        alert("Enter positive values for assets, liabilities, equity, and revenue.");
        return;
      }

      const currentRatio = currentAssets / currentLiabilities;
      const debtToEquity = totalDebt / totalEquity;
      const profitMargin = netIncome / revenue;
      const roe = netIncome / totalEquity;

      document.getElementById("fr-current-ratio").textContent = formatRatio(currentRatio);
      document.getElementById("fr-dte").textContent = formatRatio(debtToEquity);
      document.getElementById("fr-margin").textContent = pctFmt.format(profitMargin);
      document.getElementById("fr-roe").textContent = pctFmt.format(roe);

      noteBox.innerHTML = `<span class="text-muted">Current Ratio = CA / CL, Debt-to-Equity = Debt / Equity, Profit Margin = Net Income / Revenue, ROE = Net Income / Equity.</span>`;
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
    if (evt.detail?.calculatorType === "Financial-Ratios") {
      initFinancialRatios();
    }
  });
})();
