var home = 'home';

function getCalculatorTypeFromPath() {
  return window.location.pathname.split('/').pop().replace('.html', '') || home;
}

function ensureReadableAnchors(root) {
  const anchors = root.querySelectorAll('a[data-calculator]');
  anchors.forEach((a) => {
    const existingText = (a.textContent || '').trim();
    if (existingText.length > 0) return;

    let label = '';
    const titleNode = a.closest('.card')?.querySelector('.card-title') || a.nextElementSibling;
    if (titleNode && titleNode.textContent) {
      label = titleNode.textContent.trim();
    }
    if (!label) {
      label = a.getAttribute('data-calculator') || 'Calculator';
    }
    if (!a.querySelector('.visually-hidden')) {
      const span = document.createElement('span');
      span.className = 'visually-hidden';
      span.textContent = label;
      a.appendChild(span);
    }
    a.setAttribute('aria-label', label);
  });
}

function ensureCalculatorCta(appContent) {
  if (!appContent || document.getElementById('calc-cta-block')) return;

  const cta = document.createElement('div');
  cta.id = 'calc-cta-block';
  cta.className = 'mt-4 mb-4 p-3 border rounded bg-light';
  cta.innerHTML = `
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3">
      <div>
        <h5 class="mb-1">Ready to talk numbers?</h5>
        <p class="mb-0 text-muted">Get pre-qualified or speak with a loan expert about your scenario.</p>
      </div>
      <div class="d-flex gap-2">
        <a class="btn btn-primary" href="https://askmortgageauthority.com/contact-us/" rel="noopener">Get Pre-Qualified</a>
        <a class="btn btn-outline-secondary" href="/Financial-Calculators">View All Calculators</a>
      </div>
    </div>
  `;
  appContent.appendChild(cta);
}

function ensureCalculatorFaq(appContent, calculatorType) {
  if (!appContent || document.getElementById('calc-faq-block')) return;

  const faq = document.createElement('div');
  faq.id = 'calc-faq-block';
  faq.className = 'mt-3 mb-4';
  const prettyName = calculatorType.replace(/-/g, ' ');
  faq.innerHTML = `
    <h5 class="mb-3">Frequently Asked Questions</h5>
    <div class="accordion" id="calcFaqAccordion">
      <div class="accordion-item">
        <h2 class="accordion-header" id="faq-heading-1">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-collapse-1" aria-expanded="false" aria-controls="faq-collapse-1">
            How should I use the ${prettyName}?
          </button>
        </h2>
        <div id="faq-collapse-1" class="accordion-collapse collapse" aria-labelledby="faq-heading-1" data-bs-parent="#calcFaqAccordion">
          <div class="accordion-body">
            Enter realistic inputs (rates, terms, taxes or fees) to compare scenarios one variable at a time.
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header" id="faq-heading-2">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-collapse-2" aria-expanded="false" aria-controls="faq-collapse-2">
            Can I compare different scenarios?
          </button>
        </h2>
        <div id="faq-collapse-2" class="accordion-collapse collapse" aria-labelledby="faq-heading-2" data-bs-parent="#calcFaqAccordion">
          <div class="accordion-body">
            Yes. Run the calculation, adjust one input, then calculate again to see how the results change.
          </div>
        </div>
      </div>
      <div class="accordion-item">
        <h2 class="accordion-header" id="faq-heading-3">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq-collapse-3" aria-expanded="false" aria-controls="faq-collapse-3">
            Does this replace lender estimates?
          </button>
        </h2>
        <div id="faq-collapse-3" class="accordion-collapse collapse" aria-labelledby="faq-heading-3" data-bs-parent="#calcFaqAccordion">
          <div class="accordion-body">
            No. These are informational estimates and should be paired with advice from a lender or financial professional.
          </div>
        </div>
      </div>
    </div>
  `;
  appContent.appendChild(faq);
}

