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

  // Future value with monthly contributions
  const fvMonthly = (pv, annualContrib, annualRatePct, years) => {
    const pmt = (annualContrib || 0) / 12;
    const r = annualRatePct / 100 / 12;
    const n = Math.max(0, years * 12);
    if (n === 0) return pv;
    if (r === 0) return pv + pmt * n;
    return pv * Math.pow(1 + r, n) + pmt * ((Math.pow(1 + r, n) - 1) / r);
  };

  // Level payment (income) from balance over n months at rate r
  const paymentFromPV = (pv, annualRatePct, years) => {
    const r = annualRatePct / 100 / 12;
    const n = Math.max(1, years * 12);
    if (r === 0) return pv / n;
    return (pv * r) / (1 - Math.pow(1 + r, -n));
  };

  function initRetirementIncome() {
    const form = document.getElementById("retirement-income-analysis-form");
    if (!form) return;

    const resultsBox = document.getElementById("ria-results");
    const gapBox = document.getElementById("ria-gap");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const current = toNumber(form.current.value);
      const annualContrib = toNumber(form.annualContrib.value);
      const yearsToRetire = toNumber(form.yearsToRetire.value);
      const returnPre = toNumber(form.returnPre.value);
      const returnPost = toNumber(form.returnPost.value);
      const yearsRetired = toNumber(form.yearsRetired.value);
      const incomeGoal = toNumber(form.incomeGoal.value);

      if (yearsToRetire < 0 || yearsRetired <= 0 || returnPre < 0 || returnPost < 0) {
        alert("Enter valid values for years and returns.");
        return;
      }

      const balanceAtRetire = fvMonthly(current, annualContrib, returnPre, yearsToRetire);
      const monthlyIncome = paymentFromPV(balanceAtRetire, returnPost, yearsRetired);
      const annualIncome = monthlyIncome * 12;

      document.getElementById("ria-balance").textContent = currencyFmt.format(balanceAtRetire);
      document.getElementById("ria-annual-income").textContent = currencyFmt.format(annualIncome);
      document.getElementById("ria-monthly-income").textContent = currencyFmt.format(monthlyIncome);

      if (incomeGoal > 0) {
        const gap = annualIncome - incomeGoal;
        gapBox.hidden = false;
        gapBox.innerHTML =
          gap >= 0
            ? `<span class="text-success">Goal met by ${currencyFmt.format(gap)} per year.</span>`
            : `<span class="text-danger">Short by ${currencyFmt.format(Math.abs(gap))} per year to reach your goal.</span>`;
      } else {
        gapBox.hidden = true;
        gapBox.textContent = "";
      }

      resultsBox.hidden = false;
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resultsBox.hidden = true;
        gapBox.hidden = true;
        gapBox.textContent = "";
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Retirement-Income-Analysis") {
      initRetirementIncome();
    }
  });
})();
