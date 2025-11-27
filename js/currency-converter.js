(() => {
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 day
  const STORAGE_KEY = "fx:currencies";

  const fallbackCurrencies = {
    USD: "U.S. Dollar",
    EUR: "Euro",
    GBP: "British Pound",
    CHF: "Swiss Franc",
    CAD: "Canadian Dollar",
    AUD: "Australian Dollar",
    NZD: "New Zealand Dollar",
    JPY: "Japanese Yen",
    CNY: "Chinese Yuan",
    HKD: "Hong Kong Dollar",
    SGD: "Singapore Dollar",
    SEK: "Swedish Krona",
    NOK: "Norwegian Krone",
    DKK: "Danish Krone",
    PLN: "Polish Zloty",
    CZK: "Czech Koruna",
    HUF: "Hungarian Forint",
    MXN: "Mexican Peso",
    BRL: "Brazilian Real",
    ZAR: "South African Rand",
    INR: "Indian Rupee",
    KRW: "South Korean Won",
    THB: "Thai Baht",
    TRY: "Turkish Lira",
    RON: "Romanian Leu",
    ILS: "Israeli Shekel",
    PHP: "Philippine Peso",
    MYR: "Malaysian Ringgit",
    IDR: "Indonesian Rupiah"
  };

  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  });

  const toNumber = (val) => {
    if (!val) return 0;
    const cleaned = val.toString().replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  function loadCachedCurrencies() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed.data || !parsed.cachedAt) return null;
      if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) return null;
      return parsed.data;
    } catch (e) {
      return null;
    }
  }

  function cacheCurrencies(data) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ data, cachedAt: Date.now() })
      );
    } catch (e) {
      // ignore
    }
  }

  async function fetchCurrencies() {
    const cached = loadCachedCurrencies();
    if (cached) return cached;
    try {
      const res = await fetch("/api/currencies");
      if (!res.ok) throw new Error("currency fetch failed");
      const data = await res.json();
      cacheCurrencies(data);
      return data;
    } catch (e) {
      return fallbackCurrencies;
    }
  }

  function populateSelect(select, currencies, selected) {
    const entries = Object.entries(currencies).sort((a, b) =>
      a[0].localeCompare(b[0])
    );
    select.innerHTML = "";
    for (const [code, name] of entries) {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = `${code} - ${name}`;
      if (selected && selected === code) opt.selected = true;
      select.appendChild(opt);
    }
  }

  async function initCurrencyConverter() {
    const form = document.getElementById("currency-converter-form");
    if (!form) return;
    const fromSelect = document.getElementById("fx-from");
    const toSelect = document.getElementById("fx-to");
    const amountInput = document.getElementById("fx-amount");
    const resultBox = document.getElementById("fx-results");
    const resultText = document.getElementById("fx-result-text");
    const reverseText = document.getElementById("fx-reverse-text");
    const meta = document.getElementById("fx-meta");

    const currencies = await fetchCurrencies();
    populateSelect(fromSelect, currencies, "USD");
    populateSelect(toSelect, currencies, "EUR");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const amount = toNumber(amountInput.value);
      const from = fromSelect.value;
      const to = toSelect.value;
      if (!from || !to) return;
      if (!amount || amount <= 0) {
        alert("Enter a valid amount");
        return;
      }
      try {
        const res = await fetch(
          `/api/rates?from=${encodeURIComponent(from)}&to=${encodeURIComponent(
            to
          )}&amount=${encodeURIComponent(amount)}`
        );
        if (!res.ok) throw new Error("rate fetch failed");
        const data = await res.json();
        const converted = data.converted;
        const reverseConverted = data.reverse_converted;
        const rate = data.rate;
        const reverseRate = data.reverse_rate;

        resultText.textContent = `${amount.toLocaleString()} ${from} = ${converted.toLocaleString()} ${to} (rate ${rate.toFixed(
          6
        )})`;
        reverseText.textContent = `${amount.toLocaleString()} ${to} = ${reverseConverted.toLocaleString()} ${from} (rate ${reverseRate.toFixed(
          6
        )})`;
        meta.textContent = `Source: ${data.source} • Cached at: ${new Date(
          data.fetched_at * 1000
        ).toLocaleString()}`;
        resultBox.hidden = false;
      } catch (err) {
        alert("Could not fetch rate. Please try again.");
      }
    });

    const swapBtn = form.querySelector("[data-fx-swap]");
    if (swapBtn) {
      swapBtn.addEventListener("click", () => {
        const fromVal = fromSelect.value;
        fromSelect.value = toSelect.value;
        toSelect.value = fromVal;
      });
    }
  }

  document.addEventListener("calculator:loaded", (evt) => {
    if (evt.detail?.calculatorType === "Currency-Converter") {
      initCurrencyConverter();
    }
  });
})();
