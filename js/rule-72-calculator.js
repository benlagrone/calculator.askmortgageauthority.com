(() => {
  const toNumber = (val) => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  function calc() {
    const ratePct = toNumber(document.getElementById("r72-rate").value);
    const yearsToDouble = toNumber(document.getElementById("r72-years").value);

    const estYearsEl = document.getElementById("r72-est-years");
    const exactYearsEl = document.getElementById("r72-exact-years");
    const estRateEl = document.getElementById("r72-est-rate");
    const exactRateEl = document.getElementById("r72-exact-rate");

    if (ratePct > 0) {
      const estYears = 72 / ratePct;
      const exactYears = Math.log(2) / Math.log(1 + ratePct / 100);
      estYearsEl.textContent = `${estYears.toFixed(2)} years`;
      exactYearsEl.textContent = `${exactYears.toFixed(4)} years`;
    } else {
      estYearsEl.textContent = "";
      exactYearsEl.textContent = "";
    }

    if (yearsToDouble > 0) {
      const estRate = 72 / yearsToDouble;
      const exactRate = (Math.pow(2, 1 / yearsToDouble) - 1) * 100;
      estRateEl.textContent = `${estRate.toFixed(2)}%`;
      exactRateEl.textContent = `${exactRate.toFixed(4)}%`;
    } else {
      estRateEl.textContent = "";
      exactRateEl.textContent = "";
    }
  }

  function initRule72() {
    const form = document.getElementById("rule72-form");
    if (!form) return;
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => input.addEventListener("input", calc));
    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        document.getElementById("r72-est-years").textContent = "";
        document.getElementById("r72-exact-years").textContent = "";
        document.getElementById("r72-est-rate").textContent = "";
        document.getElementById("r72-exact-rate").textContent = "";
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Rule-72-Calculator") {
      initRule72();
    }
  });
})();
