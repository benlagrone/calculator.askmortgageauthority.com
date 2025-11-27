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

  function initLoanPoints() {
    const form = document.getElementById("loan-points-form");
    if (!form) return;
    const resultBox = document.getElementById("loan-points-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const loanAmount = toNumber(form.loanAmount.value);
      const years = toNumber(form.years.value);
      const rateBase = toNumber(form.rateBase.value);
      const ratePoints = toNumber(form.ratePoints.value);
      const pointsPct = toNumber(form.pointsPct.value);
      const closing = toNumber(form.closingCosts.value);

      if (!loanAmount || !years || !rateBase || !ratePoints) {
        alert("Enter loan amount, term, and both rates.");
        return;
      }

      const pointsCost = loanAmount * (pointsPct / 100) + closing;
      const pmtBase = monthlyPayment(loanAmount, rateBase, years);
      const pmtPoints = monthlyPayment(loanAmount, ratePoints, years);
      const totalBase = pmtBase * years * 12;
      const totalPoints = pmtPoints * years * 12;
      const interestBase = totalBase - loanAmount;
      const interestPoints = totalPoints - loanAmount + pointsCost; // include points as cost

      const monthlySavings = pmtBase - pmtPoints;
      const breakevenMonths = monthlySavings > 0 ? pointsCost / monthlySavings : null;

      document.getElementById("lp-points-cost").textContent = asCurrency(pointsCost);
      document.getElementById("lp-monthly-base").textContent = asCurrency(pmtBase);
      document.getElementById("lp-monthly-points").textContent = asCurrency(pmtPoints);
      document.getElementById("lp-interest-base").textContent = asCurrency(interestBase);
      document.getElementById("lp-interest-points").textContent = asCurrency(interestPoints);
      document.getElementById("lp-breakeven").textContent =
        breakevenMonths !== null ? breakevenMonths.toFixed(1) : "N/A";

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
    if (evt.detail?.calculatorType === "Loan-Points-Calculator") {
      initLoanPoints();
    }
  });
})();
