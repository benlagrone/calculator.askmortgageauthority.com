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
    if (val === undefined || val === null) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  function initTbills() {
    const form = document.getElementById("t-bill-form");
    if (!form) return;

    const resultsBox = document.getElementById("t-bill-results");
    const noteBox = document.getElementById("tb-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const face = toNumber(form.face.value);
      const price = toNumber(form.price.value);
      const days = toNumber(form.days.value);

      if (face <= 0 || price <= 0 || days <= 0) {
        alert("Enter face value, purchase price, and days to maturity.");
        return;
      }

      const discount = face - price;
      const bdy = (discount / face) * (360 / days);
      const bey = (discount / price) * (365 / days);

      document.getElementById("tb-discount").textContent = currencyFmt.format(discount);
      document.getElementById("tb-bdy").textContent = pctFmt.format(bdy);
      document.getElementById("tb-bey").textContent = pctFmt.format(bey);

      noteBox.innerHTML = `<span class="text-muted">BDY uses a 360-day year; BEY uses a 365-day year.</span>`;
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
    if (evt.detail?.calculatorType === "US-Treasury-Bill-Calculator") {
      initTbills();
    }
  });
})();
