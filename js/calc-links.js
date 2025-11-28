(() => {
  let cache = null;

  const fetchCalculators = async () => {
    if (cache) return cache;
    const res = await fetch("/templates/home.html");
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const seen = new Set();
    const flat = [];
    const groups = [];

    const collectAnchors = (root) => Array.from(root.querySelectorAll("a[data-calculator]"));

    const headings = Array.from(doc.querySelectorAll("h3"));
    if (headings.length) {
      headings.forEach((heading) => {
        const title = (heading.textContent || "").trim();
        const items = [];
        let node = heading.nextElementSibling;
        while (node && node.tagName !== "H3") {
          collectAnchors(node).forEach((a) => {
            const calc = a.getAttribute("data-calculator");
            const text = (a.textContent || calc || "").trim() || calc || "";
            if (!calc || seen.has(calc)) return;
            seen.add(calc);
            const item = { calc, text };
            flat.push(item);
            items.push(item);
          });
          node = node.nextElementSibling;
        }
        if (items.length) {
          groups.push({ title, items });
        }
      });
    }

    if (!groups.length) {
      collectAnchors(doc).forEach((a) => {
        const calc = a.getAttribute("data-calculator");
        const text = (a.textContent || calc || "").trim() || calc || "";
        if (!calc || seen.has(calc)) return;
        seen.add(calc);
        flat.push({ calc, text });
      });
      groups.push({ title: "Calculators", items: [...flat] });
    }

    cache = { flat, groups };
    return cache;
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
    const { groups } = await fetchCalculators();
    const wrapper = document.createElement("div");
    groups.forEach(({ title, items }) => {
      const sectionTitle = document.createElement("h6");
      sectionTitle.className = "calc-sidebar__heading";
      sectionTitle.textContent = title;
      const ul = document.createElement("ul");
      ul.className = "calc-sidebar__list";
      items.forEach(({ calc, text }) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = `/${calc}`;
        link.setAttribute("data-calculator", calc);
        link.textContent = text;
        li.appendChild(link);
        ul.appendChild(li);
      });
      wrapper.appendChild(sectionTitle);
      wrapper.appendChild(ul);
    });
    sidebar.innerHTML = "";
    sidebar.appendChild(wrapper);
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
    const { groups } = await fetchCalculators();
    const fragment = document.createDocumentFragment();
    groups.forEach(({ title, items }) => {
      const heading = document.createElement("li");
      heading.className = "calc-menu-heading";
      heading.textContent = title;
      fragment.appendChild(heading);
      items.forEach(({ calc, text }) => {
        const li = document.createElement("li");
        li.dataset.calcItem = "true";
        const a = document.createElement("a");
        a.href = `/${calc}`;
        a.setAttribute("data-calculator", calc);
        a.textContent = text;
        li.appendChild(a);
        fragment.appendChild(li);
      });
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
