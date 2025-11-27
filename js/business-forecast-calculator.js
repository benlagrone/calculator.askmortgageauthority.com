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
    maximumFractionDigits: 1
  });

  const toNumber = (val) => {
    if (val === undefined || val === null) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  function initBusinessForecast() {
    const form = document.getElementById("business-forecast-form");
    if (!form) return;

    const resultsBox = document.getElementById("bf-results");
    const noteBox = document.getElementById("bf-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const revenue = toNumber(form.revenue.value);
      const growth = toNumber(form.growth.value);
      const years = toNumber(form.years.value);
      const margin = toNumber(form.margin.value);

      if (revenue <= 0 || years <= 0) {
        alert("Enter revenue greater than 0 and years greater than 0.");
        return;
      }

      const g = growth / 100;
      let cumulative = 0;
      let current = revenue;
      for (let i = 0; i < years; i++) {
        cumulative += current;
        current *= 1 + g;
      }

      const finalRevenue = current / (1 + g); // adjust: last loop multiplied after adding
      const finalProfit = finalRevenue * (margin / 100);

      document.getElementById("bf-final-revenue").textContent = currencyFmt.format(finalRevenue);
      document.getElementById("bf-final-profit").textContent = currencyFmt.format(finalProfit);
      document.getElementById("bf-cumulative-revenue").textContent = currencyFmt.format(cumulative);

      noteBox.innerHTML = `<span class="text-muted">Growth applied annually at ${pctFmt.format(growth / 100)} with profit margin ${pctFmt.format(margin / 100)}.</span>`;
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
    if (evt.detail?.calculatorType === "Business-Forecast-Calculator") {
      initBusinessForecast();
    }
  });
})();
