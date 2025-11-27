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

  const fvMonthly = (pv, monthly, annualRatePct, years) => {
    const r = annualRatePct / 100 / 12;
    const n = Math.max(0, years * 12);
    if (n === 0) return pv;
    if (r === 0) return pv + monthly * n;
    return pv * Math.pow(1 + r, n) + monthly * ((Math.pow(1 + r, n) - 1) / r);
  };

  const paymentFromPV = (pv, annualRatePct, years) => {
    const r = annualRatePct / 100 / 12;
    const n = Math.max(1, years * 12);
    if (r === 0) return pv / n;
    return (pv * r) / (1 - Math.pow(1 + r, -n));
  };

  function initRetirementCalc() {
    const form = document.getElementById("retirement-calculator-form");
    if (!form) return;

    const resultsBox = document.getElementById("rc-results");
    const noteBox = document.getElementById("rc-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const currentAge = toNumber(form.currentAge.value);
      const retireAge = toNumber(form.retireAge.value);
      const yearsRetired = toNumber(form.yearsRetired.value);
      const currentSavings = toNumber(form.currentSavings.value);
      const monthlyContribution = toNumber(form.monthlyContribution.value);
      const returnPre = toNumber(form.returnPre.value);
      const returnPost = toNumber(form.returnPost.value);
      const withdrawalRate = toNumber(form.withdrawalRate.value);

      if (retireAge <= currentAge) {
        alert("Retirement age must be greater than current age.");
        return;
      }

      const yearsToRetire = retireAge - currentAge;
      const balanceAtRetire = fvMonthly(currentSavings, monthlyContribution, returnPre, yearsToRetire);

      let annualIncome;
      let methodNote;
      if (withdrawalRate > 0) {
        annualIncome = balanceAtRetire * (withdrawalRate / 100);
        methodNote = `Using ${withdrawalRate.toFixed(2)}% withdrawal rate.`;
      } else {
        annualIncome = paymentFromPV(balanceAtRetire, returnPost, yearsRetired) * 12;
        methodNote = `Level payout over ${yearsRetired} years with ${returnPost}% return during retirement.`;
      }

      const monthlyIncome = annualIncome / 12;

      document.getElementById("rc-balance").textContent = currencyFmt.format(balanceAtRetire);
      document.getElementById("rc-annual-income").textContent = currencyFmt.format(annualIncome);
      document.getElementById("rc-monthly-income").textContent = currencyFmt.format(monthlyIncome);
      noteBox.innerHTML = `<span class="text-muted">${methodNote}</span>`;

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
    if (evt.detail?.calculatorType === "Retirement-Calculator") {
      initRetirementCalc();
    }
  });
})();
