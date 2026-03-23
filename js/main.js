var home = 'home';

function getCalculatorTypeFromPath() {
  return window.location.pathname.split('/').pop().replace('.html', '') || home;
}

function getCalculatorPath(calculatorType) {
  return calculatorType === home ? '/' : `/${calculatorType}`;
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

function enhanceCalculatorContent(calculatorType) {
  const appContent = document.getElementById('app-content');
  if (!appContent) return;

  ensureReadableAnchors(appContent);

  if (calculatorType !== home) {
    ensureCalculatorCta(appContent);
  }
}

function dispatchCalculatorLoaded(calculatorType) {
  document.dispatchEvent(
    new CustomEvent('calculator:loaded', { detail: { calculatorType } })
  );
}

function updateClientSideMetadata(doc, calculatorType) {
  const fallbackPrettyName = calculatorType === home
    ? 'Mortgage & Financial Calculators'
    : calculatorType.replace(/-/g, ' ');
  const titleText = doc.title || `${fallbackPrettyName} | Ask Mortgage Authority`;
  document.title = titleText;

  const sourceMetaTitle = doc.querySelector('meta[name="title"]');
  const targetMetaTitle = document.querySelector('meta[name="title"]');
  if (targetMetaTitle) {
    targetMetaTitle.setAttribute('content', sourceMetaTitle?.getAttribute('content') || titleText);
  }

  const sourceMetaDescription = doc.querySelector('meta[name="description"]');
  const targetMetaDescription = document.querySelector('meta[name="description"]');
  if (targetMetaDescription && sourceMetaDescription) {
    targetMetaDescription.setAttribute(
      'content',
      sourceMetaDescription.getAttribute('content') || ''
    );
  }

  const sourceCanonical = doc.querySelector('link[rel="canonical"]');
  const targetCanonical = document.querySelector('link[rel="canonical"]');
  if (sourceCanonical && targetCanonical) {
    targetCanonical.setAttribute('href', sourceCanonical.getAttribute('href') || getCalculatorPath(calculatorType));
  }
}

function setCalculatorContent(html, calculatorType, shouldUpdateMetadata) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const sourceAppContent = doc.getElementById('app-content');

  if (!sourceAppContent) {
    throw new Error(`Missing app content for ${calculatorType}`);
  }

  const appContent = document.getElementById('app-content');
  if (!appContent) return;

  appContent.innerHTML = '';
  Array.from(sourceAppContent.children).forEach((node) => {
    appContent.appendChild(node.cloneNode(true));
  });

  dispatchCalculatorLoaded(calculatorType);
  enhanceCalculatorContent(calculatorType);

  if (shouldUpdateMetadata) {
    updateClientSideMetadata(doc, calculatorType);
  }
}

function loadCalculator(calculatorType) {
  const routePath = getCalculatorPath(calculatorType);

  fetch(routePath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Page request failed for ${calculatorType}`);
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
