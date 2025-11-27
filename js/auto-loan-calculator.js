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

  function initAutoLoan() {
    const form = document.getElementById("auto-loan-form");
    if (!form) return;

    const resultsBox = document.getElementById("auto-results");
    const noteBox = document.getElementById("auto-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const price = toNumber(form.price.value);
      const down = toNumber(form.downPayment.value);
      const rate = toNumber(form.rate.value);
      const termMonths = toNumber(form.termMonths.value);
      const taxPct = toNumber(form.taxPct.value);

      if (price <= 0 || termMonths <= 0) {
        alert("Enter a vehicle price and term.");
        return;
      }

      const taxAmount = price * (taxPct / 100);
      const loanAmount = Math.max(0, price + taxAmount - down);
      const r = rate / 100 / 12;
      let payment;
      if (r === 0) {
        payment = loanAmount / termMonths;
      } else {
        payment = (loanAmount * r) / (1 - Math.pow(1 + r, -termMonths));
      }

      const totalPaid = payment * termMonths + down;
      const totalInterest = totalPaid - price - taxAmount;

      document.getElementById("auto-loan-amount").textContent = currencyFmt.format(loanAmount);
      document.getElementById("auto-payment").textContent = currencyFmt.format(payment);
      document.getElementById("auto-total-paid").textContent = currencyFmt.format(totalPaid);
      document.getElementById("auto-total-interest").textContent = currencyFmt.format(totalInterest);

      noteBox.innerHTML = `<span class="text-muted">Includes sales tax of ${taxPct}% and your down payment.</span>`;
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
    if (evt.detail?.calculatorType === "Auto-Loan-Calculator") {
      initAutoLoan();
    }
  });
})();
