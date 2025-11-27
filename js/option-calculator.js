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

  // Standard normal CDF using an approximation
  const normCdf = (x) => {
    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x) / Math.sqrt(2);
    // Abramowitz-Stegun approximation of erf
    const t = 1 / (1 + 0.3275911 * absX);
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
    const cdf = 0.5 * (1 + sign * erf);
    return cdf;
  };

  function blackScholes(S, K, r, sigma, T) {
    if (S <= 0 || K <= 0 || sigma <= 0 || T <= 0) return null;
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    const Nd1 = normCdf(d1);
    const Nd2 = normCdf(d2);
    const NminusD1 = normCdf(-d1);
    const NminusD2 = normCdf(-d2);
    const call = S * Nd1 - K * Math.exp(-r * T) * Nd2;
    const put = K * Math.exp(-r * T) * NminusD2 - S * NminusD1;
    return { call, put, d1, d2 };
  }

  function initOptionCalc() {
    const form = document.getElementById("option-calculator-form");
    if (!form) return;

    const resultsBox = document.getElementById("opt-results");
    const noteBox = document.getElementById("opt-note");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const S = toNumber(form.spot.value);
      const K = toNumber(form.strike.value);
      const T = toNumber(form.time.value);
      const sigma = toNumber(form.vol.value) / 100;
      const r = toNumber(form.rf.value) / 100;

      const res = blackScholes(S, K, r, sigma, T);
      if (!res) {
        alert("Enter valid positive values for price, strike, volatility, and time.");
        return;
      }

      document.getElementById("opt-call").textContent = currencyFmt.format(res.call);
      document.getElementById("opt-put").textContent = currencyFmt.format(res.put);
      document.getElementById("opt-d1").textContent = res.d1.toFixed(4);
      document.getElementById("opt-d2").textContent = res.d2.toFixed(4);

      noteBox.innerHTML = `<span class="text-muted">European options priced via Black-Scholes. Rates and volatility are annualized; time is in years.</span>`;
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
    if (evt.detail?.calculatorType === "Option-Calculator") {
      initOptionCalc();
    }
  });
})();
