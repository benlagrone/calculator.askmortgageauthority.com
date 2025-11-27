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

  function initCapm() {
    const form = document.getElementById("capm-form");
    if (!form) return;

    const resultsBox = document.getElementById("capm-results");
    const noteBox = document.getElementById("capm-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const riskFree = toNumber(form.riskFree.value);
      const beta = toNumber(form.beta.value);
      const marketReturn = toNumber(form.marketReturn.value);

      if (marketReturn === 0 && riskFree === 0 && beta === 0) {
        alert("Enter risk-free, beta, and market return.");
        return;
      }

      const marketPremium = marketReturn - riskFree;
      const expected = riskFree + beta * marketPremium;

      document.getElementById("capm-premium").textContent = pctFmt.format(marketPremium / 100);
      document.getElementById("capm-expected").textContent = pctFmt.format(expected / 100);

      noteBox.innerHTML = `<span class="text-muted">Expected return = ${riskFree.toFixed(2)}% + ${beta.toFixed(2)} × (${marketReturn.toFixed(2)}% − ${riskFree.toFixed(2)}%).</span>`;
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
    if (evt.detail?.calculatorType === "CAPM-Calculator") {
      initCapm();
    }
  });
})();
