(() => {
  const conversions = {
    length: {
      units: ["meter", "kilometer", "mile", "foot", "inch", "centimeter"],
      toBase: {
        meter: (v) => v,
        kilometer: (v) => v * 1000,
        mile: (v) => v * 1609.34,
        foot: (v) => v * 0.3048,
        inch: (v) => v * 0.0254,
        centimeter: (v) => v * 0.01
      },
      fromBase: {
        meter: (v) => v,
        kilometer: (v) => v / 1000,
        mile: (v) => v / 1609.34,
        foot: (v) => v / 0.3048,
        inch: (v) => v / 0.0254,
        centimeter: (v) => v / 0.01
      }
    },
    weight: {
      units: ["kilogram", "gram", "pound", "ounce"],
      toBase: {
        kilogram: (v) => v,
        gram: (v) => v / 1000,
        pound: (v) => v * 0.45359237,
        ounce: (v) => v * 0.0283495
      },
      fromBase: {
        kilogram: (v) => v,
        gram: (v) => v * 1000,
        pound: (v) => v / 0.45359237,
        ounce: (v) => v / 0.0283495
      }
    },
    volume: {
      units: ["liter", "milliliter", "gallon", "quart", "pint", "cup", "fluid_ounce"],
      toBase: {
        liter: (v) => v,
        milliliter: (v) => v / 1000,
        gallon: (v) => v * 3.78541,
        quart: (v) => v * 0.946353,
        pint: (v) => v * 0.473176,
        cup: (v) => v * 0.236588,
        fluid_ounce: (v) => v * 0.0295735
      },
      fromBase: {
        liter: (v) => v,
        milliliter: (v) => v * 1000,
        gallon: (v) => v / 3.78541,
        quart: (v) => v / 0.946353,
        pint: (v) => v / 0.473176,
        cup: (v) => v / 0.236588,
        fluid_ounce: (v) => v / 0.0295735
      }
    },
    temperature: {
      units: ["celsius", "fahrenheit", "kelvin"],
      convert: (val, from, to) => {
        if (from === to) return val;
        let c;
        switch (from) {
          case "celsius":
            c = val;
            break;
          case "fahrenheit":
            c = (val - 32) * (5 / 9);
            break;
          case "kelvin":
            c = val - 273.15;
            break;
          default:
            c = val;
        }
        switch (to) {
          case "celsius":
            return c;
          case "fahrenheit":
            return c * (9 / 5) + 32;
          case "kelvin":
            return c + 273.15;
          default:
            return c;
        }
      }
    }
  };

  const toNumber = (val) => {
    if (val === undefined || val === null) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const formatValue = (val) => {
    if (!isFinite(val)) return "--";
    const abs = Math.abs(val);
    const decimals = abs >= 1000 ? 2 : abs >= 1 ? 4 : 6;
    return Number(val).toFixed(decimals);
  };

  function populateUnits(category, fromSelect, toSelect) {
    const def = conversions[category];
    const units = def.units;
    fromSelect.innerHTML = "";
    toSelect.innerHTML = "";
    units.forEach((u, idx) => {
      const opt1 = document.createElement("option");
      opt1.value = u;
      opt1.textContent = prettyUnit(u);
      const opt2 = document.createElement("option");
      opt2.value = u;
      opt2.textContent = prettyUnit(u);
      fromSelect.appendChild(opt1);
      toSelect.appendChild(opt2);
      if (idx === 0) fromSelect.value = u;
      if (idx === units.length - 1) toSelect.value = u;
    });
  }

  const prettyUnit = (u) => u.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  function initUnitConversion() {
    const form = document.getElementById("unit-conversion-form");
    if (!form) return;
    const fromSelect = form.fromUnit;
    const toSelect = form.toUnit;
    const categorySelect = form.category;
    const resultsBox = document.getElementById("uc-results");
    const noteBox = document.getElementById("uc-note");

    const refreshUnits = () => {
      populateUnits(categorySelect.value, fromSelect, toSelect);
    };

    categorySelect.addEventListener("change", refreshUnits);
    refreshUnits();

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const category = categorySelect.value;
      const val = toNumber(form.value.value);
      const from = fromSelect.value;
      const to = toSelect.value;

      if (!conversions[category]) return;
      let output;
      if (category === "temperature") {
        output = conversions.temperature.convert(val, from, to);
      } else {
        const baseVal = conversions[category].toBase[from](val);
        output = conversions[category].fromBase[to](baseVal);
      }

      document.getElementById("uc-output").textContent = `${formatValue(output)} ${prettyUnit(to)}`;
      noteBox.innerHTML = `<span class="text-muted">${prettyUnit(from)} → ${prettyUnit(to)} conversion.</span>`;
      resultsBox.hidden = false;
    });

    const resetBtn = form.querySelector("[data-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        resultsBox.hidden = true;
        noteBox.textContent = "";
        refreshUnits();
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Unit-Conversion") {
      initUnitConversion();
    }
  });
})();
