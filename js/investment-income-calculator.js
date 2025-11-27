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

  function calcRows({ principal, growthPct, inflationPct, feePct, taxPct }) {
    const rows = [];
    let balance = principal;
    const g = growthPct / 100;
    const inf = inflationPct / 100;
    const feeRate = feePct / 100;
    const taxRate = taxPct / 100;

    for (let year = 1; year <= 50; year++) {
      const beginning = balance;
      const ending = beginning * (1 + g);
      const gain = ending - beginning;
      const fee = ending * feeRate;
      const balanceInflated = beginning * (1 + inf);
      const inflationSetAside = balanceInflated - beginning;
      const gainAfterFee = ending - beginning - fee;
      const tax = gainAfterFee * taxRate;
      const income = gain - fee - tax - inflationSetAside;

      // Principal is protected: keep balance at inflation-adjusted amount
      balance = balanceInflated;

      rows.push({
        year,
        beginning,
        gain,
        fee,
        tax,
        inflationSetAside,
        income,
        ending: balance
      });
    }
    return rows;
  }

  function initInvestmentIncome() {
    const form = document.getElementById("investment-income-form");
    if (!form) return;
    const tableBody = document.querySelector("#ii-table tbody");
    const resultsBox = document.getElementById("investment-income-results");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const principal = toNumber(form.principalAmount.value);
      const growth = toNumber(form.growthRate.value);
      const inflation = toNumber(form.inflationRate.value);
      const fee = toNumber(form.feeRate.value);
      const tax = toNumber(form.taxRate.value);

      if (principal <= 0) {
        alert("Enter a valid principal.");
        return;
      }

      const rows = calcRows({
        principal,
        growthPct: growth,
        inflationPct: inflation,
        feePct: fee,
        taxPct: tax
      });

      tableBody.innerHTML = "";
      rows.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.year}</td>
          <td class="text-end">${asCurrency(row.beginning)}</td>
          <td class="text-end">${asCurrency(row.gain)}</td>
          <td class="text-end">${asCurrency(row.fee)}</td>
          <td class="text-end">${asCurrency(row.tax)}</td>
          <td class="text-end">${asCurrency(row.inflationSetAside)}</td>
          <td class="text-end">${asCurrency(row.income)}</td>
          <td class="text-end">${asCurrency(row.ending)}</td>
        `;
        tableBody.appendChild(tr);
      });

      resultsBox.hidden = false;
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        tableBody.innerHTML = "";
        resultsBox.hidden = true;
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Investment-Income-Calculator") {
      initInvestmentIncome();
    }
  });
})();
