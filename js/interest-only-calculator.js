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

  function initInterestOnly() {
    const form = document.getElementById("interest-only-form");
    if (!form) return;
    const resultBox = document.getElementById("interest-only-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const amount = toNumber(form.loanAmount.value);
      const rate = toNumber(form.interestRate.value);
      const months = toNumber(form.months.value) + toNumber(form.years.value) * 12;

      if (!amount || !rate || months <= 0) {
        alert("Enter loan amount, rate, and term.");
        return;
      }

      const r = rate / 100 / 12;
      const monthlyInterestOnly = amount * r;
      const totalPayment = monthlyInterestOnly * months + amount; // includes balloon
      const totalInterest = monthlyInterestOnly * months;

      document.getElementById("io-monthly").textContent = asCurrency(monthlyInterestOnly);
      document.getElementById("io-total").textContent = asCurrency(totalPayment);
      document.getElementById("io-interest").textContent = asCurrency(totalInterest);
      document.getElementById("io-balloon").textContent = asCurrency(amount);
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
    if (evt.detail?.calculatorType === "Loan-Interest-Only-Calculator") {
      initInterestOnly();
    }
  });
})();
