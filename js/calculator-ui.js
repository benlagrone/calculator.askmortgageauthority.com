(() => {
  const initializedForms = new WeakSet();
  const startedForms = new WeakSet();
  const FIELD_SELECTOR = "input, select, textarea";

  function getCurrentCalculatorType() {
    const slug = window.__INITIAL_CALCULATOR_SLUG__;
    if (typeof slug === "string" && slug) {
      return slug;
    }
    return window.location.pathname.split("/").pop().replace(".html", "") || "home";
  }

  function track(eventName, detail = {}) {
    const payload = {
      calculator_type: detail.calculator_type || getCurrentCalculatorType(),
      ...detail
    };

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...payload });
  }

  function getFieldWrapper(field) {
    return (
      field.closest(".mortgage-calculators-widget-form-group") ||
      field.closest(".form-group") ||
      field.parentElement
    );
  }

  function getPrimaryLabel(field) {
    const wrapper = getFieldWrapper(field);
    const fieldId = field.id;
    const localLabel = wrapper?.querySelector(
      fieldId
        ? `label[for="${CSS.escape(fieldId)}"]:not(.mortgage-calculators-widget-label--secondary)`
        : "label:not(.mortgage-calculators-widget-label--secondary)"
    );
    if (localLabel) {
      return localLabel;
    }
    if (!fieldId) {
      return null;
    }
    return field.form?.querySelector(
      `label[for="${CSS.escape(fieldId)}"]:not(.mortgage-calculators-widget-label--secondary)`
    ) || null;
  }

  function getFieldLabelText(field) {
    const label = getPrimaryLabel(field);
    const rawText = label ? label.textContent || "" : field.getAttribute("aria-label") || field.name || "This field";
    return rawText
      .replace(/\s*\*\s*$/, "")
      .replace(/\s*\(required\)\s*$/i, "")
      .trim();
  }

  function ensureRequiredMarker(field) {
    const label = getPrimaryLabel(field);
    if (!label || label.querySelector(".calc-required-marker")) {
      return;
    }
    const marker = document.createElement("span");
    marker.className = "calc-required-marker";
    marker.setAttribute("aria-hidden", "true");
    marker.textContent = "*";
    label.appendChild(document.createTextNode(" "));
    label.appendChild(marker);
  }

  function ensureFieldErrorNode(field) {
    const wrapper = getFieldWrapper(field);
    if (!wrapper) {
      return null;
    }

    let node = wrapper.querySelector(`[data-field-error-for="${field.id}"]`);
    if (!node) {
      node = document.createElement("div");
      node.className = "calc-field-error";
      node.dataset.fieldErrorFor = field.id || field.name || "field";
      node.hidden = true;
      wrapper.appendChild(node);
    }

    const describedBy = new Set(
      (field.getAttribute("aria-describedby") || "")
        .split(/\s+/)
        .filter(Boolean)
    );
    if (node.id) {
      describedBy.add(node.id);
    } else {
      node.id = `${field.id || field.name || "field"}-error`;
      describedBy.add(node.id);
    }
    field.setAttribute("aria-describedby", Array.from(describedBy).join(" "));
    return node;
  }

  function clearFieldError(field) {
    const wrapper = getFieldWrapper(field);
    const node = ensureFieldErrorNode(field);
    if (wrapper) {
      wrapper.classList.remove("is-invalid");
    }
    field.removeAttribute("aria-invalid");
    if (node) {
      node.textContent = "";
      node.hidden = true;
    }
  }

  function markFieldValid(field) {
    const wrapper = getFieldWrapper(field);
    if (!wrapper) {
      return;
    }
    wrapper.classList.remove("is-invalid");
    if ((field.value || "").trim()) {
      wrapper.classList.add("is-valid");
    } else {
      wrapper.classList.remove("is-valid");
    }
  }

  function showFieldError(field, message) {
    const wrapper = getFieldWrapper(field);
    const node = ensureFieldErrorNode(field);
    if (wrapper) {
      wrapper.classList.remove("is-valid");
      wrapper.classList.add("is-invalid");
    }
    field.setAttribute("aria-invalid", "true");
    if (node) {
      node.textContent = message;
      node.hidden = false;
    }
  }

  function ensureFormMessage(form) {
    let node = form.querySelector(".calc-form-error");
    if (!node) {
      node = document.createElement("div");
      node.className = "calc-form-error";
      node.hidden = true;
      form.prepend(node);
    }
    return node;
  }

  function showFormError(form, message) {
    const node = ensureFormMessage(form);
    node.textContent = message;
    node.hidden = false;
  }

  function clearFormError(form) {
    const node = ensureFormMessage(form);
    node.textContent = "";
    node.hidden = true;
  }

  function clearFormErrors(form) {
    clearFormError(form);
    form.querySelectorAll(FIELD_SELECTOR).forEach((field) => {
      clearFieldError(field);
      const wrapper = getFieldWrapper(field);
      if (wrapper) {
        wrapper.classList.remove("is-valid");
      }
    });
  }

  function isVisibleField(field) {
    if (field.type === "hidden" || field.disabled) {
      return false;
    }
    return field.getClientRects().length > 0;
  }

  function isEmpty(field) {
    if (field.type === "checkbox" || field.type === "radio") {
      return !field.checked;
    }
    return !(field.value || "").trim();
  }

  function validateRequiredField(field) {
    if (!field.required || !isVisibleField(field)) {
      return true;
    }
    if (isEmpty(field)) {
      showFieldError(field, `${getFieldLabelText(field)} is required.`);
      return false;
    }
    clearFieldError(field);
    markFieldValid(field);
    return true;
  }

  function validateForm(form) {
    clearFormError(form);

    let firstInvalid = null;
    form.querySelectorAll(FIELD_SELECTOR).forEach((field) => {
      if (!validateRequiredField(field) && !firstInvalid) {
        firstInvalid = field;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }

    return true;
  }

  function revealResults(resultEl) {
    if (!resultEl) {
      return;
    }
    resultEl.hidden = false;
    resultEl.classList.add("is-visible");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.requestAnimationFrame(() => {
      resultEl.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  }

  function hideResults(resultEl) {
    if (!resultEl) {
      return;
    }
    resultEl.hidden = true;
    resultEl.classList.remove("is-visible");
  }

  function onFieldInteraction(form, field, calculatorType) {
    if (!startedForms.has(form) && !isEmpty(field)) {
      startedForms.add(form);
      track("calculator_start", {
        calculator_type: calculatorType || getCurrentCalculatorType(),
        form_id: form.id || ""
      });
    }

    if (field.required) {
      validateRequiredField(field);
      return;
    }

    clearFieldError(field);
    markFieldValid(field);
  }

  function enhanceForm(form, calculatorType) {
    if (!form || initializedForms.has(form)) {
      return;
    }

    initializedForms.add(form);
    form.querySelectorAll(FIELD_SELECTOR).forEach((field) => {
      ensureFieldErrorNode(field);
      if (field.required) {
        field.setAttribute("aria-required", "true");
        ensureRequiredMarker(field);
      }

      field.addEventListener("input", () => onFieldInteraction(form, field, calculatorType));
      field.addEventListener("change", () => onFieldInteraction(form, field, calculatorType));
      field.addEventListener("blur", () => {
        if (field.required) {
          validateRequiredField(field);
        }
      });
    });

    form.addEventListener("reset", () => {
      window.setTimeout(() => {
        startedForms.delete(form);
        clearFormErrors(form);
      }, 0);
      track("calculator_reset", {
        calculator_type: calculatorType || getCurrentCalculatorType(),
        form_id: form.id || ""
      });
    });
  }

  document.addEventListener("calculator:loaded", (event) => {
    const calculatorType = event.detail?.calculatorType || getCurrentCalculatorType();
    document.querySelectorAll("#app-content form").forEach((form) => {
      enhanceForm(form, calculatorType);
    });
  });

  document.addEventListener("click", (event) => {
    const relatedLink = event.target.closest(".calc-related-list a[data-calculator]");
    if (relatedLink) {
      track("related_calculator_click", {
        calculator_type: getCurrentCalculatorType(),
        target_calculator: relatedLink.getAttribute("data-calculator") || ""
      });
      return;
    }

    const ctaLink = event.target.closest("#calc-cta-block a");
    if (ctaLink) {
      track("cta_click", {
        calculator_type: getCurrentCalculatorType(),
        cta_label: (ctaLink.textContent || "").trim(),
        cta_href: ctaLink.getAttribute("href") || ""
      });
    }
  });

  window.CalculatorUI = {
    clearFormErrors,
    clearFieldError,
    enhanceForm,
    hideResults,
    markFieldValid,
    revealResults,
    showFieldError,
    showFormError,
    track,
    validateForm
  };
})();
