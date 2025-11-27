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

  function monthlyPayment({ amount, annualRatePct, years }) {
    const n = years * 12;
    const r = annualRatePct / 100 / 12;
    if (n <= 0) return 0;
    if (r === 0) return amount / n;
    return (amount * r) / (1 - Math.pow(1 + r, -n));
  }

  function calcTotals({ amount, monthly, years }) {
    const n = years * 12;
    const totalPayment = monthly * n;
    const totalInterest = totalPayment - amount;
    return { totalPayment, totalInterest };
  }

  function initLoanComparison() {
    const form = document.getElementById("loan-comparison-form");
    if (!form) return;
    const resultBox = document.getElementById("loan-comparison-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const amount = toNumber(form.loanAmount.value);
      const years1 = toNumber(form.years1.value);
      const rate1 = toNumber(form.interestRate1.value);
      const years2 = toNumber(form.years2.value);
      const rate2 = toNumber(form.interestRate2.value);

      if (!amount || !years1 || !rate1 || !years2 || !rate2) {
        alert("Please enter loan amount, both terms, and both rates.");
        return;
      }

      const mp1 = monthlyPayment({ amount, annualRatePct: rate1, years: years1 });
      const mp2 = monthlyPayment({ amount, annualRatePct: rate2, years: years2 });
      const t1 = calcTotals({ amount, monthly: mp1, years: years1 });
      const t2 = calcTotals({ amount, monthly: mp2, years: years2 });

      document.getElementById("lc-monthly1").textContent = asCurrency(mp1);
      document.getElementById("lc-monthly2").textContent = asCurrency(mp2);
      document.getElementById("lc-total1").textContent = asCurrency(t1.totalPayment);
      document.getElementById("lc-total2").textContent = asCurrency(t2.totalPayment);
      document.getElementById("lc-interest1").textContent = asCurrency(t1.totalInterest);
      document.getElementById("lc-interest2").textContent = asCurrency(t2.totalInterest);

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
    if (evt.detail?.calculatorType === "Loan-Comparison-Calculator") {
      initLoanComparison();
    }
  });
})();
