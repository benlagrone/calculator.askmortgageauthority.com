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

  function calcGrowth({ annualCost, currentSavings, annualReturnPct, yearsUntil, yearsEnroll, inflationPct, growContrib }) {
    const r = annualReturnPct / 100;
    const inf = inflationPct / 100;
    let balance = currentSavings;
    let totalCost = 0;
    let totalContrib = 0;
    const rows = [];

    // compute factor for contributions before enrollment
    let contribBeforeFactor = 0;
    for (let i = 1; i <= yearsUntil; i++) {
      const inflMult = growContrib ? Math.pow(1 + inf, i - 1) : 1;
      contribBeforeFactor += inflMult / Math.pow(1 + r, i);
    }

    // during enrollment factor (discounted)
    let contribDuringFactor = 0;
    for (let i = 0; i < yearsEnroll; i++) {
      const inflMult = growContrib ? Math.pow(1 + inf, yearsUntil + i) : 1;
      contribDuringFactor += inflMult / Math.pow(1 + r, i);
    }

    // total fund needed before enrollment (PV)
    let fundNeeded = 0;
    for (let i = 0; i < yearsEnroll; i++) {
      const projCost = annualCost * Math.pow(1 + inf, yearsUntil + i);
      totalCost += projCost;
      fundNeeded += projCost / Math.pow(1 + r, i);
    }

    // contribution from current savings
    const contribFromSavings = currentSavings * Math.pow(1 + r, yearsUntil);

    // solve annual contribution
    const denom = contribBeforeFactor + contribDuringFactor;
    const annualContribution = denom > 0 ? (fundNeeded - contribFromSavings) / denom : 0;

    // build table before enrollment
    for (let year = 1; year <= yearsUntil; year++) {
      const inflMult = growContrib ? Math.pow(1 + inf, year - 1) : 1;
      const contrib = annualContribution * inflMult;
      balance = (balance + contrib) * (1 + r);
      totalContrib += contrib;
      rows.push({
        year,
        contribution: contrib,
        cost: 0,
        balance
      });
    }

    // during enrollment
    for (let i = 0; i < yearsEnroll; i++) {
      const year = yearsUntil + i + 1;
      const projCost = annualCost * Math.pow(1 + inf, yearsUntil + i);
      const inflMult = growContrib ? Math.pow(1 + inf, yearsUntil + i) : 1;
      const contrib = annualContribution * inflMult;
      balance = (balance + contrib - projCost) * (1 + r);
      if (Math.abs(balance) < 1) balance = 0;
      totalContrib += contrib;
      rows.push({
        year,
        contribution: contrib,
        cost: projCost,
        balance
      });
    }

    return {
      annualContribution,
      totalCost,
      totalContrib,
      endingBalance: balance,
      rows
    };
  }

  function initCollegeSavings() {
    const form = document.getElementById("college-savings-form");
    if (!form) return;
    const resultBox = document.getElementById("college-savings-results");
    const tableBody = document.querySelector("#cs-table tbody");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const annualCost = toNumber(form.annualCollegeCost.value);
      const currentSavings = toNumber(form.currentSavings.value);
      const annualReturn = toNumber(form.annualReturn.value);
      const yearsUntil = toNumber(form.yearsUntilEnrollment.value);
      const yearsEnroll = toNumber(form.yearsEnrolled.value);
      const inflation = toNumber(form.inflationRate.value);
      const growContrib = form.inflationCheck.checked;

      if (!annualCost || !yearsEnroll) {
        alert("Enter a valid annual cost and years enrolled.");
        return;
      }

      const res = calcGrowth({
        annualCost,
        currentSavings,
        annualReturnPct: annualReturn,
        yearsUntil,
        yearsEnroll,
        inflationPct: inflation,
        growContrib
      });

      document.getElementById("cs-annual-contribution").textContent = asCurrency(res.annualContribution);
      document.getElementById("cs-total-cost").textContent = asCurrency(res.totalCost);
      document.getElementById("cs-total-contrib").textContent = asCurrency(res.totalContrib);
      document.getElementById("cs-ending-balance").textContent = asCurrency(res.endingBalance);

      tableBody.innerHTML = "";
      res.rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.year}</td>
          <td class="text-end">${asCurrency(row.contribution)}</td>
          <td class="text-end">${asCurrency(row.cost)}</td>
          <td class="text-end">${asCurrency(row.balance)}</td>
        `;
        tableBody.appendChild(tr);
      });

      resultBox.hidden = false;
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        document.querySelector("#cs-table tbody").innerHTML = "";
        resultBox.hidden = true;
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "College-Savings-Calculator") {
      initCollegeSavings();
    }
  });
})();
