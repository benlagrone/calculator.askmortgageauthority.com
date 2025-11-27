(() => {
  const freqPerYear = {
    Daily: 365,
    Weekly: 52,
    Biweekly: 26,
    Semimonthly: 24,
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

  function paymentAndBalloon({
    principal,
    annualRatePct,
    termMonths,
    dueMonths,
    paymentsPerYear,
    dayCount
  }) {
    const nPerYear = paymentsPerYear || 12;
    const periods = (dueMonths || termMonths) * (nPerYear / 12);
    const r = ((annualRatePct || 0) / 100) * (365 / dayCount) / nPerYear;

    if (periods <= 0) return { payment: 0, totalPayment: 0, interest: 0, balloon: 0 };

    let payment = 0;
    if (r === 0) {
      payment = principal / periods;
    } else {
      payment = (principal * r) / (1 - Math.pow(1 + r, -periods));
    }

    let balance = principal;
    for (let i = 0; i < periods; i++) {
      const interest = balance * r;
      const principalPay = payment - interest;
      balance = balance - principalPay;
    }
    if (Math.abs(balance) < 1e-6) balance = 0;

    const balloon = balance;
    const totalPayment = payment * periods + balloon;
    const interest = totalPayment - principal;
    return { payment, totalPayment, interest, balloon };
  }

  function initCommercialLoan() {
    const form = document.getElementById("commercial-loan-form");
    if (!form) return;
    const resultBox = document.getElementById("commercial-loan-results");
    const out = {
      label: document.getElementById("cl-payment-label"),
      p1: document.getElementById("cl-monthly1"),
      p2: document.getElementById("cl-monthly2"),
      t1: document.getElementById("cl-total1"),
      t2: document.getElementById("cl-total2"),
      i1: document.getElementById("cl-interest1"),
      i2: document.getElementById("cl-interest2"),
      b1: document.getElementById("cl-balloon1"),
      b2: document.getElementById("cl-balloon2")
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const principal = toNumber(form.loanAmount.value);
      const rate = toNumber(form.interestRate.value);
      const years = toNumber(form.years.value);
      const months = toNumber(form.months.value);
      const dueMonths = toNumber(form.loanDueTermInMonths.value);
      const comp = form.compoundingMethod.value; // 365 or 360
      const period = form.paymentPeriod.value;

      const termMonths = years * 12 + months;
      if (!principal || !rate || termMonths <= 0) {
        alert("Please enter loan amount, rate, and term.");
        return;
      }

      const paymentsPerYear = freqPerYear[period] || 12;
      const res365 = paymentAndBalloon({
        principal,
        annualRatePct: rate,
        termMonths,
        dueMonths: dueMonths > 0 ? dueMonths : termMonths,
        paymentsPerYear,
        dayCount: 365
      });
      const res360 = paymentAndBalloon({
        principal,
        annualRatePct: rate,
        termMonths,
        dueMonths: dueMonths > 0 ? dueMonths : termMonths,
        paymentsPerYear,
        dayCount: 360
      });

      out.label.textContent = `${period} Payment`;
      out.p1.textContent = asCurrency(res365.payment);
      out.p2.textContent = asCurrency(res360.payment);
      out.t1.textContent = asCurrency(res365.totalPayment);
      out.t2.textContent = asCurrency(res360.totalPayment);
      out.i1.textContent = asCurrency(res365.interest);
      out.i2.textContent = asCurrency(res360.interest);
      out.b1.textContent = asCurrency(res365.balloon);
      out.b2.textContent = asCurrency(res360.balloon);

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
    if (evt.detail?.calculatorType === "Commercial-Loan-Calculator") {
      initCommercialLoan();
    }
  });
})();
