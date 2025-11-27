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

  function monthlyPayment(principal, ratePct, months) {
    if (months <= 0) return 0;
    const r = ratePct / 100 / 12;
    if (r === 0) return principal / months;
    return (principal * r) / (1 - Math.pow(1 + r, -months));
  }

  function remainingBalance(principal, ratePct, totalMonths, paymentsMade) {
    const r = ratePct / 100 / 12;
    const pmt = monthlyPayment(principal, ratePct, totalMonths);
    if (r === 0) return principal - pmt * paymentsMade;
    return (
      principal * Math.pow(1 + r, paymentsMade) -
      pmt * ((Math.pow(1 + r, paymentsMade) - 1) / r)
    );
  }

  function initLoanRefinance() {
    const form = document.getElementById("loan-refinance-form");
    if (!form) return;
    const resultBox = document.getElementById("loan-refinance-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const loanAmount = toNumber(form.loanAmount.value);
      const rateOld = toNumber(form.interestRate.value);
      const yearsOld = toNumber(form.years.value);
      const monthsOld = toNumber(form.months.value);
      const paid = toNumber(form.paymentMade.value);
      const rateNew = toNumber(form.interestRateNew.value);
      const yearsNew = toNumber(form.yearsNew.value);
      const monthsNew = toNumber(form.monthsNew.value);

      const totalMonthsOld = yearsOld * 12 + monthsOld;
      const totalMonthsNew = yearsNew * 12 + monthsNew;
      if (!loanAmount || !rateOld || !totalMonthsOld || !rateNew || !totalMonthsNew) {
        alert("Enter amount, rates, and terms.");
        return;
      }

      const paidMonths = Math.min(paid, totalMonthsOld);
      const mpOld = monthlyPayment(loanAmount, rateOld, totalMonthsOld);
      const balanceOld = remainingBalance(loanAmount, rateOld, totalMonthsOld, paidMonths);
      const remainingMonthsOld = totalMonthsOld - paidMonths;
      const totalPayRemainingOld = mpOld * remainingMonthsOld;
      const remainingInterestOld = totalPayRemainingOld - balanceOld;

      const mpNew = monthlyPayment(balanceOld, rateNew, totalMonthsNew);
      const totalPayNew = mpNew * totalMonthsNew;
      const interestNew = totalPayNew - balanceOld;
      const interestSaved = remainingInterestOld - interestNew;

      document.getElementById("lr-balance-old").textContent = asCurrency(balanceOld);
      document.getElementById("lr-monthly-old").textContent = asCurrency(mpOld);
      document.getElementById("lr-interest-old").textContent = asCurrency(remainingInterestOld);

      document.getElementById("lr-total-new").textContent = asCurrency(totalPayNew);
      document.getElementById("lr-monthly-new").textContent = asCurrency(mpNew);
      document.getElementById("lr-interest-new").textContent = asCurrency(interestNew);
      document.getElementById("lr-saved").textContent = asCurrency(interestSaved);

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
    if (evt.detail?.calculatorType === "Loan-Refinance-Calculator") {
      initLoanRefinance();
    }
  });
})();
