"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initCurrentYear();
    initMobileNav();
    initHeaderState();
    initRevealAnimations();
    initSectionTracking();
    initAvatarTransition();
});

function initCurrentYear() {
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = String(new Date().getFullYear());
    }
}

function initMobileNav() {
    const header = document.querySelector(".site-header");
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelectorAll(".site-nav__link");

    if (!header || !navToggle) {
        return;
    }

    const setNavState = (isOpen) => {
        header.classList.toggle("is-nav-open", isOpen);
        document.body.classList.toggle("menu-open", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));
        navToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
    };

    navToggle.addEventListener("click", () => {
        const isOpen = header.classList.contains("is-nav-open");
        setNavState(!isOpen);
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 860) {
                setNavState(false);
            }
        });
    });

    document.addEventListener("click", (event) => {
        if (window.innerWidth > 860) {
            return;
        }

        if (!header.contains(event.target)) {
            setNavState(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            setNavState(false);
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 860) {
            setNavState(false);
        }
    });
}

function initHeaderState() {
    const header = document.querySelector(".site-header");

    if (!header) {
        return;
    }

    const updateHeaderState = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
}

function initRevealAnimations() {
    const revealElements = document.querySelectorAll(".reveal");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!revealElements.length) {
        return;
    }

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach((element) => {
            element.classList.add("is-visible");
        });

        return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.18,
        rootMargin: "0px 0px -10% 0px"
    });

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });
}

function initSectionTracking() {
    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".site-nav__link");

    if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) {
        return;
    }

    const setActiveLink = (sectionId) => {
        navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${sectionId}`;
            link.classList.toggle("is-active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "location");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        const visibleEntries = entries
            .filter((entry) => entry.isIntersecting)
            .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio);

        if (visibleEntries.length > 0) {
            setActiveLink(visibleEntries[0].target.id);
        }
    }, {
        threshold: [0.2, 0.45, 0.7],
        rootMargin: "-35% 0px -45% 0px"
    });

    sections.forEach((section) => {
        sectionObserver.observe(section);
    });
}

function initAvatarTransition() {
    const photoFrame = document.querySelector(".hero__photo-frame");
    const brandMark = document.querySelector(".brand__mark");
    const heroSection = document.querySelector(".hero");

    if (!photoFrame || !brandMark || !heroSection) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 860) return;

    const photoImg = photoFrame.querySelector("img");
    if (!photoImg) return;

    const clone = document.createElement("div");
    clone.className = "hero__photo-clone";
    clone.setAttribute("aria-hidden", "true");

    const cloneImg = document.createElement("img");
    cloneImg.src = photoImg.src;
    cloneImg.alt = "";
    clone.appendChild(cloneImg);
    document.body.appendChild(clone);

    const label = document.createElement("span");
    label.className = "brand__mark-label";
    label.textContent = brandMark.textContent.trim();
    brandMark.textContent = "";
    brandMark.appendChild(label);

    const avatar = document.createElement("img");
    avatar.className = "brand__mark-avatar";
    avatar.src = photoImg.src;
    avatar.alt = "";
    brandMark.appendChild(avatar);

    const rootStyle = getComputedStyle(document.documentElement);
    const radiusXL = parseFloat(rootStyle.getPropertyValue("--radius-xl")) || 34;
    const photoFrameRadius = radiusXL - 12;
    const brandMarkRadius = 18;

    let cloneBaseWidth = 0;
    let cloneBaseHeight = 0;
    let scrollStart = 80;
    let scrollEnd = 450;

    function setCloneSize() {
        const rect = photoFrame.getBoundingClientRect();
        cloneBaseWidth = rect.width;
        cloneBaseHeight = rect.height;
        clone.style.width = cloneBaseWidth + "px";
        clone.style.height = cloneBaseHeight + "px";
    }

    function calcTriggers() {
        const heroRect = heroSection.getBoundingClientRect();
        const heroTopInDoc = heroRect.top + window.scrollY;
        const heroH = heroRect.height;

        scrollStart = Math.max(60, heroTopInDoc * 0.28);
        scrollEnd = Math.max(scrollStart + 180, heroTopInDoc + heroH * 0.58);
    }

    setCloneSize();
    calcTriggers();

    let ticking = false;

    function easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    }

    function update() {
        const scrollY = window.scrollY;
        const range = scrollEnd - scrollStart;
        const raw = range > 0 ? (scrollY - scrollStart) / range : 0;
        const progress = Math.min(1, Math.max(0, raw));
        const eased = easeInOutQuart(progress);

        if (progress <= 0) {
            clone.style.visibility = "hidden";
            photoFrame.style.visibility = "";
            brandMark.classList.remove("is-photo");
            ticking = false;
            return;
        }

        clone.style.visibility = "visible";
        photoFrame.style.visibility = "hidden";

        const frameRect = photoFrame.getBoundingClientRect();
        const markRect = brandMark.getBoundingClientRect();

        const fCX = frameRect.left + frameRect.width / 2;
        const fCY = frameRect.top + frameRect.height / 2;
        const mCX = markRect.left + markRect.width / 2;
        const mCY = markRect.top + markRect.height / 2;

        const cx = fCX + (mCX - fCX) * eased;
        const cy = fCY + (mCY - fCY) * eased;

        const targetScaleX = markRect.width / cloneBaseWidth;
        const targetScaleY = markRect.height / cloneBaseHeight;
        const scaleX = 1 + (targetScaleX - 1) * eased;
        const scaleY = 1 + (targetScaleY - 1) * eased;

        const tx = cx - cloneBaseWidth / 2;
        const ty = cy - cloneBaseHeight / 2;

        clone.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + scaleX + "," + scaleY + ")";

        var targetVisualRadius = photoFrameRadius + (brandMarkRadius - photoFrameRadius) * eased;
        var cssRX = Math.max(0, targetVisualRadius / scaleX);
        var cssRY = Math.max(0, targetVisualRadius / scaleY);
        clone.style.borderRadius = cssRX + "px / " + cssRY + "px";

        if (progress >= 0.92) {
            clone.style.visibility = "hidden";
            clone.classList.add("is-hidden");
            brandMark.classList.add("is-photo");
        } else {
            clone.style.visibility = "visible";
            clone.classList.remove("is-hidden");
            brandMark.classList.remove("is-photo");
        }

        ticking = false;
    }

    window.addEventListener("scroll", function () {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener("resize", function () {
        if (window.innerWidth < 860) {
            clone.style.visibility = "hidden";
            photoFrame.style.visibility = "";
            brandMark.classList.remove("is-photo");
            return;
        }

        setCloneSize();
        calcTriggers();
        update();
    });

    update();
}
