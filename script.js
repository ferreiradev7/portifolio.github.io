"use strict";

document.addEventListener("DOMContentLoaded", () => {
    initCurrentYear();
    initSmoothScroll();
    initMobileNav();
    initHeaderState();
    initScrollProgress();
    initBackToTop();
    initRevealAnimations();
    initSectionTracking();
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

function initScrollProgress() {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return;

    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        bar.style.width = progress + "%";
        bar.classList.toggle("is-visible", scrollTop > 80);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
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
        brandAlt: "Ir para o início do portfólio",

        "nav.about": "Sobre",
        "nav.experience": "Experiência",
        "nav.projects": "Projetos",
        "nav.skills": "Stack",
        "nav.profile": "Perfil",
        "nav.contact": "Contato",

        "hero.label": "Portfólio",
        "hero.role": "Desenvolvedor Full Stack · Analista de IA e Analytics — EBS IT",
        "hero.lead": "Trabalho na interseção entre desenvolvimento, dados e inteligência artificial. Formado em Sistemas de Informação pela UFU, com experiência prática em frontend e atuação profissional em IA e analytics.",
        "hero.ctaExperience": "Ver experiência",
        "hero.ctaContact": "Entrar em contato",
        "hero.hl1": "IA, Analytics e automação",
        "hero.hl2": "Sistemas de Informação",
        "hero.photoAlt": "Retrato de Humberto Pimenta",
        "hero.panelKicker": "Hoje",
        "hero.panelTitle": "Desenvolvedor full stack com atuação profissional em IA e analytics.",
        "hero.focus1": "Analista de IA e Analytics na EBS IT",
        "hero.focus2": "Sistemas de Informação — UFU",
        "hero.focus3": "Full stack com vivência forte em frontend",

        "about.label": "Sobre",
        "about.title": "Desenvolvimento, dados e inteligência artificial.",
        "about.p1": "Sou desenvolvedor full stack e hoje trabalho como Analista de IA e Analytics na EBS IT, em modelo remoto. Minha formação em Sistemas de Informação pela UFU une teoria e prática — e é essa conexão que guia meu trabalho.",
        "about.p2": "Tenho mais experiência de uso em frontend, com ReactJS e Tailwind CSS, mas minha base inclui C, C++ e Java. Na EBS IT, amplio essa base para o universo de dados e inteligência artificial. O caminho é consolidar tudo isso em entregas de tecnologia que fazem diferença.",
        "about.synthesisTitle": "Resumo",
        "about.synth1": "Analista de IA e Analytics na EBS IT",
        "about.synth2": "Formação em Sistemas de Informação pela UFU",
        "about.synth3": "Full stack com vivência mais forte em frontend",
        "about.synth4": "Stack: ReactJS, Tailwind CSS, HTML, C, C++ e Java",

        "exp.label": "Experiência",
        "exp.title": "Atuação profissional em inteligência artificial, analytics e automação.",
        "exp.eyebrow": "Cargo atual",
        "exp.role": "Analista de IA e Analytics",
        "exp.lead": "Na EBS IT, trabalho remotamente com inteligência artificial, analytics e automação. É onde meus conhecimentos técnicos encontram demandas reais — e onde consigo aprender com velocidade.",
        "exp.col1Title": "O que faço",
        "exp.col1_1": "Analytics e tratamento de dados para apoiar decisões",
        "exp.col1_2": "Automação de processos com foco em eficiência",
        "exp.col1_3": "Aplicação de IA em contextos de negócio",
        "exp.col2Title": "Como trabalho",
        "exp.col2_1": "Atuação remota em ambiente corporativo",
        "exp.col2_2": "Dinâmica de time e entregas com prazos",
        "exp.col2_3": "Aprendizado constante entre formação e mercado",
        "exp.directionTitle": "Pra onde vou",
        "exp.directionDesc": "Quero crescer na interseção entre desenvolvimento e inteligência artificial — consolidando uma base técnica sólida para contribuir em times de tecnologia de forma cada vez mais profunda.",

        "proj.label": "Projetos",
        "proj.title": "Entregas de código com propósito claro.",
        "proj.github": "Ver no GitHub",

        "proj1.eyebrow": "Sistema de gestão",
        "proj1.name": "Clínica Veterinária",
        "proj1.summary": "Sistema para organizar o dia a dia de uma clínica veterinária. O foco era resolver um problema real de gestão — consultas, relatórios e rotinas administrativas em um só lugar.",
        "proj1.scopeLabel": "Objetivo",
        "proj1.scopeDesc": "Centralizar as informações operacionais da clínica para facilitar o controle do dia a dia e a geração de relatórios.",
        "proj1.featuresLabel": "Funcionalidades",
        "proj1.feat1": "Cadastro e controle de consultas",
        "proj1.feat2": "Geração de relatórios",
        "proj1.feat3": "Organização de rotinas administrativas",
        "proj1.tag": "Gestão · Backend",

        "skills.label": "Stack técnico",
        "skills.title": "Tecnologias que uso e estudo.",
        "skills.s1Title": "Frontend",
        "skills.s1Desc": "É onde tenho mais prática. Trabalho com ReactJS e Tailwind CSS no dia a dia, e HTML como base de tudo.",
        "skills.s2Title": "Backend e programação",
        "skills.s2Desc": "C e C++ foram meus primeiros contatos com programação de verdade. Também tenho conhecimento em Java.",
        "skills.s3Title": "Dados e IA",
        "skills.s3Desc": "Na EBS IT, trabalho com analytics, dados e inteligência artificial aplicados a contextos de negócio.",
        "skills.s4Title": "Inglês",
        "skills.s4Desc": "Leio documentação técnica e me comunico em inglês no contexto profissional.",
        "skills.tagData": "Dados",
        "skills.tagAutomation": "Automação",
        "skills.tagDocs": "Documentação",
        "skills.tagReading": "Leitura técnica",

        "profile.label": "Como trabalho",
        "profile.title": "O que me move na prática.",
        "profile.q1Title": "Resolver de verdade",
        "profile.q1Desc": "Gosto de entender o problema antes de escrever código. Tentar simplificar ao invés de complicar.",
        "profile.q2Title": "Comunicação clara",
        "profile.q2Desc": "Escrevo e falo de forma direta. Prefiro que as pessoas entendam rápido do que precisem pedir duas vezes.",
        "profile.q3Title": "Entregar com responsabilidade",
        "profile.q3Desc": "Levo a sério o que me é confiado. Faço, reviso e entrego.",
        "profile.q4Title": "Aprender na prática",
        "profile.q4Desc": "Não espero o curso perfeito — aprendo resolvendo, errando e melhorando no dia a dia.",

        "contact.label": "Contato",
        "contact.title": "Aberto a conversar sobre oportunidades em tecnologia.",
        "contact.intro": "Se você procura alguém para trabalhar com desenvolvimento, dados ou IA, podemos conversar. Estou aberto a oportunidades e parcerias.",
        "contact.focusLabel": "Foco",
        "contact.focusDesc": "Desenvolvimento, dados e inteligência artificial.",
        "contact.emailLabel": "E-mail",

        "footer.backToTop": "Voltar ao topo",
        "backToTop.ariaLabel": "Voltar ao topo"
    },

    en: {
        skipLink: "Skip to content",
        brandAlt: "Go to top of portfolio",

        "nav.about": "About",
        "nav.experience": "Experience",
        "nav.projects": "Projects",
        "nav.skills": "Stack",
        "nav.profile": "Profile",
        "nav.contact": "Contact",

        "hero.label": "Portfolio",
        "hero.role": "Full Stack Developer · AI and Analytics Analyst — EBS IT",
        "hero.lead": "I work at the intersection of development, data, and artificial intelligence. Degree in Information Systems from UFU, with hands-on experience in frontend and professional work in AI and analytics.",
        "hero.ctaExperience": "View experience",
        "hero.ctaContact": "Get in touch",
        "hero.hl1": "AI, Analytics & automation",
        "hero.hl2": "Information Systems",
        "hero.photoAlt": "Portrait of Humberto Pimenta",
        "hero.panelKicker": "Today",
        "hero.panelTitle": "Full stack developer with professional work in AI and analytics.",
        "hero.focus1": "AI and Analytics Analyst at EBS IT",
        "hero.focus2": "Information Systems — UFU",
        "hero.focus3": "Full stack with stronger experience in frontend",

        "about.label": "About",
        "about.title": "Development, data, and artificial intelligence.",
        "about.p1": "I'm a full stack developer and currently work as an AI and Analytics Analyst at EBS IT, remotely. My degree in Information Systems from UFU connects theory and practice — and that connection guides my work.",
        "about.p2": "I have more hands-on experience in frontend, with ReactJS and Tailwind CSS, but my foundation also includes C, C++, and Java. At EBS IT, I expand that foundation into data and artificial intelligence. The goal is to bring it all together in technology deliveries that make a difference.",
        "about.synthesisTitle": "Summary",
        "about.synth1": "AI and Analytics Analyst at EBS IT",
        "about.synth2": "B.S. in Information Systems from UFU",
        "about.synth3": "Full stack with stronger experience in frontend",
        "about.synth4": "Stack: ReactJS, Tailwind CSS, HTML, C, C++, and Java",

        "exp.label": "Experience",
        "exp.title": "Professional work in artificial intelligence, analytics, and automation.",
        "exp.eyebrow": "Current role",
        "exp.role": "AI and Analytics Analyst",
        "exp.lead": "At EBS IT, I work remotely with artificial intelligence, analytics, and automation. It's where my technical skills meet real demands — and where I can learn at speed.",
        "exp.col1Title": "What I do",
        "exp.col1_1": "Analytics and data processing to support decisions",
        "exp.col1_2": "Process automation focused on efficiency",
        "exp.col1_3": "Applied AI in business contexts",
        "exp.col2Title": "How I work",
        "exp.col2_1": "Remote work in a corporate environment",
        "exp.col2_2": "Team dynamics and deadline-driven deliverables",
        "exp.col2_3": "Constant learning bridging education and the market",
        "exp.directionTitle": "Where I'm heading",
        "exp.directionDesc": "I want to grow at the intersection of development and artificial intelligence — building a solid technical foundation to contribute to tech teams in increasingly meaningful ways.",

        "proj.label": "Projects",
        "proj.title": "Code deliveries with a clear purpose.",
        "proj.github": "View on GitHub",

        "proj1.eyebrow": "Management system",
        "proj1.name": "Veterinary Clinic",
        "proj1.summary": "A system to organize the day-to-day of a veterinary clinic. The focus was solving a real management problem — appointments, reports, and admin routines in one place.",
        "proj1.scopeLabel": "Goal",
        "proj1.scopeDesc": "Centralize the clinic's operational information to streamline daily management and report generation.",
        "proj1.featuresLabel": "Features",
        "proj1.feat1": "Appointment registration and tracking",
        "proj1.feat2": "Report generation",
        "proj1.feat3": "Administrative routine organization",
        "proj1.tag": "Management · Backend",

        "skills.label": "Tech stack",
        "skills.title": "Technologies I use and study.",
        "skills.s1Title": "Frontend",
        "skills.s1Desc": "This is where I have the most practice. I work with ReactJS and Tailwind CSS daily, and HTML as the foundation of everything.",
        "skills.s2Title": "Backend and programming",
        "skills.s2Desc": "C and C++ were my first real encounters with programming. I also have knowledge in Java.",
        "skills.s3Title": "Data & AI",
        "skills.s3Desc": "At EBS IT, I work with analytics, data, and artificial intelligence applied to business contexts.",
        "skills.s4Title": "English",
        "skills.s4Desc": "I read technical documentation and communicate in English in professional settings.",
        "skills.tagData": "Data",
        "skills.tagAutomation": "Automation",
        "skills.tagDocs": "Documentation",
        "skills.tagReading": "Technical reading",

        "profile.label": "How I work",
        "profile.title": "What drives me in practice.",
        "profile.q1Title": "Solve for real",
        "profile.q1Desc": "I like to understand the problem before writing code. Try to simplify instead of overcomplicating.",
        "profile.q2Title": "Clear communication",
        "profile.q2Desc": "I write and speak directly. I'd rather people understand quickly than have to ask twice.",
        "profile.q3Title": "Deliver with responsibility",
        "profile.q3Desc": "I take seriously what's entrusted to me. I build, review, and deliver.",
        "profile.q4Title": "Learn by doing",
        "profile.q4Desc": "I don't wait for the perfect course — I learn by solving, failing, and improving day by day.",

        "contact.label": "Contact",
        "contact.title": "Open to talking about opportunities in technology.",
        "contact.intro": "If you're looking for someone to work with development, data, or AI, let's talk. I'm open to opportunities and partnerships.",
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
            pt: "Portfólio de Humberto Pimenta, desenvolvedor full stack e analista de IA e Analytics na EBS IT.",
            en: "Portfolio of Humberto Pimenta, full stack developer and AI and Analytics Analyst at EBS IT."
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
