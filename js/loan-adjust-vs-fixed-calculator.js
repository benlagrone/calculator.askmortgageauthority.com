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

  function monthlyPayment(principal, annualRatePct, months) {
    if (months <= 0) return 0;
    const r = annualRatePct / 100 / 12;
    if (r === 0) return principal / months;
    return (principal * r) / (1 - Math.pow(1 + r, -months));
  }

  function simulateArm({
    principal,
    initialRate,
    totalMonths,
    monthsBeforeFirstAdjustment,
    monthsBetweenAdjustments,
    expectedStep,
    cap
  }) {
    let balance = principal;
    let rate = initialRate;
    const maxRate = cap > 0 ? cap : Infinity;
    let maxPayment = 0;
    let totalPayment = 0;
    let totalInterest = 0;
    let elapsed = 0;

    const runMonths = (months, currentRate, remaining) => {
      if (months <= 0) return;
      const pmt = monthlyPayment(balance, currentRate, remaining);
      maxPayment = Math.max(maxPayment, pmt);
      for (let i = 0; i < months; i++) {
        const r = currentRate / 100 / 12;
        const interest = balance * r;
        const principalPay = pmt - interest;
        balance -= principalPay;
        totalInterest += interest;
        totalPayment += pmt;
        if (balance < 0) {
          balance = 0;
          break;
        }
      }
    };

    const first = Math.min(monthsBeforeFirstAdjustment || totalMonths, totalMonths);
    runMonths(first, rate, totalMonths - elapsed);
    elapsed += first;

    while (elapsed < totalMonths && balance > 0) {
      rate = Math.min(rate + expectedStep, maxRate);
      const remaining = totalMonths - elapsed;
      const period = Math.min(monthsBetweenAdjustments || remaining, remaining);
      runMonths(period, rate, remaining);
      elapsed += period;
    }

    return { maxPayment, totalPayment, totalInterest };
  }

  function initAdjVsFixed() {
    const form = document.getElementById("adj-vs-fixed-form");
    if (!form) return;
    const resultBox = document.getElementById("adj-vs-fixed-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const amount = toNumber(form.loanAmount.value);
      const years = toNumber(form.years.value);
      const fixedRate = toNumber(form.fixedRate.value);
      const armRate = toNumber(form.armRate.value);
      const firstAdj = toNumber(form.monthsBeforeFirstAdjustment.value);
      const betweenAdj = toNumber(form.monthBetweenAdjustments.value);
      const step = toNumber(form.expectedAdjustments.value);
      const cap = toNumber(form.interestRateCap.value);

      const totalMonths = years * 12;
      if (!amount || !years || !fixedRate || !armRate) {
        alert("Enter loan amount, term, and both rates.");
        return;
      }

      // Fixed
      const fixedMonthly = monthlyPayment(amount, fixedRate, totalMonths);
      const fixedTotal = fixedMonthly * totalMonths;
      const fixedInterest = fixedTotal - amount;

      // ARM
      const armInitial = monthlyPayment(amount, armRate, totalMonths);
      const { maxPayment, totalPayment, totalInterest } = simulateArm({
        principal: amount,
        initialRate: armRate,
        totalMonths,
        monthsBeforeFirstAdjustment: firstAdj,
        monthsBetweenAdjustments: betweenAdj,
        expectedStep: step,
        cap
      });

      document.getElementById("avf-fixed-pmt").textContent = asCurrency(fixedMonthly);
      document.getElementById("avf-fixed-total").textContent = asCurrency(fixedTotal);
      document.getElementById("avf-fixed-int").textContent = asCurrency(fixedInterest);

      document.getElementById("avf-arm-initial").textContent = asCurrency(armInitial);
      document.getElementById("avf-arm-max").textContent = asCurrency(maxPayment);
      document.getElementById("avf-arm-total").textContent = asCurrency(totalPayment);
      document.getElementById("avf-arm-int").textContent = asCurrency(totalInterest);

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
    if (evt.detail?.calculatorType === "Loan-Adjust-Vs-Fixed-Calculator") {
      initAdjVsFixed();
    }
  });
})();
