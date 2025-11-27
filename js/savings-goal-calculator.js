(() => {
  const freqPerYear = {
    Daily: 365,
    Weekly: 52,
    Monthly: 12,
    Quarterly: 4,
    Semiannually: 2,
    Annually: 1,
    "No Compound": 0
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

  function monthlyRate(annualRatePct, compounding) {
    if (annualRatePct <= 0) return 0;
    const c = freqPerYear[compounding] ?? 12;
    if (c === 0) return 0; // no compound
    return Math.pow(1 + annualRatePct / 100 / c, c / 12) - 1;
  }

  function solveMonthlyContribution({ goal, initial, months, rate }) {
    if (months <= 0) return null;
    if (rate === 0) {
      return (goal - initial) / months;
    }
    const growth = Math.pow(1 + rate, months);
    return ((goal - initial * growth) * rate) / (growth - 1);
  }

  function solveMonths({ goal, initial, monthly, rate }) {
    if (monthly <= 0 && goal > initial) return null;
    if (rate === 0) {
      return monthly > 0 ? (goal - initial) / monthly : 0;
    }
    const num = goal * rate + monthly;
    const denom = initial * rate + monthly;
    if (denom <= 0 || num <= 0) return null;
    const growth = num / denom;
    if (growth <= 0) return null;
    return Math.log(growth) / Math.log(1 + rate);
  }

  function formatTime(months) {
    if (!isFinite(months) || months < 0) return "N/A";
    const years = Math.floor(months / 12);
    const rem = Math.round(months - years * 12);
    const parts = [];
    if (years) parts.push(`${years} year${years === 1 ? "" : "s"}`);
    if (rem) parts.push(`${rem} month${rem === 1 ? "" : "s"}`);
    return parts.length ? parts.join(" ") : "0 months";
  }

  function toggleMode(mode) {
    const monthlyRow = document.getElementById("sg-monthly-row");
    const timeRow = document.getElementById("sg-time-row");
    if (mode === "time") {
      monthlyRow.hidden = false;
      timeRow.hidden = true;
    } else {
      monthlyRow.hidden = true;
      timeRow.hidden = false;
    }
  }

  function initSavingsGoal() {
    const form = document.getElementById("savings-goal-form");
    if (!form) return;
    const modeMonthly = document.getElementById("sg-mode-monthly");
    const modeTime = document.getElementById("sg-mode-time");
    const resultBox = document.getElementById("savings-goal-results");

    const updateMode = () => {
      toggleMode(modeTime.checked ? "time" : "monthly");
      resultBox.hidden = true;
    };

    modeMonthly.addEventListener("change", updateMode);
    modeTime.addEventListener("change", updateMode);
    updateMode();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const goal = toNumber(form.savingsGoal.value);
      const initial = toNumber(form.initialBalance.value);
      const annualRate = toNumber(form.annualInterestRate.value);
      const compounding = form.compounding.value;
      const rate = monthlyRate(annualRate, compounding);

      let months = toNumber(form.years.value) * 12 + toNumber(form.months.value);
      let monthlySavings = toNumber(form.monthlySavings.value);
      let solvedMonths = months;

      if (modeTime.checked) {
        // solve time needed
        const m = monthlySavings;
        const n = solveMonths({ goal, initial, monthly: m, rate });
        if (n === null) {
          alert("Cannot solve time needed with these inputs.");
          return;
        }
        solvedMonths = n;
      } else {
        // solve monthly needed
        const m = solveMonthlyContribution({ goal, initial, months, rate });
        if (m === null || !isFinite(m)) {
          alert("Cannot solve monthly savings with these inputs.");
          return;
        }
        monthlySavings = m;
      }

      const yearly = monthlySavings * 12;
      const weekly = yearly / 52;
      const daily = yearly / 365;

      const growth = Math.pow(1 + rate, solvedMonths);
      const futureValue =
        rate === 0
          ? initial + monthlySavings * solvedMonths
          : initial * growth + monthlySavings * ((growth - 1) / rate);
      const totalPrincipal = initial + monthlySavings * solvedMonths;
      const interest = futureValue - totalPrincipal;

      document.getElementById("sg-total-principal").textContent = asCurrency(totalPrincipal);
      document.getElementById("sg-interest").textContent = asCurrency(interest);
      document.getElementById("sg-monthly-out").textContent = asCurrency(monthlySavings);
      document.getElementById("sg-yearly-out").textContent = asCurrency(yearly);
      document.getElementById("sg-weekly-out").textContent = asCurrency(weekly);
      document.getElementById("sg-daily-out").textContent = asCurrency(daily);
      document.getElementById("sg-time-needed").textContent = formatTime(solvedMonths);

      // update input with solved monthly when in monthly mode
      if (!modeTime.checked) {
        form.monthlySavings.value = monthlySavings.toFixed(2);
      }

      resultBox.hidden = false;
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resultBox.hidden = true;
        updateMode();
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Savings-Goal-Calculator") {
      initSavingsGoal();
    }
  });
})();
