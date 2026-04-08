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

        if (isOpen) {
            navToggle.setAttribute("aria-label", "Fechar menu");
        } else {
            navToggle.setAttribute("aria-label", "Abrir menu");
        }
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

const translations = {
    pt: {
        skipLink: "Pular para o conteúdo",
        brandAlt: "Ir para o topo",

        "nav.about": "Sobre",
        "nav.experience": "Experiência",
        "nav.projects": "Projetos",
        "nav.skills": "Stack",
        "nav.profile": "Perfil",
        "nav.contact": "Contato",

        "hero.label": "Portfólio",
        "hero.role": "Desenvolvedor full stack e analista de IA & Analytics — EBS IT",
        "hero.lead": "Trabalho com desenvolvimento, dados e inteligência artificial. Sou formado em Sistemas de Informação pela UFU, tenho mais vivência em frontend, e hoje atuo com IA e analytics na EBS IT.",
        "hero.ctaExperience": "Ver experiência",
        "hero.ctaContact": "Entrar em contato",
        "hero.hl1": "IA, Analytics e automação",
        "hero.hl2": "Sistemas de Informação",
        "hero.photoAlt": "Retrato de Humberto Pimenta",
        "hero.panelKicker": "Hoje",
        "hero.panelTitle": "Full stack, com dia a dia em IA e analytics.",
        "hero.focus1": "IA e Analytics na EBS IT",
        "hero.focus2": "Sistemas de Informação — UFU",
        "hero.focus3": "Full stack, mais forte em frontend",

        "about.label": "Sobre",
        "about.title": "Entre código, dados e IA.",
        "about.p1": "Hoje trabalho como analista de IA e Analytics na EBS IT, remotamente. Minha formação é em Sistemas de Informação pela UFU — um curso que me deu base tanto em programação quanto em pensamento analítico, e isso se reflete no que eu faço agora.",
        "about.p2": "Tenho mais prática em frontend — trabalho com ReactJS e Tailwind CSS no dia a dia — mas minha base inclui C, C++ e Java. Na EBS IT, expando essa base para dados e IA. O objetivo é juntar tudo isso em entregas que resolvam algo de verdade.",
        "about.synthesisTitle": "Resumo",
        "about.synth1": "Analista de IA e Analytics na EBS IT",
        "about.synth2": "Sistemas de Informação pela UFU",
        "about.synth3": "Full stack com mais vivência em frontend",
        "about.synth4": "Stack: ReactJS, Tailwind CSS, HTML, C, C++ e Java",

        "exp.label": "Experiência",
        "exp.title": "IA, analytics e automação na EBS IT.",
        "exp.eyebrow": "Cargo atual",
        "exp.role": "Analista de IA e Analytics",
        "exp.lead": "Na EBS IT, trabalho remotamente com inteligência artificial, analytics e automação. É um ambiente onde consigo aplicar o que sei em problemas reais — e aprender rápido no processo.",
        "exp.col1Title": "O que faço",
        "exp.col1_1": "Tratamento e análise de dados para apoiar decisões",
        "exp.col1_2": "Automação de processos",
        "exp.col1_3": "Aplicação de IA em problemas de negóio",
        "exp.col2Title": "Como trabalho",
        "exp.col2_1": "Trabalho remoto em ambiente corporativo",
        "exp.col2_2": "Entregas em equipe, com prazos reais",
        "exp.col2_3": "Aprendizado contínuo entre o que estudei e o que o mercado pede",
        "exp.directionTitle": "Pra onde vou",
        "exp.directionDesc": "Quero crescer na junção entre desenvolvimento e IA — construindo uma base técnica forte para contribuir em times de tecnologia cada vez melhor.",

        "proj.label": "Projetos",
        "proj.title": "Projetos que construí.",
        "proj.github": "Ver no GitHub",

        "proj1.eyebrow": "Sistema de gestão",
        "proj1.name": "Clínica Veterinária",
        "proj1.summary": "Sistema para organizar a rotina de uma clínica veterinária. Consultas, relatórios e processos administrativos centralizados em um só lugar.",
        "proj1.scopeLabel": "Objetivo",
        "proj1.scopeDesc": "Centralizar as informações da clínica para facilitar o controle operacional e a geração de relatórios.",
        "proj1.featuresLabel": "Funcionalidades",
        "proj1.feat1": "Cadastro e controle de consultas",
        "proj1.feat2": "Geração de relatórios",
        "proj1.feat3": "Organização de rotinas administrativas",
        "proj1.tag": "Gestão · Backend",

        "skills.label": "Stack técnico",
        "skills.title": "O que uso no dia a dia.",
        "skills.s1Title": "Frontend",
        "skills.s1Desc": "Minha área mais forte. Uso ReactJS e Tailwind CSS diariamente — HTML como base de tudo.",
        "skills.s2Title": "Backend e programação",
        "skills.s2Desc": "C e C++ foram meu primeiro contato real com programação. Também trabalho com Java.",
        "skills.s3Title": "Dados e IA",
        "skills.s3Desc": "Na EBS IT, aplico analytics e IA a problemas reais de negóio.",
        "skills.s4Title": "Inglês",
        "skills.s4Desc": "Leio documentação e me comunico em inglês no contexto profissional.",
        "skills.tagData": "Dados",
        "skills.tagAutomation": "Automação",
        "skills.tagDocs": "Documentação",
        "skills.tagReading": "Leitura técnica",

        "profile.label": "Como trabalho",
        "profile.title": "Meu jeito de trabalhar.",
        "profile.q1Title": "Entender antes de codar",
        "profile.q1Desc": "Prefiro entender o problema antes de sair escrevendo código. Simplificar em vez de complicar.",
        "profile.q2Title": "Comunicação direta",
        "profile.q2Desc": "Escrevo e falo de forma clara. Prefiro ser entendido de primeira do que ter que explicar duas vezes.",
        "profile.q3Title": "Entrega com responsabilidade",
        "profile.q3Desc": "Levo a sério o que me confiam. Faço, reviso e entrego.",
        "profile.q4Title": "Aprendo fazendo",
        "profile.q4Desc": "Não espero o curso ideal. Aprendo resolvendo, errando e melhorando no dia a dia.",

        "contact.label": "Contato",
        "contact.title": "Se quiser trocar uma ideia.",
        "contact.intro": "Se trabalha com desenvolvimento, dados ou IA e quer conversar, estou aqui. Também estou aberto a oportunidades e parcerias.",
        "contact.focusLabel": "Foco",
        "contact.focusDesc": "Desenvolvimento, dados e inteligência artificial.",
        "contact.emailLabel": "E-mail",

        "footer.backToTop": "Voltar ao topo",
        "backToTop.ariaLabel": "Voltar ao topo"
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

        "hero.label": "Portfolio",
        "hero.role": "Full stack developer & AI/Analytics analyst — EBS IT",
        "hero.lead": "I work across development, data, and AI. Got my degree in Information Systems from UFU, have more hands-on experience in frontend, and now work with AI and analytics at EBS IT.",
        "hero.ctaExperience": "View experience",
        "hero.ctaContact": "Get in touch",
        "hero.hl1": "AI, Analytics & automation",
        "hero.hl2": "Information Systems",
        "hero.photoAlt": "Portrait of Humberto Pimenta",
        "hero.panelKicker": "Today",
        "hero.panelTitle": "Full stack, with daily work in AI and analytics.",
        "hero.focus1": "AI & Analytics at EBS IT",
        "hero.focus2": "Information Systems — UFU",
        "hero.focus3": "Full stack, stronger in frontend",

        "about.label": "About",
        "about.title": "Between code, data, and AI.",
        "about.p1": "I currently work as an AI and Analytics Analyst at EBS IT, remotely. My degree is in Information Systems from UFU — a program that gave me a foundation in both programming and analytical thinking, and that reflects in what I do now.",
        "about.p2": "I have more practice in frontend — I work with ReactJS and Tailwind CSS daily — but my foundation includes C, C++, and Java. At EBS IT, I'm expanding into data and AI. The goal is to combine all of this into deliveries that actually solve something.",
        "about.synthesisTitle": "Summary",
        "about.synth1": "AI and Analytics Analyst at EBS IT",
        "about.synth2": "B.S. in Information Systems from UFU",
        "about.synth3": "Full stack with more experience in frontend",
        "about.synth4": "Stack: ReactJS, Tailwind CSS, HTML, C, C++, and Java",

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
        "skills.s1Desc": "My strongest area. I use ReactJS and Tailwind CSS daily — HTML as the foundation.",
        "skills.s2Title": "Backend and programming",
        "skills.s2Desc": "C and C++ were my first real programming languages. I also work with Java.",
        "skills.s3Title": "Data & AI",
        "skills.s3Desc": "At EBS IT, I apply analytics and AI to real business problems.",
        "skills.s4Title": "English",
        "skills.s4Desc": "I read documentation and communicate in English at work.",
        "skills.tagData": "Data",
        "skills.tagAutomation": "Automation",
        "skills.tagDocs": "Documentation",
        "skills.tagReading": "Technical reading",

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
        "backToTop.ariaLabel": "Back to top"
    }
};

