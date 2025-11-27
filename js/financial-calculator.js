(() => {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function parseNumber(value) {
    if (!value) return 0;
    const cleaned = value.toString().replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  function formatCurrency(value) {
    const safe = isFinite(value) ? value : 0;
    return currencyFormatter.format(safe);
  }

  function formatMonthsToYears(months) {
    if (!months || months <= 0) return '0 months';
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    if (years === 0) return `${remMonths} months`;
    if (remMonths === 0) return `${years} years`;
    return `${years} years ${remMonths} months`;
  }

  function buildSchedule(options) {
    const {
      principal,
      annualRate,
      termMonths,
      extraPayment = 0,
      monthlyEscrow = 0,
      pmiPercent = 0,
      propertyPrice = 0,
      cancelPmi = true
    } = options;

    const monthlyRate = annualRate > 0 ? annualRate / 1200 : 0;
    const basePayment =
      monthlyRate > 0
        ? (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -termMonths))
        : principal / termMonths;

    let balance = principal;
    let month = 0;
    let totalInterest = 0;
    let totalPmi = 0;
    let totalEscrow = 0;
    let pmiEndMonth = null;

    // Guard to avoid runaway loops
    const maxMonths = termMonths + 600;

    while (balance > 0 && month < maxMonths) {
      month += 1;
      const interest = monthlyRate > 0 ? balance * monthlyRate : 0;
      const principalPayment = basePayment - interest;
      let extra = extraPayment > 0 ? extraPayment : 0;

      let paymentToPrincipal = principalPayment + extra;
      if (paymentToPrincipal > balance) {
        paymentToPrincipal = balance;
      }

      balance -= paymentToPrincipal;
      totalInterest += interest;

      const ltv = propertyPrice > 0 ? balance / propertyPrice : 1;
      const includePmi = pmiPercent > 0 && (!cancelPmi || ltv > 0.8);
      const pmi =
        includePmi && pmiPercent > 0 ? (principal * (pmiPercent / 100)) / 12 : 0;

      if (!includePmi && pmiEndMonth === null && pmiPercent > 0) {
        pmiEndMonth = month;
      }

      totalPmi += pmi;
      totalEscrow += monthlyEscrow;

      if (balance <= 0) {
        if (pmiEndMonth === null && pmiPercent > 0 && cancelPmi) {
          pmiEndMonth = month;
        }
        break;
      }
    }

    return {
      months: month,
      totalInterest,
      totalPmi,
      totalEscrow,
      basePayment,
      firstPmi: pmiPercent > 0 ? (principal * (pmiPercent / 100)) / 12 : 0,
      pmiEndMonth
    };
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
  }

  function setVisible(id, show) {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = !show;
  }

  function setupFinancialCalculator() {
    const form = document.getElementById('financial-calculator-form');
    if (!form) return;

    const resultBox = form.parentElement.querySelector('[data-result]');

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const loanAmount = parseNumber(form.loanAmount.value);
      const interestRate = parseNumber(form.interestRate.value);
      const years = parseNumber(form.years.value);
      const months = parseNumber(form.months.value);
      const extraMonthlyPayment = parseNumber(form.extraMonthlyPayment.value);
      const propertyTax = parseNumber(form.propertyTax.value);
      const insurance = parseNumber(form.insurance.value);
      const otherFee = parseNumber(form.otherFee.value);
      const pmiPercent = parseNumber(form.pmi.value);
      const propertyPrice = parseNumber(form.propertyPrice.value);
      const cancelPmi = form.cancelPMI.checked;

      const termMonths = years * 12 + months;
      if (!loanAmount || !interestRate || !termMonths) {
        alert('Loan amount, rate, and term are required.');
        return;
      }

      const monthlyEscrow = (propertyTax + insurance + otherFee) / 12;

      const baseSchedule = buildSchedule({
        principal: loanAmount,
        annualRate: interestRate,
        termMonths,
        extraPayment: 0,
        monthlyEscrow,
        pmiPercent,
        propertyPrice,
        cancelPmi
      });

      const withExtraSchedule = buildSchedule({
        principal: loanAmount,
        annualRate: interestRate,
        termMonths,
        extraPayment: extraMonthlyPayment,
        monthlyEscrow,
        pmiPercent,
        propertyPrice,
        cancelPmi
      });

      const monthlyWithPmi =
        withExtraSchedule.basePayment + monthlyEscrow + withExtraSchedule.firstPmi;
      const monthlyWithoutPmi = withExtraSchedule.basePayment + monthlyEscrow;
      const totalPayment =
        loanAmount +
        withExtraSchedule.totalInterest +
        withExtraSchedule.totalPmi +
        withExtraSchedule.totalEscrow;
      const annualPayment = monthlyWithoutPmi * 12;
      const mortgageConstant = withExtraSchedule.basePayment / loanAmount;

      const interestSaving =
        baseSchedule.totalInterest - withExtraSchedule.totalInterest;
      const payoffEarlierByMonths =
        baseSchedule.months - withExtraSchedule.months;

      const hasPmi = pmiPercent > 0;
      if (hasPmi) {
        const monthsWithPmi =
          withExtraSchedule.pmiEndMonth || withExtraSchedule.months || termMonths;
        setText('pmiMonthLabel', `First ${monthsWithPmi} month(s):`);
        setText('mPaymentWithPmi', formatCurrency(monthlyWithPmi));
        setText('monthlyPMI', formatCurrency(withExtraSchedule.firstPmi));
        setText(
          'afterPMItext',
          `After ${monthsWithPmi} month(s) (no PMI): ${formatCurrency(
            monthlyWithoutPmi
          )}`
        );
      }

      setVisible('pmiMonthLabel', hasPmi);
      setVisible('mPaymentWithPmi', hasPmi);
      setVisible('monthlyPMILabel', hasPmi);
      setVisible('monthlyPMI', hasPmi);
      setVisible('afterPMItext', hasPmi && cancelPmi);

      setText('monthlyPayment', formatCurrency(monthlyWithoutPmi));
      setText('totalPayment', formatCurrency(totalPayment));
      setText('totalInterest', formatCurrency(withExtraSchedule.totalInterest));
      setText('annualPayment', formatCurrency(annualPayment));
      setText(
        'mortgageConstant',
        `${(mortgageConstant * 100).toFixed(3)}% of loan amount`
      );

      const hasExtra = extraMonthlyPayment > 0;
      setVisible('extraText', hasExtra);
      setVisible('interestSavingLabel', hasExtra);
      setVisible('interestSaving', hasExtra);
      setVisible('payoffEarlierByLabel', hasExtra);
      setVisible('payoffEarlierBy', hasExtra);

      if (hasExtra) {
        setText('interestSaving', formatCurrency(interestSaving));
        setText(
          'payoffEarlierBy',
          payoffEarlierByMonths > 0
            ? formatMonthsToYears(payoffEarlierByMonths)
            : 'No change'
        );
      }

      if (resultBox) {
        resultBox.hidden = false;
      }
    });

    const resetButton = form.querySelector('[data-reset]');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        if (resultBox) {
          resultBox.hidden = true;
        }
      });
    }

    const calcLoanButton = form.querySelector('[data-calc-loan]');
    if (calcLoanButton) {
      calcLoanButton.addEventListener('click', () => {
        const input = prompt(
          'Enter property price * down payment (e.g., 375000*20%)'
        );
        if (!input) return;
        const cleaned = input.replace(/,/g, '').replace('%', '');
        const parts = cleaned.split('*');
        const price = parseNumber(parts[0]);
        const downPct = parts[1] ? parseNumber(parts[1]) : 0;
        if (!price) return;
        const loanAmount =
          parts.length === 1 ? price : price - (price * downPct) / 100;
        form.loanAmount.value = loanAmount.toLocaleString('en-US');
        if (!form.propertyPrice.value) {
          form.propertyPrice.value = price.toLocaleString('en-US');
        }
      });
    }
  }

  document.addEventListener('calculator:loaded', (event) => {
    if (event.detail && event.detail.calculatorType === 'Financial-Calculators') {
      setupFinancialCalculator();
    }
  });
})();