function enhanceCalculatorContent(calculatorType) {
  const appContent = document.getElementById('app-content');
  if (!appContent) return;

  ensureReadableAnchors(appContent);

  if (calculatorType !== home) {
    ensureCalculatorCta(appContent);
    ensureCalculatorFaq(appContent, calculatorType);
  }
}

function dispatchCalculatorLoaded(calculatorType) {
  document.dispatchEvent(
    new CustomEvent('calculator:loaded', { detail: { calculatorType } })
  );
}

function updateClientSideMetadata(calculatorType) {
  const prettyName = calculatorType === home
    ? 'Mortgage & Financial Calculators'
    : calculatorType.replace(/-/g, ' ');
  const titleText = calculatorType === home
    ? 'Mortgage & Financial Calculators | Ask Mortgage Authority'
    : `${prettyName} | Ask Mortgage Authority`;
  document.title = titleText;

  const metaTitle = document.querySelector('meta[name="title"]');
  if (metaTitle) {
    metaTitle.setAttribute('content', titleText);
  }

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && calculatorType !== home) {
    metaDescription.setAttribute(
      'content',
      `Use the ${prettyName} on Ask Mortgage Authority to compare scenarios and estimate results.`
    );
  }
}

function setCalculatorContent(html, calculatorType, shouldUpdateMetadata) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const calculatorContent = doc.querySelector('.mortgage-calculators-widget-wrapper');

  if (!calculatorContent) {
    throw new Error(`Missing calculator wrapper for ${calculatorType}`);
  }

  const appContent = document.getElementById('app-content');
  if (!appContent) return;

  appContent.innerHTML = '';
  appContent.appendChild(calculatorContent);
  enhanceCalculatorContent(calculatorType);
  dispatchCalculatorLoaded(calculatorType);

  if (shouldUpdateMetadata) {
    updateClientSideMetadata(calculatorType);
  }
}

function loadCalculator(calculatorType) {
  const templatePath = `/templates/${calculatorType}.html`;

  fetch(templatePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Template request failed for ${calculatorType}`);
      }
      return response.text();
    })
    .then((html) => {
      setCalculatorContent(html, calculatorType, true);
    })
    .catch((error) => {
      console.error('Error loading calculator:', error);
    });
}

document.addEventListener('click', function(e) {
  const link = e.target.closest('[data-calculator]');
  if (!link) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  e.preventDefault();
  const calculatorType = link.getAttribute('data-calculator');
  if (!calculatorType) return;

  history.pushState({}, '', `/${calculatorType}`);
  loadCalculator(calculatorType);
});

document.addEventListener('DOMContentLoaded', function() {
  const initialCalculatorType = typeof window.__INITIAL_CALCULATOR_SLUG__ === 'string'
    ? window.__INITIAL_CALCULATOR_SLUG__
    : '';
  const appContent = document.getElementById('app-content');
  const hasServerContent = !!(appContent && appContent.children.length);

  if (hasServerContent && initialCalculatorType) {
    enhanceCalculatorContent(initialCalculatorType);
    dispatchCalculatorLoaded(initialCalculatorType);
  } else if (!hasServerContent) {
    loadCalculator(getCalculatorTypeFromPath());
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const currentUrl = window.location.href;
  const homeUrl = 'https://askmortgageauthority.com/';
  const calculatorUrl = 'https://calculator.askmortgageauthority.com/';
  const localUrl = 'http://[::]:8888/';

  const homeLink = document.querySelector('a[href="https://askmortgageauthority.com/"]');
  const calculatorLink = document.querySelector('a[href="https://calculator.askmortgageauthority.com/"]');

  if (currentUrl === homeUrl && homeLink) {
    homeLink.classList.add('active');
  } else if (currentUrl === calculatorUrl && calculatorLink) {
    calculatorLink.classList.add('active');
  } else if (currentUrl.startsWith(localUrl) && calculatorLink) {
    calculatorLink.classList.add('active');
  }
});

window.addEventListener('popstate', function() {
  loadCalculator(getCalculatorTypeFromPath());
});
