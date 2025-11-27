(() => {
  const pctFmt = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  });

  const toNumber = (val) => {
    if (val === undefined || val === null) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  function initEffectiveRate() {
    const form = document.getElementById("effective-rate-form");
    if (!form) return;

    const resultsBox = document.getElementById("effective-rate-results");
    const noteBox = document.getElementById("er-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const nominal = toNumber(form.nominal.value);
      const periods = toNumber(form.periods.value);

      if (nominal < 0 || periods <= 0) {
        alert("Enter nominal rate >= 0 and periods per year > 0.");
        return;
      }

      const r = nominal / 100;
      const periodic = r / periods;
      const effective = Math.pow(1 + periodic, periods) - 1;

      document.getElementById("er-effective").textContent = pctFmt.format(effective);
      document.getElementById("er-periodic").textContent = pctFmt.format(periodic);

      noteBox.innerHTML = `<span class="text-muted">EAR = (1 + nominal/periods)^periods − 1. Periodic rate is nominal / periods.</span>`;
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
    if (evt.detail?.calculatorType === "Effective-Rate-Calculator") {
      initEffectiveRate();
    }
  });
})();
