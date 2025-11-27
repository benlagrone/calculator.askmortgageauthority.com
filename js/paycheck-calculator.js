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

  function initPaycheckCalc() {
    const form = document.getElementById("paycheck-calculator-form");
    if (!form) return;

    const resultsBox = document.getElementById("pc-results");
    const noteBox = document.getElementById("pc-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const gross = toNumber(form.gross.value);
      const pretax = toNumber(form.pretax.value);
      const federal = toNumber(form.federal.value);
      const state = toNumber(form.state.value);
      const posttax = toNumber(form.posttax.value);
      const frequency = toNumber(form.frequency.value) || 1;

      if (gross <= 0) {
        alert("Enter gross pay per check.");
        return;
      }

      const taxable = Math.max(0, gross - pretax);
      const taxRate = (federal + state) / 100;
      const taxes = taxable * taxRate;
      const net = taxable - taxes - posttax;

      const annualGross = gross * frequency;
      const annualNet = net * frequency;

      document.getElementById("pc-taxable").textContent = currencyFmt.format(taxable);
      document.getElementById("pc-taxes").textContent = currencyFmt.format(taxes);
      document.getElementById("pc-net").textContent = currencyFmt.format(net);
      document.getElementById("pc-annual-gross").textContent = currencyFmt.format(annualGross);
      document.getElementById("pc-annual-net").textContent = currencyFmt.format(annualNet);

      noteBox.innerHTML = `<span class="text-muted">Taxes use the combined federal+state rates you entered and apply to gross minus pre-tax deductions. Does not include FICA or local taxes.</span>`;
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
    if (evt.detail?.calculatorType === "Paycheck-Calculator") {
      initPaycheckCalc();
    }
  });
})();
