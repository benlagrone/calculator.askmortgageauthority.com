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

  function futureValue(balance, annualContribution, years, annualReturnPct) {
    const r = annualReturnPct / 100;
    if (years <= 0) return balance;
    if (r === 0) return balance + annualContribution * years;
    return (
      balance * Math.pow(1 + r, years) +
      annualContribution * ((Math.pow(1 + r, years) - 1) / r)
    );
  }

  function init401k() {
    const form = document.getElementById("retirement-401k-form");
    if (!form) return;
    const resultBox = document.getElementById("retirement-401k-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const salary = toNumber(form.salary.value);
      const employeePct = toNumber(form.employeePct.value) / 100;
      const matchPct = toNumber(form.matchPct.value) / 100;
      const matchCapPct = toNumber(form.matchCapPct.value) / 100;
      const currentBalance = toNumber(form.currentBalance.value);
      const annualReturn = toNumber(form.annualReturn.value);
      const years = toNumber(form.years.value);

      if (!salary || !years || employeePct < 0 || matchPct < 0) {
        alert("Enter salary, years, and contribution percentages.");
        return;
      }

      const empAnnual = salary * employeePct;
      const matchBasePct = Math.min(employeePct, matchCapPct);
      const employerAnnual = salary * matchBasePct * matchPct;
      const annualContribution = empAnnual + employerAnnual;
      const totalContrib = annualContribution * years;
      const projected = futureValue(currentBalance, annualContribution, years, annualReturn);

      document.getElementById("k-emp-contrib").textContent = asCurrency(empAnnual);
      document.getElementById("k-match").textContent = asCurrency(employerAnnual);
      document.getElementById("k-total-contrib").textContent = asCurrency(totalContrib + currentBalance);
      document.getElementById("k-balance").textContent = asCurrency(projected);

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
    if (evt.detail?.calculatorType === "Retirement-401k-Calculator") {
      init401k();
    }
  });
})();
