(() => {
  const currencyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
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

  function initNetDistribution() {
    const form = document.getElementById("net-distribution-form");
    if (!form) return;

    const resultsBox = document.getElementById("nd-results");
    const noteBox = document.getElementById("nd-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const amount = toNumber(form.amount.value);
      const federal = toNumber(form.federal.value);
      const state = toNumber(form.state.value);
      const other = toNumber(form.other.value);

      if (amount <= 0) {
        alert("Enter a gross distribution greater than 0.");
        return;
      }

      const taxRate = (federal + state) / 100;
      const taxWithheld = amount * taxRate;
      const net = amount - taxWithheld - other;
      const effectivePct = (taxWithheld + other) / amount;

      document.getElementById("nd-tax").textContent = currencyFmt.format(taxWithheld);
      document.getElementById("nd-other-out").textContent = currencyFmt.format(other);
      document.getElementById("nd-net").textContent = currencyFmt.format(net);
      document.getElementById("nd-effective").textContent = pctFmt.format(effectivePct);

      noteBox.innerHTML = `<span class="text-muted">Combines federal and state withholding plus other deductions to show net proceeds.</span>`;
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
    if (evt.detail?.calculatorType === "Net-Distribution-Calculator") {
      initNetDistribution();
    }
  });
})();
