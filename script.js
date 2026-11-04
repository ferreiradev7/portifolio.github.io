"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initCurrentYear();
    initSmoothScroll();
    initMobileNav();
    initHeaderState();
    initBackToTop();
    initRevealAnimations();
    initSectionTracking();
    initCardInteractions();
    initAvatarTransition();
    initI18n();
});

function initCurrentYear() {
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = String(new Date().getFullYear());
    }
}

function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
            const targetId = anchor.getAttribute("href");
            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();

            const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 88;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 8;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth"
            });

            target.setAttribute("tabindex", "-1");
            target.focus({ preventScroll: true });
            target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
        });
    });
}

function initBackToTop() {
    const btn = document.getElementById("back-to-top");
    if (!btn) return;

    const updateVisibility = () => {
        btn.classList.toggle("is-visible", window.scrollY > 600);
    };

    window.addEventListener("scroll", updateVisibility, { passive: true });
    updateVisibility();

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function initMobileNav() {
    const header = document.querySelector(".site-header");
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelectorAll(".site-nav__link");
    const backdrop = document.getElementById("nav-backdrop");

    if (!header || !navToggle) {
        return;
    }

    const setNavState = (isOpen) => {
        header.classList.toggle("is-nav-open", isOpen);
        document.body.classList.toggle("menu-open", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));

        if (backdrop) {
            backdrop.classList.toggle("is-visible", isOpen);
        }

        navToggle.setAttribute("aria-label", t(isOpen ? "nav.close" : "nav.open"));
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

    const closeOnOutside = (event) => {
        if (window.innerWidth > 860) return;

        if (!header.contains(event.target) && (!backdrop || !backdrop.contains(event.target))) {
            setNavState(false);
        }
    };

    if (backdrop) {
        backdrop.addEventListener("click", () => setNavState(false));
    }

    document.addEventListener("click", closeOnOutside);

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
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
    });

    revealElements.forEach((element) => {
        revealObserver.observe(element);
    });
}

function initSectionTracking() {
    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".site-nav__link");

    if (!sections.length || !navLinks.length) return;

    const trackedIds = new Set();
    navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) trackedIds.add(href.slice(1));
    });

    const trackedSections = [...sections].filter((s) => trackedIds.has(s.id));
    if (!trackedSections.length) return;

    let currentActive = null;
    let scrollTicking = false;

    const setActiveLink = (sectionId) => {
        if (currentActive === sectionId) return;
        currentActive = sectionId;

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

    const updateActiveSection = () => {
        const headerHeight = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue("--header-height")
        ) || 88;

        const visibleTop = window.scrollY + headerHeight;
        const visibleHeight = window.innerHeight - headerHeight;
        const detectionPoint = visibleTop + visibleHeight * 0.18;

        let activeSection = null;

        for (const section of trackedSections) {
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;
            if (sectionTop <= detectionPoint) {
                activeSection = section;
            }
        }

        if (!activeSection && trackedSections.length > 0) {
            const firstRect = trackedSections[0].getBoundingClientRect();
            if (firstRect.top < window.innerHeight) {
                activeSection = trackedSections[0];
            }
        }

        if (activeSection) setActiveLink(activeSection.id);

        scrollTicking = false;
    };

    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            requestAnimationFrame(updateActiveSection);
            scrollTicking = true;
        }
    }, { passive: true });

    updateActiveSection();
}

