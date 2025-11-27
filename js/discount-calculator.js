(() => {
  const currencyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const toNumber = (val) => {
    if (val === undefined || val === null) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  function initDiscount() {
    const form = document.getElementById("discount-calculator-form");
    if (!form) return;

    const resultsBox = document.getElementById("disc-results");
    const noteBox = document.getElementById("disc-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const price = toNumber(form.price.value);
      const percent = toNumber(form.percent.value);
      const taxPct = toNumber(form.tax.value);

      if (price <= 0 || percent < 0) {
        alert("Enter a price and discount percent.");
        return;
      }

      const discountAmount = price * (percent / 100);
      const subtotal = Math.max(0, price - discountAmount);
      const taxAmount = subtotal * (taxPct / 100);
      const finalPrice = subtotal + taxAmount;

      document.getElementById("disc-amount").textContent = currencyFmt.format(discountAmount);
      document.getElementById("disc-subtotal").textContent = currencyFmt.format(subtotal);
      document.getElementById("disc-tax-amount").textContent = currencyFmt.format(taxAmount);
      document.getElementById("disc-final").textContent = currencyFmt.format(finalPrice);

      noteBox.innerHTML = `<span class="text-muted">Discount applied before tax. Tax uses the discounted subtotal.</span>`;
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
    if (evt.detail?.calculatorType === "Discount-Calculator") {
      initDiscount();
    }
  });
})();
