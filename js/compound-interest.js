(() => {
  const freq = {
    Daily: 365,
    Weekly: 52,
    Monthly: 12,
    Quarterly: 4,
    Semiannually: 2,
    Annually: 1
  };

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

  function getEffectiveAnnual(ratePct, compounding) {
    const r = ratePct / 100;
    if (compounding === "No Compound") {
      return r; // simple annual rate
    }
    const n = freq[compounding] || 12;
    return Math.pow(1 + r / n, n) - 1;
  }

  function getMonthlyRate(effectiveAnnual) {
    if (effectiveAnnual <= 0) return 0;
    return Math.pow(1 + effectiveAnnual, 1 / 12) - 1;
  }

  function calcMaturity({ principal, monthlyDeposit, months, annualRatePct, compounding }) {
    const effAnnual = getEffectiveAnnual(annualRatePct, compounding);
    const monthlyRate = getMonthlyRate(effAnnual);

    let maturity;
    if (monthlyRate === 0) {
      maturity = principal + monthlyDeposit * months;
    } else {
      const growthFactor = Math.pow(1 + monthlyRate, months);
      const depositFactor = monthlyDeposit > 0 ? ((growthFactor - 1) / monthlyRate) : 0;
      maturity = principal * growthFactor + monthlyDeposit * depositFactor;
    }

    const totalPrincipal = principal + monthlyDeposit * months;
    const interestAmount = maturity - totalPrincipal;
    const apyPct = effAnnual * 100;
    return { maturity, totalPrincipal, interestAmount, apyPct };
  }

  function initCompoundInterest() {
    const form = document.getElementById("compound-interest-form");
    if (!form) return;
    const resultBox = document.getElementById("compound-interest-results");

    const principalEl = form.principalAmount;
    const monthlyEl = form.monthlyDeposit;
    const periodEl = form.period;
    const rateEl = form.annualInterestRate;
    const compoundingEl = document.getElementById("ci-compounding");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const principal = toNumber(principalEl.value);
      const monthlyDeposit = toNumber(monthlyEl.value);
      const months = toNumber(periodEl.value);
      const annualRatePct = toNumber(rateEl.value);
      const compounding = compoundingEl.value;

      if (months <= 0 || annualRatePct < 0) {
        alert("Enter a valid period and rate.");
        return;
      }

      const { maturity, totalPrincipal, interestAmount, apyPct } = calcMaturity({
        principal,
        monthlyDeposit,
        months,
        annualRatePct,
        compounding
      });

      document.getElementById("ci-total-principal").textContent = asCurrency(totalPrincipal);
      document.getElementById("ci-interest").textContent = asCurrency(interestAmount);
      document.getElementById("ci-maturity").textContent = asCurrency(maturity);
      document.getElementById("ci-apy").textContent = apyPct.toFixed(4);

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
    if (evt.detail?.calculatorType === "Compound-Interest-Calculator") {
      initCompoundInterest();
    }
  });
})();
