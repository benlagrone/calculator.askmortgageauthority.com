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

  function initExpectedReturn() {
    const form = document.getElementById("expected-return-form");
    if (!form) return;

    const resultsBox = document.getElementById("er-results");
    const noteBox = document.getElementById("er-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const aR = toNumber(form.aReturn.value);
      const bR = toNumber(form.bReturn.value);
      const cR = toNumber(form.cReturn.value);
      const aW = toNumber(form.aWeight.value);
      const bW = toNumber(form.bWeight.value);
      const cW = toNumber(form.cWeight.value);

      const totalWeight = aW + bW + cW;
      if (Math.abs(totalWeight - 100) > 20) {
        alert("Weights should roughly total 100%. Adjust weights and try again.");
        return;
      }

      const expected = (aR * aW + bR * bW + cR * cW) / 100;

      document.getElementById("er-expected").textContent = pctFmt.format(expected / 100);
      document.getElementById("er-weight-check").textContent = `${totalWeight.toFixed(1)}%`;

      const within = Math.abs(totalWeight - 100) <= 0.5;
      noteBox.innerHTML = within
        ? `<span class="text-muted">Weights total ${totalWeight.toFixed(1)}%. Calculation assumes weights sum to 100%.</span>`
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
    if (evt.detail?.calculatorType === "Expected-Return-Calculator") {
      initExpectedReturn();
    }
  });
})();
