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

  function calcHsa({ initialBalance, annualContribution, annualSpending, years, annualReturnPct, fedTax, stateTax }) {
    const r = annualReturnPct / 100;
    let balance = initialBalance;
    let totalContribution = initialBalance + annualContribution * years;

    for (let i = 0; i < years; i++) {
      balance = (balance + annualContribution - annualSpending) * (1 + r);
    }

    const interest = balance - totalContribution + annualSpending * years; // add back spending removed from principal count
    const taxSavings = annualContribution * (fedTax + stateTax) / 100 * years;
    return {
      totalPrincipal: totalContribution,
      interestAmount: interest,
      futureValue: balance,
      taxSavings
    };
  }

  function initHsa() {
    const form = document.getElementById("hsa-form");
    if (!form) return;
    const resultBox = document.getElementById("hsa-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const initialBalance = toNumber(form.initialBalance.value);
      const annualContribution = toNumber(form.annualContribution.value);
      const annualSpending = toNumber(form.annualSpending.value);
      const years = toNumber(form.period.value);
      const annualRate = toNumber(form.annualInterestRate.value);
      const fedTax = toNumber(form.federalIncomeTax.value);
      const stateTax = toNumber(form.stateIncomeTax.value);

      const res = calcHsa({
        initialBalance,
        annualContribution,
        annualSpending,
        years,
        annualReturnPct: annualRate,
        fedTax,
        stateTax
      });

      document.getElementById("hsa-total-principal").textContent = asCurrency(res.totalPrincipal);
      document.getElementById("hsa-interest").textContent = asCurrency(res.interestAmount);
      document.getElementById("hsa-future").textContent = asCurrency(res.futureValue);
      document.getElementById("hsa-tax-savings").textContent = asCurrency(res.taxSavings);
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
    if (evt.detail?.calculatorType === "US-Health-Savings-Account-Calculator") {
      initHsa();
    }
  });
})();
