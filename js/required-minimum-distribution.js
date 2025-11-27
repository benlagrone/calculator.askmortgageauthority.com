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

  // IRS Uniform Lifetime Table (2022+)
  const uniformFactors = {
    72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2,
    81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.6, 89: 12.8, 90: 12.0,
    91: 11.4, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4,
    101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3, 107: 4.1, 108: 3.9, 109: 3.7,
    110: 3.5, 111: 3.4, 112: 3.3, 113: 3.1, 114: 3.0, 115: 2.9, 116: 2.8, 117: 2.7, 118: 2.5, 119: 2.3, 120: 2.0
  };

  const getFactor = (age) => {
    if (uniformFactors[age]) return uniformFactors[age];
    if (age > 120) return 2.0; // cap
    return null;
  };

  function initRmd() {
    const form = document.getElementById("rmd-form");
    if (!form) return;

    const resultsBox = document.getElementById("rmd-results");
    const nextRow = document.getElementById("rmd-next-row");
    const noteBox = document.getElementById("rmd-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const balance = toNumber(form.balance.value);
      const age = Math.floor(toNumber(form.age.value));
      const growth = toNumber(form.growth.value);

      if (balance <= 0 || age <= 0) {
        alert("Enter a valid balance and age.");
        return;
      }

      const factor = getFactor(age);
      if (!factor) {
        noteBox.innerHTML = `<span class="text-danger">No Uniform Lifetime Table factor for age ${age}. Enter an age 72 or higher.</span>`;
        resultsBox.hidden = false;
        document.getElementById("rmd-factor").textContent = "--";
        document.getElementById("rmd-amount").textContent = "--";
        nextRow.hidden = true;
        return;
      }

      const rmd = balance / factor;
      document.getElementById("rmd-factor").textContent = factor.toFixed(1);
      document.getElementById("rmd-amount").textContent = currencyFmt.format(rmd);

      if (growth) {
        const nextBalance = balance * (1 + growth / 100) - rmd;
        const nextFactor = getFactor(age + 1) || factor;
        const nextRmd = nextBalance / nextFactor;
        document.getElementById("rmd-next").textContent = currencyFmt.format(nextRmd);
        nextRow.hidden = false;
      } else {
        nextRow.hidden = true;
      }

      noteBox.innerHTML = `<span class="text-muted">RMDs use the prior year-end balance divided by the Uniform Lifetime factor for your age.</span>`;
      resultsBox.hidden = false;
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resultsBox.hidden = true;
        nextRow.hidden = true;
        noteBox.textContent = "";
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Required-Minimum-Distribution") {
      initRmd();
    }
  });
})();
