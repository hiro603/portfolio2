const DESKTOP_MQ = "(min-width: 768px)";

export function initializeSearchPage() {
    const layout = document.querySelector(".js-search-layout");
    if (!layout) return;

    const toggle = layout.querySelector(".js-search-filter-toggle");
    const sidebar = layout.querySelector(".js-search-sidebar");
    const desktopMq = window.matchMedia(DESKTOP_MQ);

    const setFilterOpen = (open) => {
        if (!toggle || !sidebar) return;

        sidebar.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));

        if (open && !desktopMq.matches) {
            sidebar.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    if (toggle && sidebar) {
        toggle.addEventListener("click", () => {
            setFilterOpen(!sidebar.classList.contains("is-open"));
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
                setFilterOpen(false);
                toggle.focus();
            }
        });

        desktopMq.addEventListener("change", () => {
            if (desktopMq.matches) {
                setFilterOpen(false);
            }
        });

        const sidebarForm = sidebar.querySelector("#sidebar-search");
        sidebarForm?.addEventListener("submit", () => {
            if (!desktopMq.matches) {
                setFilterOpen(false);
            }
        });

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.getAll("amenity").forEach((value) => {
            sidebarForm
                ?.querySelectorAll(`input[name="amenity"][value="${CSS.escape(value)}"]`)
                .forEach((input) => {
                    input.checked = true;
                });
        });
    }
}
