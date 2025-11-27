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

  function initTip() {
    const form = document.getElementById("tip-calculator-form");
    if (!form) return;

    const resultsBox = document.getElementById("tip-results");
    const noteBox = document.getElementById("tip-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const bill = toNumber(form.bill.value);
      const pct = toNumber(form.percent.value);
      const people = Math.max(1, Math.floor(toNumber(form.people.value)));

      if (bill <= 0 || pct < 0) {
        alert("Enter a bill amount and tip percent.");
        return;
      }

      const tip = bill * (pct / 100);
      const total = bill + tip;
      const perPerson = total / people;

      document.getElementById("tip-amount").textContent = currencyFmt.format(tip);
      document.getElementById("tip-total").textContent = currencyFmt.format(total);
      document.getElementById("tip-per-person").textContent = currencyFmt.format(perPerson);
      noteBox.innerHTML = `<span class="text-muted">${people} person${people > 1 ? "s" : ""} splitting the bill.</span>`;

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
    if (evt.detail?.calculatorType === "Tip-Calculator") {
      initTip();
    }
  });
})();
