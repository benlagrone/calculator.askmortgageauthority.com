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

  function initAnnuity() {
    const form = document.getElementById("annuity-calculator-form");
    if (!form) return;

    const resultsBox = document.getElementById("annuity-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const pv = toNumber(form.balance.value);
      const annualRate = toNumber(form.rate.value);
      const years = toNumber(form.years.value);
      const periods = toNumber(form.periods.value) || 1;

      if (pv <= 0 || years <= 0 || periods <= 0) {
        alert("Enter balance, years, and payments per year.");
        return;
      }

      const r = annualRate / 100 / periods;
      const n = years * periods;

      let payment;
      if (r === 0) {
        payment = pv / n;
      } else {
        payment = (pv * r) / (1 - Math.pow(1 + r, -n));
      }

      const totalPaid = payment * n;
      const totalInterest = totalPaid - pv;

      document.getElementById("annuity-payment").textContent = currencyFmt.format(payment);
      document.getElementById("annuity-total").textContent = currencyFmt.format(totalPaid);
      document.getElementById("annuity-interest").textContent = currencyFmt.format(totalInterest);

      resultsBox.hidden = false;
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resultsBox.hidden = true;
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Annuity-Calculator") {
      initAnnuity();
    }
  });
})();
