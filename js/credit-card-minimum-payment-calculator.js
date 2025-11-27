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

  // Simulate payoff using minimum payment rules.
  const payoffWithMinimums = (balance, apr, minPct, minFloor) => {
    const r = apr / 100 / 12;
    if (balance <= 0) return null;
    const maxMonths = 3600;
    let bal = balance;
    let months = 0;
    let totalInterest = 0;
    let firstPayment = 0;

    while (bal > 0 && months < maxMonths) {
      const interest = bal * r;
      const minPayment = Math.max(bal * (minPct / 100), minFloor);
      const payment = Math.min(bal + interest, minPayment);
      if (months === 0) firstPayment = payment;

      // ensure payment covers interest
      const principal = payment - interest;
      if (principal <= 0) return null;

      bal -= principal;
      totalInterest += interest;
      months += 1;
      if (bal < 0) bal = 0;
    }

    if (months >= maxMonths) return null;

    return {
      months,
      totalInterest,
      totalPaid: totalInterest + balance,
      firstPayment
    };
  };

  function initCreditMinPay() {
    const form = document.getElementById("credit-min-payment-form");
    if (!form) return;

    const resultsBox = document.getElementById("ccmin-results");
    const noteBox = document.getElementById("ccmin-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const balance = toNumber(form.balance.value);
      const rate = toNumber(form.rate.value);
      const percent = toNumber(form.percent.value);
      const floor = toNumber(form.floor.value);

      if (balance <= 0 || rate < 0 || percent <= 0 || floor < 0) {
        alert("Enter balance, APR, minimum percent, and floor.");
        return;
      }

      const result = payoffWithMinimums(balance, rate, percent, floor);
      if (!result) {
        alert("Minimum payment is too low to ever pay down the balance. Increase the percent or floor.");
        return;
      }

      const years = Math.floor(result.months / 12);
      const remMonths = result.months % 12;

      document.getElementById("ccmin-first-payment").textContent = currencyFmt.format(result.firstPayment);
      document.getElementById("ccmin-months").textContent = `${result.months} months`;
      document.getElementById("ccmin-years-months").textContent = `${years} years ${remMonths} months`;
      document.getElementById("ccmin-total-interest").textContent = currencyFmt.format(result.totalInterest);
      document.getElementById("ccmin-total-paid").textContent = currencyFmt.format(result.totalPaid);

      noteBox.innerHTML = `<span class="text-muted">Assumes no new charges and recalculates the minimum each month as the greater of ${percent}% of balance or ${currencyFmt.format(floor)}.</span>`;
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
    if (evt.detail?.calculatorType === "Credit-Card-Minimum-Payment-Calculator") {
      initCreditMinPay();
    }
  });
})();
