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

  function initSalaryIncrease() {
    const form = document.getElementById("salary-increase-form");
    if (!form) return;

    const resultsBox = document.getElementById("si-results");
    const noteBox = document.getElementById("si-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const salary = toNumber(form.salary.value);
      const percent = toNumber(form.percent.value);

      if (salary <= 0 || percent < 0) {
        alert("Enter a salary greater than 0 and a non-negative increase percent.");
        return;
      }

      const annualIncrease = salary * (percent / 100);
      const newAnnual = salary + annualIncrease;
      const monthlyChange = annualIncrease / 12;
      const newMonthly = newAnnual / 12;

      document.getElementById("si-annual-increase").textContent = currencyFmt.format(annualIncrease);
      document.getElementById("si-new-annual").textContent = currencyFmt.format(newAnnual);
      document.getElementById("si-monthly-change").textContent = currencyFmt.format(monthlyChange);
      document.getElementById("si-new-monthly").textContent = currencyFmt.format(newMonthly);

      noteBox.innerHTML = `<span class="text-muted">Based on ${percent}% increase applied to the current annual salary.</span>`;
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
    if (evt.detail?.calculatorType === "Salary-Increase-Calculator") {
      initSalaryIncrease();
    }
  });
})();
