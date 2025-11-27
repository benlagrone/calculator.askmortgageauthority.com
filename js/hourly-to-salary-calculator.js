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

  function initHourlySalary() {
    const form = document.getElementById("hourly-salary-form");
    if (!form) return;

    const resultsBox = document.getElementById("hs-results");
    const noteBox = document.getElementById("hs-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const hourly = toNumber(form.hourly.value);
      const hours = toNumber(form.hours.value);
      const otMultiplier = toNumber(form.otMultiplier.value) || 1.5;
      const otHours = toNumber(form.otHours.value);

      if (hourly <= 0 || hours < 0) {
        alert("Enter hourly rate and hours per week.");
        return;
      }

      const regularHours = Math.min(hours, 40);
      const overtimeHours = Math.max(0, hours - 40) + Math.max(0, otHours);

      const weekly =
        regularHours * hourly +
        overtimeHours * hourly * otMultiplier;

      const monthly = weekly * 4.345; // avg weeks per month
      const annual = weekly * 52;

      document.getElementById("hs-weekly").textContent = currencyFmt.format(weekly);
      document.getElementById("hs-monthly").textContent = currencyFmt.format(monthly);
      document.getElementById("hs-annual").textContent = currencyFmt.format(annual);

      noteBox.innerHTML = `<span class="text-muted">Uses overtime rate for hours above 40/week plus optional overtime hours field. Monthly estimate uses 4.345 weeks/month.</span>`;
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
    if (evt.detail?.calculatorType === "Hourly-to-Salary-Calculator") {
      initHourlySalary();
    }
  });
})();
