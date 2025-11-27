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

  // Adjust FRA benefit based on claim age using SSA rules (early reduction and delayed credits).
  const adjustBenefit = (fraBenefit, fraAge, claimAge) => {
    if (fraBenefit <= 0) return 0;
    if (claimAge === fraAge) return fraBenefit;

    const monthsDiff = Math.round((claimAge - fraAge) * 12);
    if (monthsDiff < 0) {
      const monthsEarly = Math.abs(monthsDiff);
      const first36 = Math.min(36, monthsEarly);
      const remaining = Math.max(0, monthsEarly - 36);
      const reduction = first36 * (5 / 9 / 100) + remaining * (5 / 12 / 100);
      return fraBenefit * Math.max(0, 1 - reduction);
    } else {
      const maxLateMonths = Math.min(monthsDiff, Math.max(0, (70 - fraAge) * 12));
      const credits = maxLateMonths * (2 / 3 / 100); // 8% per year
      return fraBenefit * (1 + credits);
    }
  };

  const colaFactor = (colaPct, years) => Math.pow(1 + colaPct / 100, Math.max(0, years));

  const lifetimeWithCola = (firstYearAnnual, colaPct, years) => {
    const g = colaPct / 100;
    const n = Math.max(0, years);
    if (n === 0) return 0;
    if (g === 0) return firstYearAnnual * n;
    return firstYearAnnual * ((Math.pow(1 + g, n) - 1) / g);
  };

  function initSocialSecurity() {
    const form = document.getElementById("social-security-estimator-form");
    if (!form) return;

    const resultsBox = document.getElementById("ss-results");
    const noteBox = document.getElementById("ss-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const currentAge = toNumber(form.currentAge.value);
      const claimAge = toNumber(form.claimAge.value);
      const fraAge = toNumber(form.fraAge.value);
      const fraBenefit = toNumber(form.fraBenefit.value);
      const cola = toNumber(form.cola.value);
      const yearsBenefit = toNumber(form.yearsBenefit.value);

      if (fraBenefit <= 0 || claimAge <= 0 || fraAge <= 0) {
        alert("Enter FRA benefit, claim age, and FRA.");
        return;
      }

      const adjMonthly = adjustBenefit(fraBenefit, fraAge, claimAge);
      const yearsUntilClaim = Math.max(0, claimAge - currentAge);
      const adjustedForColaBeforeClaim = adjMonthly * colaFactor(cola, yearsUntilClaim);
      const annualFirstYear = adjustedForColaBeforeClaim * 12;
      const lifetime = lifetimeWithCola(annualFirstYear, cola, yearsBenefit);

      document.getElementById("ss-monthly").textContent = currencyFmt.format(adjustedForColaBeforeClaim);
      document.getElementById("ss-annual").textContent = currencyFmt.format(annualFirstYear);
      document.getElementById("ss-lifetime").textContent = currencyFmt.format(lifetime);

      let note = "Early filing reduces your benefit; filing after FRA increases it until age 70.";
      if (claimAge < fraAge) note = "Claiming before FRA reduces your benefit using SSA early-filing reductions.";
      if (claimAge > fraAge) note = "Claiming after FRA adds delayed retirement credits until age 70.";
      noteBox.innerHTML = `<span class="text-muted">${note}</span>`;

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
    if (evt.detail?.calculatorType === "Social-Security-Estimator") {
      initSocialSecurity();
    }
  });
})();
