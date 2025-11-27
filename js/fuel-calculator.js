(() => {
  const currencyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const toNumber = (val) => {
    if (val === undefined || val === null) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  function initFuel() {
    const form = document.getElementById("fuel-calculator-form");
    if (!form) return;

    const resultsBox = document.getElementById("fuel-results");
    const noteBox = document.getElementById("fuel-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const distance = toNumber(form.distance.value);
      const mpg = toNumber(form.mpg.value);
      const price = toNumber(form.price.value);
      const trips = toNumber(form.trips.value);

      if (distance <= 0 || mpg <= 0 || price < 0) {
        alert("Enter distance, MPG, and fuel price.");
        return;
      }

      const gallonsPerTrip = distance / mpg;
      const costPerTrip = gallonsPerTrip * price;
      const weeklyTrips = trips > 0 ? trips : 0;
      const weekly = costPerTrip * weeklyTrips;
      const monthly = weekly * 4.345; // average weeks per month
      const annual = weekly * 52;

      document.getElementById("fuel-per-trip").textContent = `${gallonsPerTrip.toFixed(2)} gal`;
      document.getElementById("fuel-cost-trip").textContent = currencyFmt.format(costPerTrip);
      document.getElementById("fuel-weekly").textContent = currencyFmt.format(weekly);
      document.getElementById("fuel-monthly").textContent = currencyFmt.format(monthly);
      document.getElementById("fuel-annual").textContent = currencyFmt.format(annual);

      const freqNote = weeklyTrips > 0 ? `${weeklyTrips} trip(s) per week assumed.` : "Trip frequency not provided; weekly/monthly/annual estimates will be $0.";
      noteBox.innerHTML = `<span class="text-muted">${freqNote}</span>`;

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
    if (evt.detail?.calculatorType === "Fuel-Calculator") {
      initFuel();
    }
  });
})();
