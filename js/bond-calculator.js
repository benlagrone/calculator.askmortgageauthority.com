(() => {
  const freq = {
    Annually: 1,
    Semiannually: 2,
    Quarterly: 4,
    Monthly: 12,
    Weekly: 52,
    Daily: 365
  };

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

  function priceBond({ face, couponAnnual, yieldAnnualPct, years, compounding }) {
    const n = (freq[compounding] || 2) * years;
    const r = (yieldAnnualPct / 100) / (freq[compounding] || 2);
    const c = couponAnnual / (freq[compounding] || 2);
    if (r === 0) return c * n + face;
    const pvCoupons = c * (1 - Math.pow(1 + r, -n)) / r;
    const pvFace = face / Math.pow(1 + r, n);
    return pvCoupons + pvFace;
  }

  function solveCoupon({ price, face, yieldAnnualPct, years, compounding }) {
    const n = (freq[compounding] || 2) * years;
    const r = (yieldAnnualPct / 100) / (freq[compounding] || 2);
    if (n <= 0 || r === 0) return 0;
    const denom = (1 - Math.pow(1 + r, -n)) / r;
    const cPer = (price - face / Math.pow(1 + r, n)) / denom;
    return cPer * (freq[compounding] || 2);
  }

  function solveFace({ price, couponAnnual, yieldAnnualPct, years, compounding }) {
    const n = (freq[compounding] || 2) * years;
    const r = (yieldAnnualPct / 100) / (freq[compounding] || 2);
    const c = couponAnnual / (freq[compounding] || 2);
    if (n <= 0 || r === 0) return 0;
    const pvCoupons = c * (1 - Math.pow(1 + r, -n)) / r;
    const pvFace = price - pvCoupons;
    return pvFace * Math.pow(1 + r, n);
  }

  function solveYears({ price, face, couponAnnual, yieldAnnualPct, compounding }) {
    const periodsPerYear = freq[compounding] || 2;
    const r = (yieldAnnualPct / 100) / periodsPerYear;
    const c = couponAnnual / periodsPerYear;
    if (r === 0 || price <= 0 || face <= 0) return null;
    // Solve for n via bisection
    let low = 0.0001;
    let high = 100 * periodsPerYear; // up to 100 years
    const f = (n) => {
      const pvC = c * (1 - Math.pow(1 + r, -n)) / r;
      const pvF = face / Math.pow(1 + r, n);
      return pvC + pvF - price;
    };
    let fLow = f(low);
    let fHigh = f(high);
    if (fLow * fHigh > 0) return null;
    for (let i = 0; i < 100; i++) {
      const mid = (low + high) / 2;
      const fMid = f(mid);
      if (Math.abs(fMid) < 1e-6) return mid / periodsPerYear;
      if (fLow * fMid < 0) {
        high = mid;
        fHigh = fMid;
      } else {
        low = mid;
        fLow = fMid;
      }
    }
    return (low + high) / 2 / periodsPerYear;
  }

  function solveYield({ price, face, couponAnnual, years, compounding }) {
    const periodsPerYear = freq[compounding] || 2;
    const n = periodsPerYear * years;
    const c = couponAnnual / periodsPerYear;
    if (price <= 0 || face <= 0 || n <= 0) return null;
    // IRR bisection on rate per period
    const f = (r) => {
      const pvC = c * (1 - Math.pow(1 + r, -n)) / r;
      const pvF = face / Math.pow(1 + r, n);
      return pvC + pvF - price;
    };
    let low = -0.999; // allow slight negative
    let high = 1.0;
    let fLow = f(low);
    let fHigh = f(high);
    for (let i = 0; i < 5 && fLow * fHigh > 0; i++) {
      high *= 2;
      fHigh = f(high);
    }
    if (fLow * fHigh > 0) return null;
    for (let i = 0; i < 200; i++) {
      const mid = (low + high) / 2;
      const fMid = f(mid);
      if (Math.abs(fMid) < 1e-8) return mid * periodsPerYear * 100;
      if (fLow * fMid < 0) {
        high = mid;
        fHigh = fMid;
      } else {
        low = mid;
        fLow = fMid;
      }
    }
    return ((low + high) / 2) * periodsPerYear * 100;
  }

  function initBond() {
    const form = document.getElementById("bond-form");
    if (!form) return;
    const resultBox = document.getElementById("bond-results");
    const outputs = {
      price: document.getElementById("bond-price-out"),
      face: document.getElementById("bond-face-out"),
      coupon: document.getElementById("bond-coupon-out"),
      yield: document.getElementById("bond-yield-out"),
      years: document.getElementById("bond-years-out")
    };

    const getInputs = () => {
      return {
        price: toNumber(form.bondPrice.value),
        face: toNumber(form.faceValue.value),
        couponAnnual: toNumber(form.coupon.value),
        yieldAnnualPct: toNumber(form.yield.value),
        years: toNumber(form.years.value),
        compounding: form.compounding.value
      };
    };

    form.addEventListener("click", (e) => {
      const action = e.target.getAttribute("data-bond-action");
      if (!action) return;
      e.preventDefault();
      const vals = getInputs();
      let solved = {};

      if (action === "price") {
        const p = priceBond(vals);
        form.bondPrice.value = asCurrency(p);
        solved.price = p;
      } else if (action === "coupon") {
        const c = solveCoupon(vals);
        form.coupon.value = asCurrency(c);
        solved.coupon = c;
      } else if (action === "face") {
        const f = solveFace(vals);
        form.faceValue.value = asCurrency(f);
        solved.face = f;
      } else if (action === "years") {
        const y = solveYears(vals);
        if (y === null) {
          alert("Unable to solve years with given inputs.");
          return;
        }
        form.years.value = y.toFixed(4);
        solved.years = y;
      } else if (action === "yield") {
        const y = solveYield(vals);
        if (y === null) {
          alert("Unable to solve yield with given inputs.");
          return;
        }
        form.yield.value = y.toFixed(4);
        solved.yield = y;
      }

      const latest = { ...getInputs(), ...solved };
      outputs.price.textContent = asCurrency(latest.price);
      outputs.face.textContent = asCurrency(latest.face);
      outputs.coupon.textContent = asCurrency(latest.couponAnnual);
      outputs.yield.textContent = isFinite(latest.yieldAnnualPct)
        ? `${latest.yieldAnnualPct.toFixed(4)}%`
        : "N/A";
      outputs.years.textContent = isFinite(latest.years) ? latest.years.toFixed(4) : "N/A";
      resultBox.hidden = false;
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resultBox.hidden = true;
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Bond-Calculator") {
      initBond();
    }
  });
})();
