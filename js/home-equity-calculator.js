(() => {
  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
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

  function formatSignedCurrency(value) {
    const safeValue = Number.isFinite(value) ? value : 0;
    if (safeValue < 0) {
      return `-${formatCurrency(Math.abs(safeValue))}`;
    }
    return formatCurrency(safeValue);
  }

  function formatPercent(value) {
    return `${(Number.isFinite(value) ? value : 0).toFixed(2)}%`;
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

  function initHomeEquityCalculator() {
    const form = document.getElementById("home-equity-form");
    if (!form || form.dataset.uiBound === "true") return;
    form.dataset.uiBound = "true";

    const ui = window.CalculatorUI;
    const resultBox = document.getElementById("home-equity-results");
    const statusEl = document.getElementById("he-status");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      ui?.clearFormErrors(form);
      if (ui && !ui.validateForm(form)) {
        return;
      }

      const homeValue = parseNumber(form.homeValue.value);
      const firstMortgageBalance = parseNumber(form.firstMortgageBalance.value);
      const secondLienBalance = parseNumber(form.secondLienBalance.value);
      const sellingCostPct = parseNumber(form.sellingCostPct.value);
      const maxCltv = parseNumber(form.maxCltv.value);

      const fieldChecks = [
        [form.homeValue, homeValue > 0, "Current Home Value must be greater than 0."],
        [form.firstMortgageBalance, firstMortgageBalance >= 0, "First Mortgage Balance must be 0 or greater."],
        [form.secondLienBalance, secondLienBalance >= 0, "Second Mortgage or HELOC Balance must be 0 or greater."],
        [form.sellingCostPct, sellingCostPct >= 0 && sellingCostPct <= 20, "Estimated Selling Costs must be between 0 and 20%."],
        [form.maxCltv, maxCltv > 0 && maxCltv <= 100, "Max Borrowable CLTV must be between 0 and 100%."]
      ];

      let firstInvalidField = null;
      fieldChecks.forEach(([field, isValid, message]) => {
        if (isValid) {
          ui?.clearFieldError(field);
          ui?.markFieldValid(field);
          return;
        }
        ui?.showFieldError(field, message);
        firstInvalidField = firstInvalidField || field;
      });

      if (firstInvalidField) {
        firstInvalidField.focus();
        ui?.hideResults(resultBox);
        return;
      }

      const totalDebt = firstMortgageBalance + secondLienBalance;
      const currentEquity = homeValue - totalDebt;
      const currentCltv = (totalDebt / homeValue) * 100;
      const sellingCosts = homeValue * (sellingCostPct / 100);
      const netSaleProceeds = homeValue - sellingCosts - totalDebt;
      const maxBorrowableBalance = homeValue * (maxCltv / 100);
      const tappableEquity = Math.max(0, maxBorrowableBalance - totalDebt);
      const equityAfterTap = homeValue - (totalDebt + tappableEquity);

      setText("he-current-equity", formatSignedCurrency(currentEquity));
      setText("he-total-debt", formatCurrency(totalDebt));
      setText("he-current-cltv", formatPercent(currentCltv));
      setText("he-selling-costs-output", formatCurrency(sellingCosts));
      setText("he-net-sale-proceeds", formatSignedCurrency(netSaleProceeds));
      setText("he-max-borrowable-balance", formatCurrency(maxBorrowableBalance));
      setText("he-tappable-equity", formatCurrency(tappableEquity));
      setText("he-equity-after-tap", formatSignedCurrency(equityAfterTap));
      setText("he-max-cltv-output", formatPercent(maxCltv));

      if (currentEquity <= 0) {
        setStatus(
          statusEl,
          "is-over",
          "The combined mortgage balances meet or exceed the current home value in this estimate, so there is no remaining equity."
        );
      } else if (tappableEquity <= 0) {
        setStatus(
          statusEl,
          "is-tight",
          `You have estimated equity of ${formatSignedCurrency(currentEquity)}, but the selected ${formatPercent(maxCltv)} borrow limit leaves no tappable equity.`
        );
      } else {
        setStatus(
          statusEl,
          "is-fit",
          `You have estimated equity of ${formatSignedCurrency(currentEquity)}, with about ${formatCurrency(tappableEquity)} potentially available before lender-specific limits and fees.`
        );
      }

      if (ui) {
        ui.revealResults(resultBox);
        ui.track("calculator_result", {
          calculator_type: "Home-Equity-Calculator",
          current_equity: Math.round(currentEquity),
          current_cltv: Number(currentCltv.toFixed(2)),
          tappable_equity: Math.round(tappableEquity),
          net_sale_proceeds: Math.round(netSaleProceeds)
        });
      } else {
        resultBox.hidden = false;
      }
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (statusEl) {
          statusEl.textContent = "";
          statusEl.className = "calc-results-status";
        }
        if (ui) {
          ui.hideResults(resultBox);
        } else {
          resultBox.hidden = true;
        }
      });
    }
  }

  document.addEventListener("calculator:loaded", (event) => {
    if (event.detail?.calculatorType === "Home-Equity-Calculator") {
      initHomeEquityCalculator();
    }
  });
})();
