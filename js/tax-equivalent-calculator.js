(() => {
  const toNumber = (val) => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const setText = (el, text) => {
    el.textContent = text;
  };

  function calc() {
    const taxfreeYield = toNumber(document.getElementById("tey-taxfree").value);
    const incomeTaxRate = toNumber(document.getElementById("tey-rate").value);
    const taxableYield = toNumber(document.getElementById("tey-taxable").value);
    const incomeTaxRate2 = toNumber(document.getElementById("tey-rate2").value);

    const taxableOut = document.getElementById("tey-taxable-out");
    const taxfreeOut = document.getElementById("tey-taxfree-out");

    if (taxfreeYield && incomeTaxRate < 100) {
      const val = taxfreeYield / (1 - incomeTaxRate / 100);
      setText(taxableOut, `${val.toFixed(4)}%`);
    } else {
      setText(taxableOut, "");
    }

    if (taxableYield && incomeTaxRate2 < 100) {
      const val = taxableYield * (1 - incomeTaxRate2 / 100);
      setText(taxfreeOut, `${val.toFixed(4)}%`);
    } else {
      setText(taxfreeOut, "");
    }
  }

  function initTaxEquivalent() {
    const form = document.getElementById("tax-equivalent-form");
    if (!form) return;
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => input.addEventListener("input", calc));
    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        setText(document.getElementById("tey-taxable-out"), "");
        setText(document.getElementById("tey-taxfree-out"), "");
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Tax-Equivalent-Yield-Calculator") {
      initTaxEquivalent();
    }
  });
})();