function initCardInteractions() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interactiveCards = document.querySelectorAll(
        ".surface-card, .project-card, .skill-card, .quality-card, .contact-card"
    );

    interactiveCards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            card.style.setProperty("--mouse-x", x + "px");
            card.style.setProperty("--mouse-y", y + "px");

            if (window.innerWidth > 860) {
                const rotateX = ((y - centerY) / centerY) * -2.5;
                const rotateY = ((x - centerX) / centerX) * 2.5;
                card.style.transform =
                    `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.008)`;
            }
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
            card.style.removeProperty("--mouse-x");
            card.style.removeProperty("--mouse-y");
        });

        card.addEventListener("mouseenter", () => {
            card.style.transition = "border-color 0.3s ease, box-shadow 0.4s ease";
        });

        card.addEventListener("mouseleave", () => {
            card.style.transition = "";
        });
    });

    const heroHighlights = document.querySelectorAll(".hero__highlights li");
    heroHighlights.forEach((li) => {
        li.addEventListener("mousemove", (e) => {
            if (window.innerWidth <= 860) return;
            const rect = li.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;
            li.style.transform =
                `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px) scale(1.02)`;
        });

        li.addEventListener("mouseleave", () => {
            li.style.transform = "";
        });
    });

    const detailItems = document.querySelectorAll(".detail-list li");
    detailItems.forEach((item) => {
        item.addEventListener("mouseenter", () => {
            item.style.transform = "translateX(6px)";
        });
        item.addEventListener("mouseleave", () => {
            item.style.transform = "";
        });
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
    const pageShell = document.querySelector(".page-shell");
    (pageShell || document.body).appendChild(clone);

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

const I18N_STORAGE_KEY = "hp-portfolio-lang";

// O português vem do próprio HTML (fonte única): captureDefaultTexts() lê os
// textos da página ao carregar. Aqui ficam só o inglês e os poucos textos em
// português que não aparecem no HTML inicial.
const translations = {
    pt: {
        "nav.close": "Fechar menu"
    },

    en: {
        skipLink: "Skip to content",
        brandAlt: "Go to top",

        "nav.about": "About",
        "nav.experience": "Experience",
        "nav.projects": "Projects",
        "nav.skills": "Stack",
        "nav.profile": "Profile",
        "nav.contact": "Contact",
        "nav.ariaLabel": "Main navigation",
        "nav.open": "Open menu",
        "nav.close": "Close menu",

        "hero.label": "Portfolio",
        "hero.role": "Full stack developer & AI/Analytics analyst — EBS IT",
        "hero.lead": "I work across development, data, and AI. I have a degree in Information Systems from UFU, work as a full stack developer, and currently work with AI and analytics at EBS IT.",
        "hero.ctaExperience": "View experience",
        "hero.ctaContact": "Get in touch",
        "hero.hl1": "AI, Analytics & automation",
        "hero.hl2": "Information Systems",
        "hero.photoAlt": "Portrait of Humberto Pimenta",
        "hero.highlightsLabel": "Profile highlights",
        "hero.panelLabel": "Professional summary",
        "hero.panelKicker": "Today",
        "hero.panelTitle": "Full stack, with daily work in AI and analytics.",
        "hero.focus1": "AI & Analytics at EBS IT",
        "hero.focus2": "Information Systems — UFU",
        "hero.focus3": "Full stack, frontend to backend",

        "about.label": "About",
        "about.title": "Between code, data, and AI.",
        "about.p1": "I currently work as an AI and Analytics Analyst at EBS IT, remotely. My degree is in Information Systems from UFU — a program that gave me a foundation in both programming and analytical thinking, and that reflects in what I do now.",
        "about.p2": "I work full stack: on the frontend with ReactJS and Tailwind CSS, and on the backend with Java, on a foundation that started with C and C++. At EBS IT, I bring this into data and AI with SQL and Python. The goal is to combine all of it into deliveries that actually solve something.",
        "about.synthesisTitle": "Summary",
        "about.synth1": "AI and Analytics Analyst at EBS IT",
        "about.synth2": "B.S. in Information Systems from UFU",
        "about.synth3": "Full stack, frontend to backend",
        "about.synth4": "Stack: ReactJS, Tailwind CSS, HTML, C, C++, Java, SQL, and Python",

        "exp.label": "Experience",
        "exp.title": "AI, analytics, and automation at EBS IT.",
        "exp.eyebrow": "Current role",
        "exp.role": "AI and Analytics Analyst",
        "exp.lead": "At EBS IT, I work remotely with AI, analytics, and automation. It's an environment where I can apply what I know to real problems — and learn fast in the process.",
        "exp.col1Title": "What I do",
        "exp.col1_1": "Data analysis and processing to support decisions",
        "exp.col1_2": "Process automation",
        "exp.col1_3": "Applied AI to business problems",
        "exp.col2Title": "How I work",
        "exp.col2_1": "Remote work in a corporate environment",
        "exp.col2_2": "Teamwork with real deadlines",
        "exp.col2_3": "Continuous learning between what I studied and what the market needs",
        "exp.directionTitle": "Where I'm heading",
        "exp.directionDesc": "I want to grow where development and AI meet — building a strong technical foundation to contribute to tech teams even better.",

        "proj.label": "Projects",
        "proj.title": "Some projects I've built.",
        "proj.github": "View on GitHub",

        "proj1.eyebrow": "Management system",
        "proj1.name": "Veterinary Clinic",
        "proj1.summary": "A system to organize a veterinary clinic's daily routine. Appointments, reports, and admin processes centralized in one place.",
        "proj1.scopeLabel": "Goal",
        "proj1.scopeDesc": "Centralize clinic information to streamline operations and report generation.",
        "proj1.featuresLabel": "Features",
        "proj1.feat1": "Appointment registration and tracking",
        "proj1.feat2": "Report generation",
        "proj1.feat3": "Admin routine organization",
        "proj1.tag": "Management · Backend",

        "skills.label": "Tech stack",
        "skills.title": "What I use daily.",
        "skills.s1Title": "Frontend",
        "skills.s1Desc": "Interfaces built with ReactJS and Tailwind CSS, on an HTML foundation.",
        "skills.s2Title": "Backend and programming",
        "skills.s2Desc": "On the backend, I work with Java. C and C++ were my programming foundation.",
        "skills.s3Title": "Data & AI",
        "skills.s3Desc": "At EBS IT, I apply analytics and AI to real business problems, using SQL and Python when the work calls for it.",
        "skills.s4Title": "English",
        "skills.s4Desc": "I read documentation and communicate in English at work.",
        "skills.tagData": "Data",
        "skills.tagAutomation": "Automation",
        "skills.tagDocs": "Documentation",
        "skills.tagReading": "Technical reading",
        "skills.s1Tags": "Frontend technologies",
        "skills.s2Tags": "Backend languages",
        "skills.s3Tags": "Areas of work",
        "skills.s4Tags": "Uses",

        "profile.label": "How I work",
        "profile.title": "My approach to work.",
        "profile.q1Title": "Understand before coding",
        "profile.q1Desc": "I prefer to understand the problem before jumping into code. Simplify instead of overcomplicating.",
        "profile.q2Title": "Direct communication",
        "profile.q2Desc": "I write and speak clearly. I'd rather be understood the first time than have to explain twice.",
        "profile.q3Title": "Responsible delivery",
        "profile.q3Desc": "I take seriously what's entrusted to me. I build, review, and deliver.",
        "profile.q4Title": "Learning by doing",
        "profile.q4Desc": "I don't wait for the perfect course. I learn by solving, failing, and improving day by day.",

        "contact.label": "Contact",
        "contact.title": "Let's talk.",
        "contact.intro": "If you work with development, data, or AI and want to chat, I'm here. Also open to opportunities and partnerships.",
        "contact.focusLabel": "Focus",
        "contact.focusDesc": "Development, data, and artificial intelligence.",
        "contact.emailLabel": "Email",

        "footer.backToTop": "Back to top",
        "backToTop.ariaLabel": "Back to top",

        "lang.toggle": "Switch language to Portuguese",
        "meta.title": "Humberto Pimenta | Full Stack Developer & AI",
        "meta.description": "Portfolio of Humberto Pimenta — full stack developer and AI/Analytics analyst at EBS IT."
    }
};

function getCurrentLang() {
    return document.documentElement.lang === "en" ? "en" : "pt";
}

function t(key) {
    const dict = translations[getCurrentLang()] || translations.pt;
    return dict[key] || translations.pt[key] || "";
}

function readSavedLang() {
    try {
        return localStorage.getItem(I18N_STORAGE_KEY);
    } catch {
        return null;
    }
}

function saveLang(lang) {
    try {
        localStorage.setItem(I18N_STORAGE_KEY, lang);
    } catch {
        // Armazenamento indisponível (ex.: modo privado); só não lembra a escolha.
    }
}

function captureDefaultTexts() {
    const pt = translations.pt;
    const clean = (text) => text.replace(/\s+/g, " ").trim();

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        pt[el.getAttribute("data-i18n")] = clean(el.textContent);
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
        pt[el.getAttribute("data-i18n-aria-label")] = el.getAttribute("aria-label") || "";
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
        pt[el.getAttribute("data-i18n-alt")] = el.getAttribute("alt") || "";
    });

    pt["meta.title"] = document.title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        pt["meta.description"] = metaDesc.getAttribute("content") || "";
    }

    const missing = Object.keys(pt).filter((key) => !(key in translations.en));
    if (missing.length) {
        console.warn("[i18n] Textos sem tradução para inglês:", missing);
    }
}

