function createMegaDropdown(children) {
    if (!children || children.length === 0) return '';
    
    const columns = Math.ceil(children.length / 4); // Split items into columns
    let html = '<div class="mega-dropdown">';
    
    // Group items into columns
    for (let i = 0; i < columns; i++) {
        const columnItems = children.slice(i * 4, (i + 1) * 4);
        html += '<div class="mega-column">';
        columnItems.forEach(item => {
            html += `<a href="${item.url}">${item.title}</a>`;
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

function generateMenuItem(item) {
    const hasChildren = item.children && item.children.length > 0;
    const className = hasChildren ? 'has-mega' : '';
    
    return `
        <li class="${className}">
            <a href="${item.url}">${item.title}</a>
            ${hasChildren ? createMegaDropdown(item.children) : ''}
        </li>
    `;
}

function loadMenu() {
    fetch('https://askmortgageauthority.com/wp-json/custom/v1/menu/')
        .then(response => response.json())
        .then(menuData => {
            const mainMenu = document.querySelector('.main-menu');
            const menuHTML = menuData.map(generateMenuItem).join('');
            mainMenu.innerHTML = menuHTML;
            document.dispatchEvent(new CustomEvent('menu:loaded'));
        })
        .catch(error => {
            console.error('Error loading menu from API, falling back to local JSON:', error);
            // Fallback to local menu.json
            fetch('js/menu.json')
                .then(response => response.json())
                .then(localMenuData => {
                    const mainMenu = document.querySelector('.main-menu');
                    const menuHTML = localMenuData.map(generateMenuItem).join('');
                    mainMenu.innerHTML = menuHTML;
                    document.dispatchEvent(new CustomEvent('menu:loaded'));
                })
                .catch(localError => {
                    console.error('Error loading local menu:', localError);
                });
        });
}

function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger-menu');
    const mainMenu = document.querySelector('.main-menu');
    const megaMenuItems = document.querySelectorAll('.has-mega');

    // Toggle main menu
    hamburger.addEventListener('click', () => {
        mainMenu.classList.toggle('active');
    });

    // Handle menu item clicks
    mainMenu.addEventListener('click', (e) => {
        const menuItem = e.target.closest('.has-mega');
        const isParentLink = menuItem && e.target === menuItem.querySelector('a');
        
        if (window.innerWidth <= 1024 && isParentLink) {
            e.preventDefault();
            e.stopPropagation();
            menuItem.classList.toggle('active');
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mega-menu')) {
            mainMenu.classList.remove('active');
            megaMenuItems.forEach(item => item.classList.remove('active'));
        }
    });
}

// Add this to your existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
    initializeMobileMenu();
});
