var home = 'home'
// DOMContentLoaded listener (already correct)
document.addEventListener('DOMContentLoaded', function() {
  const calculatorType = window.location.pathname.split('/').pop().replace('.html', '') || home;
  loadCalculator(calculatorType);
});

function loadCalculator(calculatorType) {
  const templatePath = `/templates/${calculatorType}.html`;
  
  fetch(templatePath)
      .then(response => response.text())
      .then(html => {
          // Extract just the calculator form and content
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const calculatorContent = doc.querySelector('.mortgage-calculators-widget-wrapper');
          
          // Insert into the page
          document.getElementById('app-content').innerHTML = '';
          document.getElementById('app-content').appendChild(calculatorContent);

          // Notify calculator-specific scripts that a template was loaded
          document.dispatchEvent(
            new CustomEvent('calculator:loaded', { detail: { calculatorType } })
          );
          
          // Update the document title and meta title
          const titleText = `Ask Mortgage Authority - ${calculatorType.replace(/-/g, ' ')}`;
          document.title = titleText;
          
          const metaTitle = document.querySelector('meta[name="title"]');
          if (metaTitle) {
              metaTitle.setAttribute('content', `Mortgage Lending - ${calculatorType.replace(/-/g, ' ')}`);
          }
          const metaSiteId = document.querySelector('meta[name="site-id"]');
          if (metaSiteId) {
            metaSiteId.setAttribute('content', `Mortgage Lending - ${calculatorType.replace(/-/g, ' ')}`);
          }
          
          // Re-initialize any necessary event handlers
          // initializeCalculator();
      })
      .catch(error => {
          console.error('Error loading calculator:', error);
      });
}

// Click listener (updated, no .html)
document.addEventListener('click', function(e) {
  if (e.target.matches('[data-calculator]')) {
      e.preventDefault();
      const calculatorType = e.target.getAttribute('data-calculator');
      history.pushState({}, '', `/${calculatorType}`);
      loadCalculator(calculatorType);
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
    // Assuming local URL should activate the calculator link
    calculatorLink.classList.add('active');
  }
});

// Popstate listener (already correct)
window.addEventListener('popstate', function() {
  const calculatorType = window.location.pathname.split('/').pop().replace('.html', '') || home;
  loadCalculator(calculatorType);
});
