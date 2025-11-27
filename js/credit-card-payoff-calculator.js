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

  const payoffSchedule = (balance, apr, payment) => {
    const r = apr / 100 / 12;
    if (balance <= 0 || payment <= 0) return null;
    if (r > 0 && payment <= balance * r) return null; // never pays down

    let months = 0;
    let totalInterest = 0;
    let bal = balance;
    const maxMonths = 3600; // cap to avoid infinite loops

    while (bal > 0 && months < maxMonths) {
      const interest = bal * r;
      const principal = payment - interest;
      if (principal <= 0) return null;
      bal = bal - principal;
      totalInterest += interest;
      months += 1;
      if (bal < 0) bal = 0;
    }

    if (months >= maxMonths) return null;

    return {
      months,
      totalInterest,
      totalPaid: months * payment
    };
  };

  function initCreditPayoff() {
    const form = document.getElementById("credit-payoff-form");
    if (!form) return;

    const resultsBox = document.getElementById("cc-results");
    const noteBox = document.getElementById("cc-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const balance = toNumber(form.balance.value);
      const rate = toNumber(form.rate.value);
      const payment = toNumber(form.payment.value);

      const schedule = payoffSchedule(balance, rate, payment);
      if (!schedule) {
        alert("Payment is too low to cover interest. Increase the monthly payment.");
        return;
      }

      const years = Math.floor(schedule.months / 12);
      const remMonths = schedule.months % 12;

      document.getElementById("cc-months").textContent = `${schedule.months} months`;
      document.getElementById("cc-years-months").textContent = `${years} years ${remMonths} months`;
      document.getElementById("cc-total-interest").textContent = currencyFmt.format(schedule.totalInterest);
      document.getElementById("cc-total-paid").textContent = currencyFmt.format(schedule.totalPaid);

      const faster = payment > balance * (rate / 100 / 12) * 2 ? "You're paying well above interest, so you'll clear it faster." : "";
      noteBox.innerHTML = `<span class="text-muted">Assumes fixed monthly payment and no new charges. ${faster}</span>`;

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
    if (evt.detail?.calculatorType === "Credit-Card-Payoff-Calculator") {
      initCreditPayoff();
    }
  });
})();