function initI18n() {
    const toggle = document.getElementById("lang-toggle");

    if (!toggle) return;

    const savedLang = localStorage.getItem(I18N_STORAGE_KEY) || "pt";
    applyLanguage(savedLang, toggle);

    toggle.addEventListener("click", (e) => {
        const clickedBtn = e.target.closest(".lang-toggle__btn");
        if (!clickedBtn) return;

        const lang = clickedBtn.getAttribute("data-lang");
        if (!lang) return;

        applyLanguage(lang, toggle);
    });
}

function applyLanguage(lang, toggle) {
    if (!translations[lang]) return;

    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";

    const dataElements = document.querySelectorAll("[data-i18n]");
    dataElements.forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    const ariaElements = document.querySelectorAll("[data-i18n-aria-label]");
    ariaElements.forEach((el) => {
        const key = el.getAttribute("data-i18n-aria-label");
        if (translations[lang][key]) {
            el.setAttribute("aria-label", translations[lang][key]);
        }
    });

    const backToTopBtn = document.getElementById("back-to-top");
    if (backToTopBtn && translations[lang]["backToTop.ariaLabel"]) {
        backToTopBtn.setAttribute("aria-label", translations[lang]["backToTop.ariaLabel"]);
    }

    const titleTranslations = {
        pt: "Humberto Pimenta | Desenvolvedor Full Stack & IA",
        en: "Humberto Pimenta | Full Stack Developer & AI"
    };
    document.title = titleTranslations[lang] || titleTranslations.pt;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        const descTranslations = {
            pt: "Portfólio de Humberto Pimenta — desenvolvedor full stack e analista de IA e Analytics na EBS IT.",
            en: "Portfolio of Humberto Pimenta — full stack developer and AI/Analytics analyst at EBS IT."
        };
        metaDesc.setAttribute("content", descTranslations[lang] || descTranslations.pt);
    }

    if (toggle) {
        toggle.querySelectorAll(".lang-toggle__btn").forEach((btn) => {
            const btnLang = btn.getAttribute("data-lang");
            btn.classList.toggle("lang-toggle__btn--active", btnLang === lang);
        });
    }

    localStorage.setItem(I18N_STORAGE_KEY, lang);
}
