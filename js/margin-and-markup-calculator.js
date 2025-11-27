(() => {
  const currencyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const pctFmt = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const toNumber = (val) => {
    if (val === undefined || val === null || val === "") return NaN;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? NaN : n;
  };

  function solve(values) {
    let { cost, price, marginPct, markupPct } = values;

    // If cost and price provided, derive percentages
    if (isFinite(cost) && isFinite(price) && price > 0) {
      marginPct = ((price - cost) / price) * 100;
      markupPct = ((price - cost) / cost) * 100;
    } else if (isFinite(cost) && isFinite(marginPct)) {
      price = cost / (1 - marginPct / 100);
      markupPct = ((price - cost) / cost) * 100;
    } else if (isFinite(cost) && isFinite(markupPct)) {
      price = cost * (1 + markupPct / 100);
      marginPct = ((price - cost) / price) * 100;
    } else if (isFinite(price) && isFinite(marginPct)) {
      cost = price * (1 - marginPct / 100);
      markupPct = ((price - cost) / cost) * 100;
    } else if (isFinite(price) && isFinite(markupPct)) {
      cost = price / (1 + markupPct / 100);
      marginPct = ((price - cost) / price) * 100;
    } else if (isFinite(marginPct) && isFinite(markupPct)) {
      // Not enough to derive cost/price uniquely
      return null;
    } else {
      return null;
    }

    if (!isFinite(cost) || !isFinite(price) || price <= 0 || cost < 0) return null;
    return { cost, price, marginPct, markupPct };
  }

  function initMarginMarkup() {
    const form = document.getElementById("margin-markup-form");
    if (!form) return;

    const resultsBox = document.getElementById("mm-results");
    const noteBox = document.getElementById("mm-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const cost = toNumber(form.cost.value);
      const price = toNumber(form.price.value);
      const marginPct = toNumber(form.marginPct.value);
      const markupPct = toNumber(form.markupPct.value);

      const provided = [cost, price, marginPct, markupPct].filter((v) => isFinite(v)).length;
      if (provided < 2) {
        alert("Please provide at least two values.");
        return;
      }

      const solved = solve({ cost, price, marginPct, markupPct });
      if (!solved) {
        alert("Inputs are insufficient or inconsistent. Provide a different set of two values.");
        return;
      }

      document.getElementById("mm-out-cost").textContent = currencyFmt.format(solved.cost);
      document.getElementById("mm-out-price").textContent = currencyFmt.format(solved.price);
      document.getElementById("mm-out-margin").textContent = pctFmt.format(solved.marginPct / 100);
      document.getElementById("mm-out-markup").textContent = pctFmt.format(solved.markupPct / 100);

      noteBox.innerHTML = `<span class="text-muted">Margin = (Price − Cost) / Price. Markup = (Price − Cost) / Cost.</span>`;
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
    if (evt.detail?.calculatorType === "Margin-and-Markup-Calculator") {
      initMarginMarkup();
    }
  });
})();
