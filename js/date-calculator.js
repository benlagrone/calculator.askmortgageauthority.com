(() => {
  const toNumber = (val) => {
    if (val === undefined || val === null) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const formatDate = (d) => {
    if (!(d instanceof Date) || isNaN(d)) return "--";
    return d.toISOString().slice(0, 10);
  };

  function initDateCalc() {
    const form = document.getElementById("date-calculator-form");
    if (!form) return;

    const resultsBox = document.getElementById("date-results");
    const noteBox = document.getElementById("date-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const startVal = form.startDate.value;
      const endVal = form.endDate.value;
      const offset = toNumber(form.offset.value);

      const startDate = startVal ? new Date(startVal) : null;
      const endDate = endVal ? new Date(endVal) : null;

      if (!startDate || isNaN(startDate)) {
        alert("Enter a valid start date.");
        return;
      }

      let diffText = "--";
      if (endDate && !isNaN(endDate)) {
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffDays = Math.round((endDate - startDate) / msPerDay);
        diffText = `${diffDays} days`;
      }
      document.getElementById("date-diff").textContent = diffText;

      let shiftedText = "--";
      if (offset !== 0) {
        const shifted = new Date(startDate);
        shifted.setDate(shifted.getDate() + offset);
        shiftedText = formatDate(shifted);
      }
      document.getElementById("date-shifted").textContent = shiftedText;

      noteBox.innerHTML = `<span class="text-muted">Difference uses whole-day rounding. Offset adds days to the start date.</span>`;
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
    if (evt.detail?.calculatorType === "Date-Calculator") {
      initDateCalc();
    }
  });
})();
