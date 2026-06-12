/* AMA Widget — js/ama-widget.js
   Einfacher keyword-basierter Chatbot für index.html */

(function () {
    'use strict';

    const SESSION_KEY = 'ama_history';

    // --- Intent-Datenbank ---
    const intents = [
        {
            keywords: ['hello', 'hi', 'hey', 'greetings', 'hallo', 'howdy'],
            answer: "Hey! 👋 What would you like to know about Chris?"
        },
        {
            keywords: ['tech', 'stack', 'skill', 'skills', 'languages', 'programming'],
            answer: "**Tech stack:** Java, PHP, C/C++ (basics), HTML5 & CSS3, MySQL, Git, Docker, Linux, Agile (Scrum). No frameworks on this portfolio — just craft. 🛠️",
            cta: { label: 'See details', href: 'index.html#tech-stack' }
        },
        {
            keywords: ['work', 'job', 'hire', 'open', 'available', 'employ', 'opportunity', 'working'],
            answer: "I'm currently a **working student @Nitrado** (Karlsruhe) and finishing my B.Sc. Open to interesting opportunities! 🚀",
            cta: { label: 'Get in touch', href: 'mailto:contact@chrisjemming.lu' }
        },
        {
            keywords: ['location', 'based', 'where', 'live', 'city', 'country', 'place'],
            answer: "Split between **Luxembourg 🇱🇺** and **Karlsruhe, Germany 🇩🇪**."
        },
        {
            keywords: ['contact', 'email', 'reach', 'message', 'mail'],
            answer: "📧 contact@chrisjemming.lu · LinkedIn · GitHub — always happy to connect!",
            cta: { label: 'Send email', href: 'mailto:contact@chrisjemming.lu' }
        },
        {
            keywords: ['thesis', 'bachelor', 'research', 'paper', 'dissertation'],
            answer: "Currently writing my **Bachelor Thesis** at HKA. Topic defined, in stealth mode 🤫 — stay tuned!",
            cta: { label: 'See projects', href: 'projects.html' }
        },
        {
            keywords: ['language', 'spoken', 'speak', 'luxembourgish', 'german', 'french', 'english', 'multilingual'],
            answer: "I speak **Luxembourgish 🇱🇺**, **English 🇬🇧**, **German 🇩🇪**, and **French 🇫🇷**."
        },
        {
            keywords: ['project', 'projects', 'built', 'portfolio', 'showcase', 'code', 'built'],
            answer: "**Projects:** WhistleDrop (hidden service), IFEN Studio DB, IFEN Online Form, and this portfolio itself. 💻",
            cta: { label: 'View projects', href: 'projects.html' }
        },
        {
            keywords: ['cert', 'certification', 'award', 'daad', 'certificate'],
            answer: "🏆 **Certifications:** Ethical Hacking @HKA, CSI Linux, Agile PM (USMx/UMD), HTML5/CSS3. Also proud recipient of the **DAAD-Prize 2025** from HKA!",
            cta: { label: 'View certs', href: 'certifications.html' }
        },
        {
            keywords: ['studi', 'studies', 'university', 'study', 'school', 'education', 'degree', 'hka', 'karlsruhe'],
            answer: "**B.Sc. Computer Science** at the University of Applied Sciences Karlsruhe. Before that: Diploma (Informatik & Mathematik) from Lycée des Arts et Métiers, Luxembourg (2022)."
        }
    ];

    const suggestions = [
        'Tech stack?',
        'Open to work?',
        'Where are you based?',
        'How can I contact you?',
        'Tell me about your thesis',
        'Languages you speak?'
    ];

    const FALLBACK = "I don't have a canned answer for that yet — but Chris does! 📧 contact@chrisjemming.lu";
    const FALLBACK_CTA = { label: 'Send email', href: 'mailto:contact@chrisjemming.lu' };

    // --- Markup erzeugen ---
    function buildWidget() {
        const container = document.getElementById('ama-widget');
        if (!container) return;

        container.innerHTML = `
            <div class="card ama-card fade-in" role="region" aria-label="Ask me anything">
                <div class="ama-header">
                    <h3>
                        <i class="fa-solid fa-robot" aria-hidden="true"></i>
                        Ask me anything
                    </h3>
                    <button class="ama-reset-btn" title="Clear chat" aria-label="Clear chat history">
                        <i class="fa-solid fa-rotate-right" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="ama-log" role="log" aria-live="polite" aria-label="Chat messages"></div>
                <div class="ama-chips" role="list" aria-label="Suggested questions"></div>
                <div class="ama-input-row">
                    <input
                        type="text"
                        class="ama-input"
                        placeholder="Type a question…"
                        aria-label="Your question"
                        autocomplete="off"
                        maxlength="200"
                    >
                    <button class="ama-send-btn" aria-label="Send message">
                        <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        `;

        const log = container.querySelector('.ama-log');
        const chipsRow = container.querySelector('.ama-chips');
        const input = container.querySelector('.ama-input');
        const sendBtn = container.querySelector('.ama-send-btn');
        const resetBtn = container.querySelector('.ama-reset-btn');

        // --- Suggestion chips ---
        suggestions.forEach((text) => {
            const chip = document.createElement('button');
            chip.className = 'ama-chip';
            chip.textContent = text;
            chip.setAttribute('role', 'listitem');
            chip.setAttribute('aria-label', `Ask: ${text}`);
            chip.addEventListener('click', () => {
                input.value = text;
                handleSend();
            });
            chipsRow.appendChild(chip);
        });

        // --- History laden ---
        const history = loadHistory();
        if (history.length) {
            history.forEach(({ role, text }) => renderBubble(log, role, text, false));
            scrollToBottom(log);
        } else {
            // Begrüßungsnachricht
            renderBubble(log, 'bot', "👋 Hi! I'm Chris's portfolio assistant. Ask me anything!", false);
        }

        // --- Event-Handler ---
        sendBtn.addEventListener('click', handleSend);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleSend();
        });
        resetBtn.addEventListener('click', () => {
            clearHistory();
            log.innerHTML = '';
            renderBubble(log, 'bot', "👋 Hi! I'm Chris's portfolio assistant. Ask me anything!", false);
        });

        function handleSend() {
            const text = input.value.trim();
            if (!text) return;

            input.value = '';
            renderBubble(log, 'user', text);
            scrollToBottom(log);

            const delay = 300 + Math.random() * 300;

            const typingEl = document.createElement('div');
            typingEl.className = 'ama-typing';
            typingEl.innerHTML = '<span></span><span></span><span></span>';
            log.appendChild(typingEl);
            scrollToBottom(log);

            setTimeout(() => {
                typingEl.remove();
                const { answer, cta } = resolveIntent(text);
                renderBubble(log, 'bot', answer, true, cta);
                scrollToBottom(log);
            }, delay);
        }
    }

    // --- Intent-Matching ---
    function resolveIntent(userText) {
        const lower = userText.toLowerCase();
        let bestScore = 0;
        let bestIntent = null;

        intents.forEach((intent) => {
            const score = intent.keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
            if (score > bestScore) {
                bestScore = score;
                bestIntent = intent;
            }
        });

        if (bestScore >= 1 && bestIntent) {
            return { answer: bestIntent.answer, cta: bestIntent.cta || null };
        }

        return { answer: FALLBACK, cta: FALLBACK_CTA };
    }

    // --- Bubble rendern ---
    function renderBubble(log, role, text, save = true, cta = null) {
        const bubble = document.createElement('div');
        bubble.className = `ama-bubble ${role}`;
        bubble.innerHTML = formatText(text);

        if (cta) {
            const link = document.createElement('a');
            link.href = cta.href;
            if (cta.href.startsWith('mailto')) {
                link.target = '_self';
            } else {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
            link.className = 'ama-cta';
            link.innerHTML = `${cta.label} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>`;
            link.style.display = 'block';

            const wrapper = document.createElement('div');
            wrapper.appendChild(bubble);
            wrapper.appendChild(link);
            log.appendChild(wrapper);
        } else {
            log.appendChild(bubble);
        }

        if (save) {
            saveToHistory(role, text);
        }
    }

    // --- Markdown-light: **bold** und \n → <br> ---
    function formatText(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    function scrollToBottom(el) {
        requestAnimationFrame(() => {
            el.scrollTop = el.scrollHeight;
        });
    }

    // --- History in sessionStorage ---
    function loadHistory() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]');
        } catch (_) {
            return [];
        }
    }

    function saveToHistory(role, text) {
        const history = loadHistory();
        history.push({ role, text });
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(history));
        } catch (_) { /* ignore quota */ }
    }

    function clearHistory() {
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch (_) { /* ignore */ }
    }

    // --- Init ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildWidget);
    } else {
        buildWidget();
    }
}());
