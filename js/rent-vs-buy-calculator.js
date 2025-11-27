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

  function monthlyPayment(principal, annualRatePct, termYears) {
    const n = termYears * 12;
    const r = annualRatePct / 100 / 12;
    if (n <= 0) return 0;
    if (r === 0) return principal / n;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }

  function amortize(principal, annualRatePct, months, pmt) {
    const r = annualRatePct / 100 / 12;
    let balance = principal;
    for (let i = 0; i < months; i++) {
      const interest = balance * r;
      const principalPay = pmt - interest;
      balance -= principalPay;
      if (balance < 0) {
        balance = 0;
        break;
      }
    }
    return balance;
  }

  function runComparison({
    price,
    down,
    rate,
    years,
    taxAnnual,
    insuranceAnnual,
    maintPct,
    hoaMonthly,
    rent,
    rentGrowth,
    appreciation,
    sellingPct,
    horizonYears
  }) {
    const loan = Math.max(0, price - down);
    const pmtPI = monthlyPayment(loan, rate, years);
    const taxMonthly = taxAnnual / 12;
    const insMonthly = insuranceAnnual / 12;
    const maintAnnual = price * (maintPct / 100);
    const maintMonthly = maintAnnual / 12;
    const horizonMonths = horizonYears * 12;
    let totalOwnOut = down; // include down as cash out
    let totalRentOut = 0;
    let curRent = rent;
    let homeValue = price;

    for (let m = 1; m <= horizonMonths; m++) {
      // owner monthly outflow
      totalOwnOut += pmtPI + taxMonthly + insMonthly + maintMonthly + hoaMonthly;
      // rent monthly outflow
      totalRentOut += curRent;

      // annual adjustments
      if (m % 12 === 0) {
        curRent *= 1 + rentGrowth / 100;
        homeValue *= 1 + appreciation / 100;
      }
    }

    const remaining = amortize(loan, rate, horizonMonths, pmtPI);
    const sellingCosts = homeValue * (sellingPct / 100);
    const netProceeds = Math.max(0, homeValue - sellingCosts - remaining);

    const netBuyCost = totalOwnOut - netProceeds;
    const advantage = totalRentOut - netBuyCost;

    return { netBuyCost, totalRentOut, advantage };
  }

  function initRentVsBuy() {
    const form = document.getElementById("rent-buy-form");
    if (!form) return;
    const resultBox = document.getElementById("rent-buy-results");
    const outBuy = document.getElementById("rb-cost-buy");
    const outRent = document.getElementById("rb-cost-rent");
    const outAdv = document.getElementById("rb-advantage");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const res = runComparison({
        price: toNumber(form.homePrice.value),
        down: toNumber(form.downPayment.value),
        rate: toNumber(form.interestRate.value),
        years: toNumber(form.years.value),
        taxAnnual: toNumber(form.propertyTax.value),
        insuranceAnnual: toNumber(form.insurance.value),
        maintPct: toNumber(form.maintenancePct.value),
        hoaMonthly: toNumber(form.hoa.value),
        rent: toNumber(form.rent.value),
        rentGrowth: toNumber(form.rentGrowthPct.value),
        appreciation: toNumber(form.appreciationPct.value),
        sellingPct: toNumber(form.sellingPct.value),
        horizonYears: toNumber(form.horizonYears.value)
      });

      outBuy.textContent = asCurrency(res.netBuyCost);
      outRent.textContent = asCurrency(res.totalRentOut);
      outAdv.textContent = `${res.advantage >= 0 ? "Buying advantage" : "Renting advantage"}: ${asCurrency(Math.abs(res.advantage))}`;
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
    if (evt.detail?.calculatorType === "Loan-Rent-Or-Buy-Calculator") {
      initRentVsBuy();
    }
  });
})();
