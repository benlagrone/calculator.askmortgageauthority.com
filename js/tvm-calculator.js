(() => {
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const freq = {
    Annually: 1,
    Semiannually: 2,
    Quarterly: 4,
    Monthly: 12,
    Semimonthly: 24,
    'Bi-Weekly': 26,
    Weekly: 52,
    Daily: 365
  };

  const toNumber = (val) => {
    if (val === undefined || val === null) return 0;
    const cleaned = val.toString().replace(/,/g, '');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const asCurrency = (val) => fmt.format(isFinite(val) ? val : 0);

  function ratePerPeriod(annualRatePercent, compounding) {
    const perYear = freq[compounding] || 12;
    return (annualRatePercent / 100) / perYear;
  }

  function annuityFactor(rate, nper, type) {
    // type: 0 = end, 1 = beginning
    if (rate === 0) return nper;
    return ((1 + rate * type) * (Math.pow(1 + rate, nper) - 1)) / rate;
  }

  function pv(rate, nper, pmt, fv, type) {
    if (rate === 0) return -(fv + pmt * nper);
    const factor = annuityFactor(rate, nper, type);
    return -(fv + pmt * factor) / Math.pow(1 + rate, nper);
  }

  function pmt(rate, nper, pvVal, fv, type) {
    if (nper === 0) return 0;
    if (rate === 0) return -(pvVal + fv) / nper;
    const pow = Math.pow(1 + rate, nper);
    return -rate * (fv + pvVal * pow) / ((1 + rate * type) * (pow - 1));
  }

  function fv(rate, nper, pmtVal, pvVal, type) {
    if (rate === 0) return -(pvVal + pmtVal * nper);
    const pow = Math.pow(1 + rate, nper);
    const factor = annuityFactor(rate, nper, type);
    return -(pvVal * pow + pmtVal * factor);
  }

  function nper(rate, pmtVal, pvVal, fvVal, type) {
    if (rate === 0) {
      const denom = pmtVal;
      if (denom === 0) return null;
      return -(pvVal + fvVal) / denom;
    }
    const pmtAdj = pmtVal * (1 + rate * type);
    const numerator = pmtAdj - fvVal * rate;
    const denom = pmtAdj + pvVal * rate;
    if (denom === 0 || numerator === 0) return null;
    const ratio = numerator / denom;
    if (ratio <= 0) return null;
    return Math.log(ratio) / Math.log(1 + rate);
  }

  function solveRate(nper, pmtVal, pvVal, fvVal, type) {
    const f = (r) => {
      if (Math.abs(r) < 1e-8) r = 1e-8;
      const pow = Math.pow(1 + r, nper);
      return pvVal * pow + pmtVal * (1 + r * type) * ((pow - 1) / r) + fvVal;
    };

    let low = -0.9999;
    let high = 1.0;
    let fLow = f(low);
    let fHigh = f(high);

    // expand bounds if needed
    for (let i = 0; i < 5 && fLow * fHigh > 0; i++) {
      high *= 2;
      fHigh = f(high);
    }

    if (fLow * fHigh > 0) return null;

    for (let i = 0; i < 100; i++) {
      const mid = (low + high) / 2;
      const fMid = f(mid);
      if (Math.abs(fMid) < 1e-9) return mid;
      if (fLow * fMid < 0) {
        high = mid;
        fHigh = fMid;
      } else {
        low = mid;
        fLow = fMid;
      }
    }
    return (low + high) / 2;
  }

  function setupTvm() {
    const form = document.getElementById('tvm-form');
    if (!form) return;

    const modeInput = () =>
      document.querySelector('input[name="tvm-mode"]:checked')?.value === 'beginning'
        ? 1
        : 0;

    const getInputs = () => {
      const compounding = document.getElementById('tvm-compounding')?.value || 'Monthly';
      return {
        pv: toNumber(form.presentValue.value),
        pmt: toNumber(form.payment.value),
        fv: toNumber(form.futureValue.value),
        annualRate: toNumber(form.annualRate.value),
        periods: toNumber(form.period.value),
        compounding,
        mode: modeInput()
      };
    };

    const setValue = (el, val, isCurrency = true) => {
      el.value = isCurrency ? asCurrency(val) : val;
    };

    form.addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-tvm-action');
      if (!action) return;
      e.preventDefault();

      const { pv: pvVal, pmt: pmtVal, fv: fvVal, annualRate, periods, compounding, mode } =
        getInputs();
      const r = ratePerPeriod(annualRate, compounding);
      const pvCash = -Math.abs(pvVal);
      const pmtCash = -Math.abs(pmtVal);
      const fvCash = fvVal;
      const pvEl = form.presentValue;
      const pmtEl = form.payment;
      const fvEl = form.futureValue;
      const rateEl = form.annualRate;
      const nperEl = form.period;

      if (action === 'pv') {
        const res = pv(r, periods, pmtCash, fvCash, mode);
        if (!isFinite(res)) return alert('Unable to solve for PV with the given inputs.');
        setValue(pvEl, Math.abs(res));
      } else if (action === 'pmt') {
        const res = pmt(r, periods, pvCash, fvCash, mode);
        if (!isFinite(res)) return alert('Unable to solve for PMT with the given inputs.');
        setValue(pmtEl, Math.abs(res));
      } else if (action === 'fv') {
        const res = fv(r, periods, pmtCash, pvCash, mode);
        if (!isFinite(res)) return alert('Unable to solve for FV with the given inputs.');
        setValue(fvEl, Math.abs(res), false);
      } else if (action === 'period') {
        const res = nper(r, pmtCash, pvCash, fvCash, mode);
        if (!isFinite(res) || res === null)
          return alert('Unable to solve for periods with the given inputs.');
        nperEl.value = res.toFixed(4);
      } else if (action === 'rate') {
        if (periods <= 0) return alert('Enter periods before solving for rate.');
        const res = solveRate(periods, pmtCash, pvCash, fvCash, mode);
        if (!isFinite(res) || res === null)
          return alert('Unable to solve for rate with the given inputs.');
        const annualPct = res * (freq[compounding] || 12) * 100;
        rateEl.value = annualPct.toFixed(6);
      }
    });
  }

  document.addEventListener('calculator:loaded', (evt) => {
    if (evt.detail?.calculatorType === 'TVM-Calculator') {
      setupTvm();
    }
  });
})();
