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

  const fvMonthly = (pv, pmtMonthly, annualRatePct, years) => {
    const r = annualRatePct / 100 / 12;
    const n = Math.max(0, years * 12);
    if (n === 0) return pv;
    if (r === 0) return pv + pmtMonthly * n;
    return pv * Math.pow(1 + r, n) + pmtMonthly * ((Math.pow(1 + r, n) - 1) / r);
  };

  function initRetirementSavings() {
    const form = document.getElementById("retirement-savings-analysis-form");
    if (!form) return;

    const resultsBox = document.getElementById("rsa-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const current = toNumber(form.current.value);
      const monthly = toNumber(form.monthly.value);
      const annualReturn = toNumber(form.annualReturn.value);
      const inflation = toNumber(form.inflation.value);
      const years = toNumber(form.years.value);
      const withdrawalRate = toNumber(form.withdrawalRate.value);

      if (years < 0 || annualReturn < 0 || withdrawalRate < 0) {
        alert("Enter non-negative values for years, returns, and withdrawal rate.");
        return;
      }

      const futureBalance = fvMonthly(current, monthly, annualReturn, years);
      const realGrowth = (1 + annualReturn / 100) / (1 + inflation / 100) - 1;
      const realBalance = fvMonthly(current, monthly, realGrowth * 100, years);
      const totalContrib = monthly * 12 * years + current;

      const annualWithdrawal = futureBalance * (withdrawalRate / 100);
      const monthlyWithdrawal = annualWithdrawal / 12;

      document.getElementById("rsa-balance").textContent = currencyFmt.format(futureBalance);
      document.getElementById("rsa-real-balance").textContent = currencyFmt.format(realBalance);
      document.getElementById("rsa-total-contrib").textContent = currencyFmt.format(totalContrib);
      document.getElementById("rsa-withdrawal-amount").textContent = currencyFmt.format(annualWithdrawal);
      document.getElementById("rsa-withdrawal-monthly").textContent = currencyFmt.format(monthlyWithdrawal);

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
    if (evt.detail?.calculatorType === "Retirement-Savings-Analysis") {
      initRetirementSavings();
    }
  });
})();
