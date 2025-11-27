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

  function futureValue({ balance, annualContribution, years, annualReturnPct }) {
    const r = annualReturnPct / 100;
    if (years <= 0) return balance;
    if (r === 0) return balance + annualContribution * years;
    const fvBalance = balance * Math.pow(1 + r, years);
    const fvContrib = annualContribution * (Math.pow(1 + r, years) - 1) / r;
    return fvBalance + fvContrib;
  }

  function initRetirementPlanner() {
    const form = document.getElementById("retirement-planner-form");
    if (!form) return;
    const resultBox = document.getElementById("retirement-planner-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const age = toNumber(form.age.value);
      const retireAge = toNumber(form.retireAge.value);
      const yearsRemaining = retireAge - age;
      if (yearsRemaining <= 0) {
        alert("Retirement age must be greater than current age.");
        return;
      }
      const balance = toNumber(form.currentBalance.value);
      const annualContribution = toNumber(form.annualContribution.value);
      const annualReturn = toNumber(form.annualReturn.value);
      const withdrawRate = toNumber(form.withdrawRate.value) / 100;

      const fv = futureValue({
        balance,
        annualContribution,
        years: yearsRemaining,
        annualReturnPct: annualReturn
      });
      const withdrawal = withdrawRate > 0 ? fv * withdrawRate : 0;

      document.getElementById("rp-years-remaining").textContent = `${yearsRemaining} years`;
      document.getElementById("rp-balance-out").textContent = asCurrency(fv);
      document.getElementById("rp-withdraw-out").textContent = asCurrency(withdrawal);
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
    if (evt.detail?.calculatorType === "Retirement-Planner") {
      initRetirementPlanner();
    }
  });
})();
