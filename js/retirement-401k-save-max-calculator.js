(() => {
  const pctFmt = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

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

  const asCurrency = (n) => currencyFmt.format(isFinite(n) ? n : 0);

  function initSaveMax() {
    const form = document.getElementById("save-max-form");
    if (!form) return;

    const resultsBox = document.getElementById("save-max-results");
    const noteBox = document.getElementById("sm-note");
    const catchupCheckbox = form.catchup;
    const catchupInput = form.catchupAmount;

    catchupInput.disabled = true;
    catchupCheckbox.addEventListener("change", () => {
      catchupInput.disabled = !catchupCheckbox.checked;
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const salary = toNumber(form.salary.value);
      const matchPct = toNumber(form.matchPct.value); // employer contribution percent of salary
      const matchCapPct = toNumber(form.matchCapPct.value); // max salary percent eligible for match
      const planLimit = toNumber(form.planLimit.value);
      const includeCatchup = catchupCheckbox.checked;
      const catchup = includeCatchup ? toNumber(form.catchupAmount.value) : 0;

      if (salary <= 0 || planLimit <= 0) {
        alert("Enter salary and the annual employee contribution limit.");
        return;
      }

      const targetEmployee = planLimit + catchup;
      let recommendedPct = (targetEmployee / salary) * 100;
      let capped = false;

      if (recommendedPct > 100) {
        recommendedPct = 100;
        capped = true;
      }

      const employeeContribution = salary * (recommendedPct / 100);
      const matchEligiblePct = Math.min(recommendedPct, matchCapPct);
      const employerMatch = salary * (matchEligiblePct / 100) * (matchPct / 100);
      const total = employeeContribution + employerMatch;

      document.getElementById("sm-employee-rate").textContent = pctFmt.format(recommendedPct / 100);
      document.getElementById("sm-employee-amount").textContent = asCurrency(employeeContribution);
      document.getElementById("sm-match-amount").textContent = asCurrency(employerMatch);
      document.getElementById("sm-total").textContent = asCurrency(total);

      if (capped) {
        const shortfall = Math.max(0, targetEmployee - employeeContribution);
        noteBox.innerHTML = `<span class="text-danger">Salary not high enough to reach the full employee limit; 100% contribution still leaves ${asCurrency(shortfall)} short.</span>`;
      } else {
        const extra = total - targetEmployee;
        noteBox.innerHTML = `<span class="text-success">This rate reaches the employee limit of ${asCurrency(targetEmployee)}. Employer match adds ${asCurrency(employerMatch)}, bringing your total annual savings to ${asCurrency(total)}.</span>`;
        if (extra < 0) {
          noteBox.innerHTML = `<span class="text-muted">This rate reaches the employee limit of ${asCurrency(targetEmployee)}. Employer match adds ${asCurrency(employerMatch)}, bringing your total annual savings to ${asCurrency(total)}.</span>`;
        }
      }

      resultsBox.hidden = false;
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resultsBox.hidden = true;
        noteBox.textContent = "";
        catchupCheckbox.checked = false;
        catchupInput.disabled = true;
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Retirement-401k-Save-Max-Calculator") {
      initSaveMax();
    }
  });
})();
