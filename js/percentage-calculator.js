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

  function initPercentageCalc() {
    const form = document.getElementById("percentage-calculator-form");
    if (!form) return;

    const resultsBox = document.getElementById("pc-results");
    const noteBox = document.getElementById("pc-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const base = toNumber(form.base.value);
      const part = toNumber(form.part.value);
      const percent = toNumber(form.percent.value);

      if (base <= 0) {
        alert("Enter a base number greater than 0.");
        return;
      }

      const partOfBasePct = part / base;
      const percentOfBase = base * (percent / 100);
      const increased = base * (1 + percent / 100);
      const decreased = base * (1 - percent / 100);

      document.getElementById("pc-part-of-base").textContent = pctFmt.format(partOfBasePct);
      document.getElementById("pc-percent-of-base").textContent = currencyFmt.format(percentOfBase);
      document.getElementById("pc-increase").textContent = currencyFmt.format(increased);
      document.getElementById("pc-decrease").textContent = currencyFmt.format(decreased);

      noteBox.innerHTML = `<span class="text-muted">Parts use Base = ${base}. Percent increase/decrease uses the same percent input.</span>`;
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
    if (evt.detail?.calculatorType === "Percentage-Calculator") {
      initPercentageCalc();
    }
  });
})();
