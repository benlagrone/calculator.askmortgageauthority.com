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

  function biweeklyPayment(principal, annualRatePct, years) {
    const periods = years * 26;
    const r = annualRatePct / 100 / 26;
    if (periods <= 0) return { payment: 0, total: 0, interest: 0, payoff: "N/A" };
    const pmt = r === 0 ? principal / periods : (principal * r) / (1 - Math.pow(1 + r, -periods));
    const total = pmt * periods;
    const interest = total - principal;
    const payoffYears = Math.floor(periods / 26);
    const payoffMonths = Math.round((periods % 26) * 12 / 26);
    const payoffLabel = `${payoffYears} years ${payoffMonths} months`;
    return { payment: pmt, total, interest, payoff: payoffLabel };
  }

  function initBiweekly() {
    const form = document.getElementById("biweekly-form");
    if (!form) return;
    const resultBox = document.getElementById("biweekly-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const amount = toNumber(form.loanAmount.value);
      const rate = toNumber(form.interestRate.value);
      const years = toNumber(form.years.value);

      if (!amount || !rate || !years) {
        alert("Please enter amount, rate, and term.");
        return;
      }

      const res = biweeklyPayment(amount, rate, years);
      document.getElementById("bw-payment").textContent = asCurrency(res.payment);
      document.getElementById("bw-total").textContent = asCurrency(res.total);
      document.getElementById("bw-interest").textContent = asCurrency(res.interest);
      document.getElementById("bw-payoff").textContent = res.payoff;
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
    if (evt.detail?.calculatorType === "Loan-Biweekly-Calculator") {
      initBiweekly();
    }
  });
})();
