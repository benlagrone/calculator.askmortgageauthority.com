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

  const presets = {
    conservative: { stocks: 40, bonds: 50, cash: 10 },
    moderate: { stocks: 60, bonds: 30, cash: 10 },
    growth: { stocks: 75, bonds: 20, cash: 5 },
    aggressive: { stocks: 90, bonds: 10, cash: 0 }
  };

  function initAssetAllocation() {
    const form = document.getElementById("asset-allocation-form");
    if (!form) return;

    const resultsBox = document.getElementById("aa-results");
    const noteBox = document.getElementById("aa-note");
    const riskSelect = form.risk;

    const applyPreset = (key) => {
      const preset = presets[key];
      if (!preset) return;
      form.stocks.value = preset.stocks;
      form.bonds.value = preset.bonds;
      form.cash.value = preset.cash;
    };

    riskSelect.addEventListener("change", () => {
      if (riskSelect.value !== "custom") {
        applyPreset(riskSelect.value);
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const portfolio = toNumber(form.portfolio.value);
      const stocksPct = toNumber(form.stocks.value);
      const bondsPct = toNumber(form.bonds.value);
      const cashPct = toNumber(form.cash.value);
      const totalPct = stocksPct + bondsPct + cashPct;

      if (portfolio <= 0) {
        alert("Enter a portfolio value.");
        return;
      }

      if (Math.abs(totalPct - 100) > 0.5) {
        alert("Percentages should total 100% (within 0.5%).");
        return;
      }

      const stocksAmt = (stocksPct / 100) * portfolio;
      const bondsAmt = (bondsPct / 100) * portfolio;
      const cashAmt = (cashPct / 100) * portfolio;

      document.getElementById("aa-stocks-amt").textContent = `${currencyFmt.format(stocksAmt)} (${stocksPct.toFixed(1)}%)`;
      document.getElementById("aa-bonds-amt").textContent = `${currencyFmt.format(bondsAmt)} (${bondsPct.toFixed(1)}%)`;
      document.getElementById("aa-cash-amt").textContent = `${currencyFmt.format(cashAmt)} (${cashPct.toFixed(1)}%)`;

      const diff = 100 - totalPct;
      if (Math.abs(diff) <= 0.5) {
        noteBox.innerHTML = `<span class="text-muted">Allocation totals ${totalPct.toFixed(1)}%. Adjust as needed.</span>`;
      } else {
        noteBox.innerHTML = `<span class="text-danger">Allocation totals ${totalPct.toFixed(1)}%. Please rebalance to 100%.</span>`;
      }

      resultsBox.hidden = false;
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resultsBox.hidden = true;
        noteBox.textContent = "";
        riskSelect.value = "custom";
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Asset-Allocation-Calculator") {
      initAssetAllocation();
    }
  });
})();
