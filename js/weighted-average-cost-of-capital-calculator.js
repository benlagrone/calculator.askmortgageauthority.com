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

  function initWacc() {
    const form = document.getElementById("wacc-form");
    if (!form) return;

    const resultsBox = document.getElementById("wacc-results");
    const noteBox = document.getElementById("wacc-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const we = toNumber(form.equityWeight.value);
      const re = toNumber(form.equityCost.value);
      const wd = toNumber(form.debtWeight.value);
      const rd = toNumber(form.debtCost.value);
      const tax = toNumber(form.taxRate.value);

      const totalWeight = we + wd;
      if (Math.abs(totalWeight - 100) > 20) {
        alert("Weights should roughly total 100%. Adjust weights and try again.");
        return;
      }

      const afterTaxDebt = rd * (1 - tax / 100);
      const weightedEquity = (we / 100) * re;
      const weightedDebt = (wd / 100) * afterTaxDebt;
      const wacc = weightedEquity + weightedDebt;

      document.getElementById("wacc-after-tax-debt").textContent = pctFmt.format(afterTaxDebt / 100);
      document.getElementById("wacc-weighted-equity").textContent = pctFmt.format(weightedEquity / 100);
      document.getElementById("wacc-weighted-debt").textContent = pctFmt.format(weightedDebt / 100);
      document.getElementById("wacc-total").textContent = pctFmt.format(wacc / 100);
      document.getElementById("wacc-weight-check").textContent = `${totalWeight.toFixed(1)}%`;

      const within = Math.abs(totalWeight - 100) <= 0.5;
      noteBox.innerHTML = within
        ? `<span class="text-muted">Weights total ${totalWeight.toFixed(1)}%. WACC = We×Re + Wd×Rd×(1−tax).</span>`
        : `<span class="text-warning">Weights total ${totalWeight.toFixed(1)}%. Result scaled using these weights.</span>`;

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
    if (evt.detail?.calculatorType === "Weighted-Average-Cost-of-Capital-Calculator") {
      initWacc();
    }
  });
})();
