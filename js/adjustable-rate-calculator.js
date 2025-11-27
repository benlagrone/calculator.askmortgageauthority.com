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

  function recalcAfterAdjustments({
    principal,
    initialRate,
    monthsTotal,
    monthsBeforeFirstAdjustment,
    monthsBetweenAdjustments,
    expectedAdjust,
    cap
  }) {
    let balance = principal;
    let rate = initialRate;
    let maxRate = cap > 0 ? cap : Infinity;
    let maxPayment = 0;
    let totalPayment = 0;
    let totalInterest = 0;

    const applyMonths = (months, currentRate, remainingMonths) => {
      if (months <= 0) return { balance, interest: 0, payment: 0, maxPmt: 0 };
      const pmt = monthlyPayment(balance, currentRate, remainingMonths);
      let interestPaid = 0;
      for (let i = 0; i < months; i++) {
        const r = currentRate / 100 / 12;
        const interest = balance * r;
        const principalPay = pmt - interest;
        balance -= principalPay;
        interestPaid += interest;
        if (balance < 0) {
          balance = 0;
          break;
        }
      }
      return { balance, interest: interestPaid, payment: pmt, maxPmt: pmt };
    };

    let elapsed = 0;
    // initial period before first adjustment
    const firstPeriod = Math.min(monthsBeforeFirstAdjustment || monthsTotal, monthsTotal);
    if (firstPeriod > 0) {
      const res = applyMonths(firstPeriod, rate, monthsTotal - elapsed);
      maxPayment = Math.max(maxPayment, res.maxPmt);
      totalPayment += res.maxPmt * firstPeriod;
      totalInterest += res.interest;
      elapsed += firstPeriod;
    }

    while (elapsed < monthsTotal && balance > 0) {
      // adjust rate
      rate = Math.min(rate + expectedAdjust, maxRate);
      const remaining = monthsTotal - elapsed;
      const period = Math.min(monthsBetweenAdjustments || remaining, remaining);
      const res = applyMonths(period, rate, remaining);
      maxPayment = Math.max(maxPayment, res.maxPmt);
      totalPayment += res.maxPmt * period;
      totalInterest += res.interest;
      elapsed += period;
    }

    return { maxPayment, totalPayment, totalInterest, remainingBalance: balance };
  }

  function initArm() {
    const form = document.getElementById("arm-form");
    if (!form) return;
    const resultBox = document.getElementById("arm-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const loanAmount = toNumber(form.loanAmount.value);
      const initialRate = toNumber(form.interestRate.value);
      const years = toNumber(form.years.value);
      const months = toNumber(form.months.value);
      const monthsBeforeFirstAdjustment = toNumber(form.monthsBeforeFirstAdjustment.value);
      const monthsBetweenAdjustments = toNumber(form.monthBetweenAdjustments.value);
      const expectedAdjust = toNumber(form.expectedAdjustments.value);
      const interestRateCap = toNumber(form.interestRateCap.value);

      const totalMonths = years * 12 + months;
      if (!loanAmount || !initialRate || totalMonths <= 0) {
        alert("Enter loan amount, rate, and term.");
        return;
      }

      const initialPmt = monthlyPayment(loanAmount, initialRate, totalMonths);
      const { maxPayment, totalPayment, totalInterest } = recalcAfterAdjustments({
        principal: loanAmount,
        initialRate,
        monthsTotal: totalMonths,
        monthsBeforeFirstAdjustment,
        monthsBetweenAdjustments,
        expectedAdjust,
        cap: interestRateCap > 0 ? interestRateCap : Infinity
      });

      document.getElementById("arm-initial").textContent = asCurrency(initialPmt);
      document.getElementById("arm-max").textContent = asCurrency(maxPayment);
      document.getElementById("arm-total").textContent = asCurrency(totalPayment);
      document.getElementById("arm-interest").textContent = asCurrency(totalInterest);
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
    if (evt.detail?.calculatorType === "Adjustable-Rate-Calculator") {
      initArm();
    }
  });
})();
