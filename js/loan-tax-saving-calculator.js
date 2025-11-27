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

  function monthlyPayment(principal, annualRatePct, termYears) {
    const n = termYears * 12;
    const r = annualRatePct / 100 / 12;
    if (n <= 0) return 0;
    if (r === 0) return principal / n;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }

  function initLoanTaxSaving() {
    const form = document.getElementById("loan-tax-saving-form");
    if (!form) return;
    const resultBox = document.getElementById("loan-tax-saving-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const loanAmount = toNumber(form.loanAmount.value);
      const rate = toNumber(form.interestRate.value);
      const years = toNumber(form.years.value);
      const propTax = toNumber(form.propertyTax.value);
      const bracket = toNumber(form.taxBracket.value) / 100;

      if (!loanAmount || !rate || !years) {
        alert("Enter loan amount, rate, and term.");
        return;
      }

      const pmt = monthlyPayment(loanAmount, rate, years);
      const totalPayment = pmt * years * 12;
      const totalInterest = totalPayment - loanAmount;
      const totalPropertyTax = propTax * years;
      const taxSaving = (totalInterest + totalPropertyTax) * bracket;

      document.getElementById("lts-monthly").textContent = asCurrency(pmt);
      document.getElementById("lts-total").textContent = asCurrency(totalPayment);
      document.getElementById("lts-interest").textContent = asCurrency(totalInterest);
      document.getElementById("lts-prop-tax").textContent = asCurrency(totalPropertyTax);
      document.getElementById("lts-saving").textContent = asCurrency(taxSaving);

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
    if (evt.detail?.calculatorType === "Loan-Tax-Saving-Calculator") {
      initLoanTaxSaving();
    }
  });
})();
