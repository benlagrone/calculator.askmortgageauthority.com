(() => {
  const currencyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
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

  const cagr = (start, end, years) => {
    if (start <= 0 || years <= 0) return 0;
    return Math.pow(end / start, 1 / years) - 1;
  };

  function initInflation() {
    const form = document.getElementById("us-inflation-form");
    if (!form) return;

    const resultsBox = document.getElementById("us-inflation-results");
    const noteBox = document.getElementById("inf-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const amount = toNumber(form.amount.value);
      const startCpi = toNumber(form.startCpi.value);
      const endCpi = toNumber(form.endCpi.value);
      const years = toNumber(form.years.value);

      if (amount <= 0 || startCpi <= 0 || endCpi <= 0) {
        alert("Enter amount and both CPI values.");
        return;
      }

      const ratio = endCpi / startCpi;
      const adjusted = amount * ratio;
      const totalInflation = ratio - 1;
      const annualInflation = years > 0 ? cagr(startCpi, endCpi, years) : 0;

      document.getElementById("inf-adjusted").textContent = currencyFmt.format(adjusted);
      document.getElementById("inf-total").textContent = pctFmt.format(totalInflation);
      document.getElementById("inf-annual").textContent = pctFmt.format(annualInflation);

      noteBox.innerHTML = `<span class="text-muted">Uses ratio of end CPI to start CPI${years > 0 ? " over " + years + " years" : ""}.</span>`;
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
    if (evt.detail?.calculatorType === "US-Inflation-Calculator") {
      initInflation();
    }
  });
})();
