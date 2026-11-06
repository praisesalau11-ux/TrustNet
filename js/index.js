
/* =========================================================
   TRUSTNET 2.0 — LANDING PAGE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       1. ELEMENT REFERENCES
    ===================================================== */

    const header = document.getElementById("siteHeader");

    const menuButton = document.getElementById("menuButton");

    const mobileNavigation = document.getElementById(
        "mobileNavigation"
    );


    /* =====================================================
       2. MOBILE NAVIGATION
    ===================================================== */

    if (menuButton && mobileNavigation) {

        const navigationLinks = mobileNavigation.querySelectorAll("a");


        function openMenu() {

            mobileNavigation.classList.add("active");
            menuButton.classList.add("active");

            menuButton.setAttribute("aria-expanded", "true");
            menuButton.setAttribute("aria-label", "Close navigation");

            mobileNavigation.setAttribute("aria-hidden", "false");

        }


        function closeMenu() {

            mobileNavigation.classList.remove("active");
            menuButton.classList.remove("active");

            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Open navigation");

            mobileNavigation.setAttribute("aria-hidden", "true");

        }


        function toggleMenu() {

            const isOpen = menuButton.getAttribute(
                "aria-expanded"
            ) === "true";

            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }

        }


        menuButton.addEventListener("click", toggleMenu);


        // Close menu after selecting a navigation link.

        navigationLinks.forEach(link => {

            link.addEventListener("click", () => {

                closeMenu();

            });

        });


        // Close menu when Escape is pressed.

        document.addEventListener("keydown", event => {

            if (event.key === "Escape") {
                closeMenu();
            }

        });


        // Close menu when clicking outside it.

        document.addEventListener("click", event => {

            const clickedInsideMenu =
                mobileNavigation.contains(event.target);

            const clickedMenuButton =
                menuButton.contains(event.target);

            if (!clickedInsideMenu && !clickedMenuButton) {
                closeMenu();
            }

        });


        // Close menu when switching to desktop width.

        window.addEventListener("resize", () => {

            if (window.innerWidth > 760) {
                closeMenu();
            }

        });

    }


    /* =====================================================
       3. SMOOTH INTERNAL NAVIGATION
    ===================================================== */

    const internalLinks = document.querySelectorAll(
        'a[href^="#"]'
    );


    internalLinks.forEach(link => {

        link.addEventListener("click", event => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            // Keep the browser URL synchronized with the section.

            if (history.replaceState) {

                history.replaceState(
                    null,
                    "",
                    targetId
                );

            }

        });

    });


    /* =====================================================
       4. HEADER SCROLL BEHAVIOR
    ===================================================== */

    if (header) {

        let lastScrollPosition = 0;

        function updateHeader() {

            const currentScroll = window.scrollY;

            if (currentScroll > 30) {

                header.classList.add("scrolled");

            } else {

                header.classList.remove("scrolled");

            }

            lastScrollPosition = currentScroll;

        }


        window.addEventListener(
            "scroll",
            updateHeader,
            { passive: true }
        );

        updateHeader();

    }


    /* =====================================================
       5. ACTIVE NAVIGATION SECTION
    ===================================================== */

    const sections = document.querySelectorAll(
        "main section[id]"
    );

    const desktopLinks = document.querySelectorAll(
        ".main-navigation a"
    );


    if ("IntersectionObserver" in window && sections.length) {

        const sectionObserver = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    const currentId = entry.target.id;

                    desktopLinks.forEach(link => {

                        const linkTarget = link.getAttribute("href");

                        if (linkTarget === `#${currentId}`) {

                            link.setAttribute(
                                "aria-current",
                                "location"
                            );

                        } else {

                            link.removeAttribute("aria-current");

                        }

                    });

                });

            },
            {
                rootMargin: "-30% 0px -60% 0px",
                threshold: 0
            }
        );


        sections.forEach(section => {

            sectionObserver.observe(section);

        });

    }


    /* =====================================================
       6. HERO VISUAL POINTER EFFECT
    ===================================================== */

    const heroVisual = document.querySelector(".hero-visual");

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );


    if (
        heroVisual &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !reducedMotion.matches
    ) {

        heroVisual.addEventListener("pointermove", event => {

            const rect = heroVisual.getBoundingClientRect();

            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateY = ((x - centerX) / centerX) * 3;
            const rotateX = ((centerY - y) / centerY) * 3;

            heroVisual.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
            `;

        });


        heroVisual.addEventListener("pointerleave", () => {

            heroVisual.style.transform = "";

        });

    }


    /* =====================================================
       7. FOOTER YEAR
    ===================================================== */

    const footerText = document.querySelector(
        ".footer-inner > p"
    );

    if (footerText) {

        footerText.textContent =
            `© ${new Date().getFullYear()} TrustNet. Built for better-informed decisions.`;

    }


    /* =====================================================
       8. INITIALIZATION
    ===================================================== */

    console.log("TrustNet landing page initialized.");

});
