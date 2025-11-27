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

  function diffYearsMonths(fromDate, toDate) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const diffMs = toDate - fromDate;
    if (diffMs <= 0) return { years: 0, months: 0, days: 0, fracYears: 0, label: "0 days" };
    const days = Math.round(diffMs / msPerDay);
    const fracYears = days / 365.25;
    const years = Math.floor(fracYears);
    const months = Math.max(0, Math.round((fracYears - years) * 12));
    const labelParts = [];
    if (years) labelParts.push(`${years} year${years !== 1 ? "s" : ""}`);
    if (months) labelParts.push(`${months} month${months !== 1 ? "s" : ""}`);
    if (!years && !months) labelParts.push(`${days} day${days !== 1 ? "s" : ""}`);
    return { years: fracYears, months: months, days, fracYears, label: labelParts.join(" ") };
  }

  function calcRoi({ original, returned, years, months, fromDate, toDate, useDates }) {
    if (original <= 0) throw new Error("Original investment must be greater than zero.");
    let fracYears = 0;
    let periodLabel = "";

    if (useDates && fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      const diff = diffYearsMonths(from, to);
      fracYears = diff.fracYears;
      periodLabel = diff.label;
    } else {
      const m = (toNumber(years) || 0) * 12 + (toNumber(months) || 0);
      fracYears = m / 12;
      const yWhole = Math.floor(m / 12);
      const mRem = m % 12;
      const parts = [];
      if (yWhole) parts.push(`${yWhole} year${yWhole !== 1 ? "s" : ""}`);
      if (mRem) parts.push(`${mRem} month${mRem !== 1 ? "s" : ""}`);
      periodLabel = parts.join(" ") || "0 months";
    }

    const gain = returned - original;
    const roiPct = (gain / original) * 100;
    const simpleAnnual = fracYears > 0 ? roiPct / fracYears : null;
    const compoundAnnual =
      fracYears > 0 && returned > 0 && original > 0
        ? (Math.pow(returned / original, 1 / fracYears) - 1) * 100
        : null;

    return { gain, roiPct, simpleAnnual, compoundAnnual, periodLabel };
  }

  function initRoi() {
    const form = document.getElementById("roi-form");
    if (!form) return;
    const useDatesEl = document.getElementById("roi-use-dates");
    const fromEl = document.getElementById("roi-from");
    const toEl = document.getElementById("roi-to");
    const yearsEl = document.getElementById("roi-years");
    const monthsEl = document.getElementById("roi-months");
    const resultBox = document.getElementById("roi-results");

    useDatesEl.addEventListener("change", () => {
      const checked = useDatesEl.checked;
      yearsEl.disabled = checked;
      monthsEl.disabled = checked;
      fromEl.disabled = !checked;
      toEl.disabled = !checked;
      if (checked) {
        yearsEl.value = "";
        monthsEl.value = "";
      } else {
        fromEl.value = "";
        toEl.value = "";
      }
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const original = toNumber(form.originalInvestment.value);
      const returned = toNumber(form.investmentReturn.value);
      const years = yearsEl.value;
      const months = monthsEl.value;
      const useDates = useDatesEl.checked;
      const fromdate = fromEl.value;
      const todate = toEl.value;

      try {
        const { gain, roiPct, simpleAnnual, compoundAnnual, periodLabel } = calcRoi({
          original,
          returned,
          years,
          months,
          fromDate: fromdate,
          toDate: todate,
          useDates
        });

        document.getElementById("roi-period").textContent = periodLabel;
        document.getElementById("roi-gain").textContent = asCurrency(gain);
        document.getElementById("roi-return-pct").textContent = `${roiPct.toFixed(4)}%`;
        document.getElementById("roi-simple").textContent =
          simpleAnnual !== null ? `${simpleAnnual.toFixed(4)}%` : "N/A";
        document.getElementById("roi-compound").textContent =
          compoundAnnual !== null ? `${compoundAnnual.toFixed(4)}%` : "N/A";

        resultBox.hidden = false;
      } catch (err) {
        alert(err.message || "Unable to calculate ROI. Check inputs.");
      }
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resultBox.hidden = true;
        yearsEl.disabled = false;
        monthsEl.disabled = false;
        fromEl.disabled = true;
        toEl.disabled = true;
        useDatesEl.checked = false;
      });
    }

    // Initialize date fields disabled
    fromEl.disabled = true;
    toEl.disabled = true;
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Return-On-Investment-ROI-Calculator") {
      initRoi();
    }
  });
})();
