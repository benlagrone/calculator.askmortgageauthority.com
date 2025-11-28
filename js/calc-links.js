(() => {
  let cache = null;

  const fetchCalculators = async () => {
    if (cache) return cache;
    const res = await fetch("/templates/home.html");
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const anchors = Array.from(doc.querySelectorAll("a[data-calculator]"));
    const seen = new Set();
    const list = [];
    anchors.forEach((a) => {
      const calc = a.getAttribute("data-calculator");
      const text = (a.textContent || calc || "").trim() || calc || "";
      if (!calc || seen.has(calc)) return;
      seen.add(calc);
      list.push({ calc, text });
    });
    cache = list;
    return list;
  };

  const buildSidebar = async () => {
    const sidebar = document.getElementById("calc-sidebar");
    const sidebarCol = document.getElementById("calc-sidebar-col");
    const adCol = document.getElementById("ad-sidebar-col");
    const mainCol = document.getElementById("main-content-col");
    if (!sidebar || !sidebarCol) return;
    if (mainCol) mainCol.classList.remove("main-full");
    if (adCol) adCol.classList.remove("sidebar-hidden");
    sidebarCol.classList.remove("sidebar-hidden");
    const list = await fetchCalculators();
    const ul = document.createElement("ul");
    ul.className = "calc-sidebar__list";
    list.forEach(({ calc, text }) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = `/${calc}`;
      link.setAttribute("data-calculator", calc);
      link.textContent = text;
      li.appendChild(link);
      ul.appendChild(li);
    });
    sidebar.innerHTML = "";
    sidebar.appendChild(ul);
    // Keep hidden on small screens, show on lg+
    sidebarCol.classList.add("d-none", "d-lg-block");
    sidebarCol.classList.remove("sidebar-hidden");
  };

  const hideSidebar = () => {
    const sidebar = document.getElementById("calc-sidebar");
    const sidebarCol = document.getElementById("calc-sidebar-col");
    const adCol = document.getElementById("ad-sidebar-col");
    const mainCol = document.getElementById("main-content-col");
    if (sidebar) sidebar.innerHTML = "";
    if (sidebarCol) {
      sidebarCol.classList.add("sidebar-hidden");
      sidebarCol.classList.remove("d-lg-block");
    }
    if (adCol) {
      adCol.classList.add("sidebar-hidden");
      adCol.classList.remove("d-lg-block");
    }
    if (mainCol) {
      mainCol.classList.add("main-full");
    }
  };

  const prependMobileMenu = async () => {
    const mainMenu = document.querySelector(".main-menu");
    if (!mainMenu || mainMenu.dataset.calcsInjected === "true") return;
    const list = await fetchCalculators();
    const fragment = document.createDocumentFragment();
    const heading = document.createElement("li");
    heading.className = "calc-menu-heading";
    heading.textContent = "Calculators";
    fragment.appendChild(heading);
    list.forEach(({ calc, text }) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `/${calc}`;
      a.setAttribute("data-calculator", calc);
      a.textContent = text;
      li.appendChild(a);
      fragment.appendChild(li);
    });
    mainMenu.prepend(fragment);
    mainMenu.dataset.calcsInjected = "true";
  };

  const removeMobileCalcs = () => {
    const mainMenu = document.querySelector(".main-menu");
    if (!mainMenu) return;
    mainMenu.querySelectorAll(".calc-menu-heading, li[data-calc-item]").forEach((node) => node.remove());
    mainMenu.dataset.calcsInjected = "false";
  };

  document.addEventListener("menu:loaded", async () => {
    // Do nothing on load; handled on calculator:loaded to respect home vs subpages.
  });

  document.addEventListener("calculator:loaded", async (evt) => {
    const calcType = (evt.detail?.calculatorType || "").toLowerCase();
    if (calcType === "home" || calcType === "") {
      hideSidebar();
      removeMobileCalcs();
    } else {
      await buildSidebar();
      if (window.innerWidth <= 1024) {
        await prependMobileMenu();
      }
    }
  });
})();
