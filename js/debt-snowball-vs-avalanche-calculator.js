(() => {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const monthYearFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  });

  function parseNumber(value) {
    if (!value) return 0;
    const cleaned = value.toString().replace(/,/g, "");
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatCurrency(value) {
    return currencyFormatter.format(Number.isFinite(value) ? value : 0);
  }

  function formatMonthsBreakdown(value) {
    const totalMonths = Math.max(0, Math.round(value || 0));
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years > 0 && months > 0) {
      return `${years} years ${months} months`;
    }
    if (years > 0) {
      return `${years} years`;
    }
    return `${months} months`;
  }

  function parseMonthValue(value) {
    if (!value || !/^\d{4}-\d{2}$/.test(value)) {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  function defaultMonthValue() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }

  function addMonths(date, offset) {
    return new Date(date.getFullYear(), date.getMonth() + offset, 1);
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = value;
  }

  function setStatus(statusEl, type, text) {
    if (!statusEl) return;
    statusEl.className = `calc-results-status ${type}`;
    statusEl.textContent = text;
  }

  function extractDebtEntries(form) {
    return Array.from(form.querySelectorAll("[data-debt-entry]")).map((entry, index) => {
      const nameField = entry.querySelector('[data-role="name"]');
      const balanceField = entry.querySelector('[data-role="balance"]');
      const aprField = entry.querySelector('[data-role="apr"]');
      const minimumField = entry.querySelector('[data-role="minimum"]');
      const name = (nameField?.value || "").trim() || `Debt ${index + 1}`;
      const balance = parseNumber(balanceField?.value);
      const apr = parseNumber(aprField?.value);
      const minimum = parseNumber(minimumField?.value);
      const rawHasValue = Boolean((nameField?.value || "").trim()) || balance > 0 || apr > 0 || minimum > 0;

      return {
        index,
        entry,
        nameField,
        balanceField,
        aprField,
        minimumField,
        name,
        balance,
        apr,
        minimum,
        rawHasValue
      };
    });
  }

  function strategyComparator(strategy) {
    if (strategy === "snowball") {
      return (a, b) => {
        if (Math.abs(a.balance - b.balance) > 0.01) {
          return a.balance - b.balance;
        }
        if (Math.abs(a.apr - b.apr) > 0.01) {
          return b.apr - a.apr;
        }
        return a.index - b.index;
      };
    }

    return (a, b) => {
      if (Math.abs(a.apr - b.apr) > 0.01) {
        return b.apr - a.apr;
      }
      if (Math.abs(a.balance - b.balance) > 0.01) {
        return a.balance - b.balance;
      }
      return a.index - b.index;
    };
  }

  function simulateStrategy(debts, extraPayment, strategy, startDate) {
    const debtsState = debts.map((debt) => ({
      ...debt,
      balance: debt.balance,
      paidOffMonth: null
    }));

    const comparator = strategyComparator(strategy);
    let months = 0;
    let totalInterest = 0;
    let totalPaid = 0;
    const payoffOrder = [];
    const maxMonths = 7200;

    while (debtsState.some((debt) => debt.balance > 0.01) && months < maxMonths) {
      months += 1;

      debtsState.forEach((debt) => {
        if (debt.balance <= 0.01) return;
        const interest = debt.balance * (debt.apr / 100 / 12);
        debt.balance += interest;
        totalInterest += interest;
      });

      const activeDebts = debtsState.filter((debt) => debt.balance > 0.01);
      let paymentPool = activeDebts.reduce((sum, debt) => sum + debt.minimum, 0) + extraPayment;

      activeDebts.forEach((debt) => {
        const minimumDue = Math.min(debt.balance, debt.minimum);
        debt.balance -= minimumDue;
        totalPaid += minimumDue;
        paymentPool -= minimumDue;

        if (debt.balance <= 0.01 && debt.paidOffMonth === null) {
          debt.balance = 0;
          debt.paidOffMonth = months;
          payoffOrder.push(debt.name);
        }
      });

      while (paymentPool > 0.01) {
        const targets = debtsState
          .filter((debt) => debt.balance > 0.01)
          .sort(comparator);
        if (!targets.length) break;

        const target = targets[0];
        const payment = Math.min(target.balance, paymentPool);
        target.balance -= payment;
        totalPaid += payment;
        paymentPool -= payment;

        if (target.balance <= 0.01 && target.paidOffMonth === null) {
          target.balance = 0;
          target.paidOffMonth = months;
          payoffOrder.push(target.name);
        }
      }
    }

    if (months >= maxMonths) {
      return null;
    }

    const debtFreeDate = months > 0 ? addMonths(startDate, months - 1) : startDate;
    const firstPaidOff = debtsState
      .filter((debt) => debt.paidOffMonth !== null)
      .sort((a, b) => (a.paidOffMonth || 0) - (b.paidOffMonth || 0))[0] || null;

    return {
      months,
      totalInterest,
      totalPaid,
      debtFreeDate,
      payoffOrder,
      firstPaidOff,
      monthlyBudget: debts.reduce((sum, debt) => sum + debt.minimum, 0) + extraPayment
    };
  }

  function initDebtStrategyCalculator() {
    const form = document.getElementById("debt-strategy-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("debt-strategy-results");
    const statusEl = document.getElementById("dsa-status");
    const startMonthField = form.startMonth;

    if (startMonthField && !startMonthField.value) {
      startMonthField.value = defaultMonthValue();
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const extraPayment = parseNumber(form.extraPayment.value);
      const entries = extractDebtEntries(form);

      let firstInvalidField = null;
      if (extraPayment < 0) {
        ui?.showFieldError(form.extraPayment, "Extra Monthly Payment must be 0 or greater.");
        firstInvalidField = firstInvalidField || form.extraPayment;
      } else {
        ui?.clearFieldError(form.extraPayment);
        ui?.markFieldValid(form.extraPayment);
      }

      const activeDebts = [];
      entries.forEach((entry) => {
        if (!entry.rawHasValue) {
          [entry.balanceField, entry.aprField, entry.minimumField].forEach((field) => {
            if (field) {
              ui?.clearFieldError(field);
            }
          });
          return;
        }

        const rowValidations = [
          [entry.balanceField, entry.balance > 0, `${entry.name} balance must be greater than 0.`],
          [entry.aprField, entry.apr >= 0 && entry.apr <= 100, `${entry.name} APR must be between 0 and 100%.`],
          [entry.minimumField, entry.minimum > 0, `${entry.name} minimum payment must be greater than 0.`]
        ];

        let rowIsValid = true;
        rowValidations.forEach(([field, isValid, message]) => {
          if (!field) return;
          if (isValid) {
            ui?.clearFieldError(field);
            ui?.markFieldValid(field);
            return;
          }
          rowIsValid = false;
          ui?.showFieldError(field, message);
          firstInvalidField = firstInvalidField || field;
        });

        if (!rowIsValid) {
          return;
        }

        const firstMonthInterest = entry.balance * (entry.apr / 100 / 12);
        if (entry.minimum <= firstMonthInterest) {
          ui?.showFieldError(
            entry.minimumField,
            `${entry.name} minimum payment must be higher than the first month's interest so the balance can go down.`
          );
          firstInvalidField = firstInvalidField || entry.minimumField;
          return;
        }

        activeDebts.push({
          index: entry.index,
          name: entry.name,
          balance: entry.balance,
          apr: entry.apr,
          minimum: entry.minimum
        });
      });

      if (!firstInvalidField && activeDebts.length < 2) {
        ui?.showFormError(form, "Use at least two debts to compare snowball and avalanche strategies.");
        ui?.hideResults(resultBox);
        return;
      }

      if (firstInvalidField) {
        firstInvalidField.focus();
        ui?.hideResults(resultBox);
        return;
      }

      const startDate = parseMonthValue(form.startMonth.value);
      const snowball = simulateStrategy(activeDebts, extraPayment, "snowball", startDate);
      const avalanche = simulateStrategy(activeDebts, extraPayment, "avalanche", startDate);

      if (!snowball || !avalanche) {
        ui?.showFormError(form, "Unable to build a payoff plan from these inputs.");
        ui?.hideResults(resultBox);
        return;
      }

      const interestDiff = Math.abs(snowball.totalInterest - avalanche.totalInterest);
      const monthsDiff = Math.abs(snowball.months - avalanche.months);
      const interestWinner = snowball.totalInterest + 0.01 < avalanche.totalInterest
        ? "Snowball"
        : avalanche.totalInterest + 0.01 < snowball.totalInterest
          ? "Avalanche"
          : "Tie";
      const timeWinner = snowball.months < avalanche.months
        ? "Snowball"
        : avalanche.months < snowball.months
          ? "Avalanche"
          : "Tie";

      const snowballFirstMonth = snowball.firstPaidOff?.paidOffMonth || 0;
      const avalancheFirstMonth = avalanche.firstPaidOff?.paidOffMonth || 0;
      const firstWinner = snowballFirstMonth && avalancheFirstMonth
        ? snowballFirstMonth < avalancheFirstMonth
          ? "Snowball"
          : avalancheFirstMonth < snowballFirstMonth
            ? "Avalanche"
            : "Tie"
        : "Tie";

      const heroText = interestWinner === "Tie"
        ? "Tie on total interest"
        : `${interestWinner} saves ${formatCurrency(interestDiff)}`;

      if (interestWinner === "Tie" && timeWinner === "Tie") {
        setStatus(
          statusEl,
          "is-tight",
          "Both strategies land on nearly the same payoff timeline and interest cost with this debt mix."
        );
      } else if (interestWinner === "Avalanche") {
        setStatus(
          statusEl,
          "is-fit",
          `Avalanche reduces interest the most${timeWinner === "Avalanche" ? ` and gets you debt-free ${formatMonthsBreakdown(monthsDiff)} sooner` : ""}.`
        );
      } else if (interestWinner === "Snowball") {
        setStatus(
          statusEl,
          "is-fit",
          `Snowball performs better in this mix${timeWinner === "Snowball" ? ` and gets you debt-free ${formatMonthsBreakdown(monthsDiff)} sooner` : ""}.`
        );
      } else {
        setStatus(
          statusEl,
          "is-tight",
          `${timeWinner} gets you debt-free sooner, but the total interest is nearly the same between strategies.`
        );
      }

      setText("dsa-hero", heroText);
      setText("dsa-interest-winner", interestWinner);
      setText(
        "dsa-interest-note",
        interestWinner === "Tie"
          ? "Both strategies produce nearly the same total interest."
          : `${interestWinner} saves about ${formatCurrency(interestDiff)} in interest over the full payoff plan.`
      );

      setText("dsa-time-winner", timeWinner);
      setText(
        "dsa-time-note",
        timeWinner === "Tie"
          ? "Both strategies reach a debt-free result in about the same time."
          : `${timeWinner} gets you debt-free about ${formatMonthsBreakdown(monthsDiff)} sooner.`
      );

      setText("dsa-first-winner", firstWinner);
      setText(
        "dsa-first-note",
        firstWinner === "Tie"
          ? "Both strategies clear the first debt on about the same timeline."
          : `${firstWinner} clears the first debt sooner, which can change the momentum of the plan.`
      );

      setText("dsa-snowball-date", monthYearFormatter.format(snowball.debtFreeDate));
      setText("dsa-snowball-months", formatMonthsBreakdown(snowball.months));
      setText("dsa-snowball-interest", formatCurrency(snowball.totalInterest));
      setText("dsa-snowball-paid", formatCurrency(snowball.totalPaid));
      setText("dsa-snowball-budget", formatCurrency(snowball.monthlyBudget));
      setText(
        "dsa-snowball-first",
        snowball.firstPaidOff
          ? `${snowball.firstPaidOff.name} in ${formatMonthsBreakdown(snowball.firstPaidOff.paidOffMonth)}`
          : "N/A"
      );
      setText(
        "dsa-snowball-order",
        `Payoff order: ${snowball.payoffOrder.join(" -> ")}`
      );

      setText("dsa-avalanche-date", monthYearFormatter.format(avalanche.debtFreeDate));
      setText("dsa-avalanche-months", formatMonthsBreakdown(avalanche.months));
      setText("dsa-avalanche-interest", formatCurrency(avalanche.totalInterest));
      setText("dsa-avalanche-paid", formatCurrency(avalanche.totalPaid));
      setText("dsa-avalanche-budget", formatCurrency(avalanche.monthlyBudget));
      setText(
        "dsa-avalanche-first",
        avalanche.firstPaidOff
          ? `${avalanche.firstPaidOff.name} in ${formatMonthsBreakdown(avalanche.firstPaidOff.paidOffMonth)}`
          : "N/A"
      );
      setText(
        "dsa-avalanche-order",
        `Payoff order: ${avalanche.payoffOrder.join(" -> ")}`
      );

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "Debt-Snowball-vs-Avalanche-Calculator",
          interest_winner: interestWinner,
          time_winner: timeWinner,
          interest_difference: Math.round(interestDiff),
          month_difference: monthsDiff,
          debt_count: activeDebts.length
        });
      } else {
        resultBox.hidden = false;
      }
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        window.setTimeout(() => {
          if (startMonthField) {
            startMonthField.value = defaultMonthValue();
          }
          if (statusEl) {
            statusEl.textContent = "";
            statusEl.className = "calc-results-status";
          }
          if (ui) {
            ui.hideResults(resultBox);
          } else {
            resultBox.hidden = true;
          }
        }, 0);
      });
    }
  }

  document.addEventListener("calculator:loaded", (event) => {
    if (event.detail?.calculatorType === "Debt-Snowball-vs-Avalanche-Calculator") {
      initDebtStrategyCalculator();
    }
  });
})();