function initI18n() {
    const toggle = document.getElementById("lang-toggle");

    if (!toggle) return;

    captureDefaultTexts();

    const savedLang = readSavedLang();
    if (savedLang && savedLang !== "pt") {
        applyLanguage(savedLang, toggle);
    }

    toggle.addEventListener("click", (e) => {
        // Mouse em "PT" ou "EN" escolhe aquele idioma; teclado (Enter/Espaço)
        // ou clique fora das siglas alterna para o outro idioma.
        const clickedBtn = e.target.closest(".lang-toggle__btn");
        const currentLang = getCurrentLang();
        const lang = clickedBtn
            ? clickedBtn.getAttribute("data-lang")
            : (currentLang === "pt" ? "en" : "pt");

        if (!lang) return;

        applyLanguage(lang, toggle);
    });
}

function applyLanguage(lang, toggle) {
    const dict = translations[lang];
    if (!dict) return;

    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const text = dict[el.getAttribute("data-i18n")];
        if (text) el.textContent = text;
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
        const text = dict[el.getAttribute("data-i18n-aria-label")];
        if (text) el.setAttribute("aria-label", text);
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
        const text = dict[el.getAttribute("data-i18n-alt")];
        if (text) el.setAttribute("alt", text);
    });

    const navToggle = document.querySelector(".nav-toggle");
    if (navToggle) {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";
        navToggle.setAttribute("aria-label", dict[isOpen ? "nav.close" : "nav.open"]);
    }

    if (dict["meta.title"]) {
        document.title = dict["meta.title"];
    }

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict["meta.description"]) {
        metaDesc.setAttribute("content", dict["meta.description"]);
    }

    if (toggle) {
        toggle.querySelectorAll(".lang-toggle__btn").forEach((btn) => {
            btn.classList.toggle("lang-toggle__btn--active", btn.getAttribute("data-lang") === lang);
        });
    }

    saveLang(lang);
}
