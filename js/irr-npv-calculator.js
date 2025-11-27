(() => {
  const currencyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const toNumber = (val) => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const asCurrency = (val) => currencyFmt.format(isFinite(val) ? val : 0);

  function npv(ratePct, cashflows) {
    const r = ratePct / 100;
    return cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + r, i), 0);
  }

  function irr(cashflows, guess = 0.1) {
    const maxIter = 1000;
    const tol = 1e-7;
    let rate = guess;
    for (let i = 0; i < maxIter; i++) {
      let npvVal = 0;
      let dNpv = 0;
      for (let t = 0; t < cashflows.length; t++) {
        const cf = cashflows[t];
        const denom = Math.pow(1 + rate, t);
        npvVal += cf / denom;
        if (t > 0) {
          dNpv -= (t * cf) / (Math.pow(1 + rate, t + 1));
        }
      }
      if (Math.abs(npvVal) < tol) return rate * 100;
      if (dNpv === 0) break;
      const newRate = rate - npvVal / dNpv;
      if (!isFinite(newRate)) break;
      if (Math.abs(newRate - rate) < tol) return newRate * 100;
      rate = newRate;
    }
    return null;
  }

  function renderCashflows(container) {
    container.innerHTML = "";
    for (let i = 0; i <= 9; i++) {
      const col = document.createElement("div");
      col.className = "col-12 col-md-6";
      col.innerHTML = `
        <label class="mortgage-calculators-widget-label theme-body-text col-form-label" for="cf-${i}">Cash Flow ${i}</label>
        <input class="mortgage-calculators-widget-input form-control" type="text" id="cf-${i}" name="cashFlow${i}" autocomplete="off" placeholder="0">
      `;
      container.appendChild(col);
    }
  }

  function initIrrNpv() {
    const form = document.getElementById("irr-npv-form");
    if (!form) return;
    const flowsContainer = document.getElementById("irr-cashflows");
    renderCashflows(flowsContainer);

    const resultBox = document.getElementById("irr-npv-results");
    const npvEl = document.getElementById("irr-npv");
    const irrEl = document.getElementById("irr-rate");
    const discountEl = form.discountRate;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const ratePct = toNumber(discountEl.value);
      const cashflows = [];
      for (let i = 0; i <= 9; i++) {
        const input = document.getElementById(`cf-${i}`);
        cashflows.push(toNumber(input.value));
      }
      if (cashflows.length === 0) return;

      const npvVal = npv(ratePct, cashflows);
      const irrPct = irr(cashflows, 0.1);

      npvEl.textContent = asCurrency(npvVal);
      irrEl.textContent = irrPct !== null ? `${irrPct.toFixed(4)}%` : "N/A";
      resultBox.hidden = false;
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resultBox.hidden = true;
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "IRR-NPV-Calculator") {
      initIrrNpv();
    }
  });
})();
