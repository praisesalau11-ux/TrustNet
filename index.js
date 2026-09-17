document.addEventListener("DOMContentLoaded", () => {
initializeMobileMenu();
initializeSmoothScrolling();
initializeHeroVisual();
initializeHeaderScroll();
initializeNavigationState();
});

function initializeMobileMenu() {
const menuButton = document.querySelector(".menu-button");
const mobileNavigation = document.querySelector(".mobile-navigation");

if (!menuButton || !mobileNavigation) {
    return;
}

menuButton.addEventListener("click", () => {
    const isOpen =
        mobileNavigation.classList.contains("active");

    mobileNavigation.classList.toggle("active", !isOpen);
    menuButton.classList.toggle("active", !isOpen);
    menuButton.setAttribute(
        "aria-expanded",
        String(!isOpen)
    );
});

const mobileLinks =
    mobileNavigation.querySelectorAll("a");

mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
        mobileNavigation.classList.remove("active");
        menuButton.classList.remove("active");
        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );
    });
});

document.addEventListener("click", (event) => {
    if (
        !mobileNavigation.contains(event.target) &&
        !menuButton.contains(event.target)
    ) {
        mobileNavigation.classList.remove("active");
        menuButton.classList.remove("active");
        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );
    }
});

window.addEventListener("resize", () => {
    if (window.innerWidth > 820) {
        mobileNavigation.classList.remove("active");
        menuButton.classList.remove("active");
        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );
    }
});

}

function initializeSmoothScrolling() {
const links =
document.querySelectorAll('a[href^="#"]');

links.forEach((link) => {
    link.addEventListener("click", (event) => {
        const targetId =
            link.getAttribute("href");

        if (
            !targetId ||
            targetId === "#" ||
            targetId.length < 2
        ) {
            return;
        }

        const target =
            document.querySelector(targetId);

        if (!target) {
            return;
        }

        event.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        window.history.replaceState(
            null,
            "",
            targetId
        );
    });
});

}

function initializeHeroVisual() {
const heroVisual =
document.querySelector(".hero-visual");

if (!heroVisual) {
    return;
}

const prefersReducedMotion =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

const supportsPointer =
    window.matchMedia(
        "(pointer: fine)"
    ).matches;

if (prefersReducedMotion || !supportsPointer) {
    return;
}

let animationFrame = null;

heroVisual.addEventListener("mousemove", (event) => {
    const rect =
        heroVisual.getBoundingClientRect();

    const x =
        (event.clientX - rect.left) /
        rect.width;

    const y =
        (event.clientY - rect.top) /
        rect.height;

    const rotateY =
        (x - 0.5) * 8;

    const rotateX =
        (0.5 - y) * 8;

    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    animationFrame =
        requestAnimationFrame(() => {
            heroVisual.style.transform =
                `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
});

heroVisual.addEventListener("mouseleave", () => {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }

    heroVisual.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg)";
});

}

function initializeHeaderScroll() {
const header =
document.querySelector(".site-header");

if (!header) {
    return;
}

const updateHeader =
    () => {
        if (window.scrollY > 30) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    };

updateHeader();

window.addEventListener(
    "scroll",
    updateHeader,
    { passive: true }
);

}

function initializeNavigationState() {
const currentPath =
window.location.pathname;

const navigationLinks =
    document.querySelectorAll(
        ".main-navigation a, .mobile-navigation a"
    );

navigationLinks.forEach((link) => {
    const href =
        link.getAttribute("href");

    if (!href) {
        return;
    }

    if (
        href.startsWith("/") &&
        href === currentPath
    ) {
        link.classList.add("active");
    }
});

}