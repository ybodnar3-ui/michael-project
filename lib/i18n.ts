import type { Language } from "./types";

export type Lang = Language;

export const LANGS: { code: Language; label: string }[] = [
  { code: "uk", label: "UK" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
  { code: "de", label: "DE" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "brand": "AI Automation Diagnostic",
  "nav.cta": "Start",

  "hero.badge": "AI automation diagnostic",
  "hero.titlePre": "Find out what your business can ",
  "hero.titleAccent": "automate with AI",
  "hero.subtitle":
    "Answer a few quick questions and get a personal report with concrete automation opportunities — and exactly what to ask a specialist for.",
  "hero.cta": "Start the diagnostic",
  "hero.trust": "Free · 5 minutes · no sign-up",

  "how.title": "How it works",
  "how.step1.title": "Tell us about your business",
  "how.step1.desc": "Describe your niche — the AI adapts its questions to your field.",
  "how.step2.title": "Answer a few questions",
  "how.step2.desc": "A short, friendly interview. One question at a time.",
  "how.step3.title": "Get your audit",
  "how.step3.desc": "A clear report: what to automate, the effect, and a ready request for a specialist.",

  "benefits.title": "What you get",
  "benefits.1.title": "Concrete opportunities",
  "benefits.1.desc": "3–6 automations tailored to your business, not generic advice.",
  "benefits.2.title": "Honest impact",
  "benefits.2.desc": "A rough estimate of time and money each one saves.",
  "benefits.3.title": "A ready brief",
  "benefits.3.desc": "Each opportunity comes as a request you can hand to a specialist.",

  "cta.title": "Ready to see what you can automate?",
  "cta.subtitle": "It takes about five minutes. No sign-up.",
  "cta.button": "Start the diagnostic",

  "footer.rights": "AI Automation Diagnostic",

  "chat.intro": "Tell us about your business — the AI will ask a few questions and prepare a personal report.",
  "chat.start": "Start",
  "chat.placeholder": "Your answer…",
  "chat.placeholderStart": "Press Start to begin…",
  "chat.send": "Send",
  "chat.typing": "AI is typing",
  "chat.done": "Interview complete",
  "chat.generate": "Generate report",
  "chat.generating": "Preparing report…",
  "chat.restart": "Start over",
  "chat.back": "Home",
  "chat.errorKey":
    "AI call failed. Most likely ANTHROPIC_API_KEY is missing in .env.local (restart the dev server).",
  "chat.errorServer": "Could not reach the server.",
  "chat.errorReport": "Could not generate the report.",

  "report.title": "Your automation audit",
  "report.opportunities": "Automation opportunities",
  "report.problem": "Problem",
  "report.solution": "Solution",
  "report.ai": "AI",
  "report.impact": "Impact",
  "report.request": "Request to a specialist",
  "report.priority": "Where to start",
  "report.copy": "Copy request",
  "report.copied": "Copied",

  "lead.title": "Where should we send your report?",
  "lead.subtitle": "Leave your contact and we'll prepare your personal audit.",
  "lead.name": "Name",
  "lead.contact": "Email, phone or Telegram",
  "lead.channel.telegram": "Telegram",
  "lead.channel.phone": "Phone",
  "lead.channel.email": "Email",
  "lead.submit": "Get the report",
  "lead.submitting": "Preparing report…",
  "lead.errorName": "Please enter your name",
  "lead.errorContact": "Please enter a contact",
};

const uk: Dict = {
  "brand": "AI Automation Diagnostic",
  "nav.cta": "Почати",

  "hero.badge": "AI-діагностика автоматизації",
  "hero.titlePre": "Дізнайся, що у твоєму бізнесі можна ",
  "hero.titleAccent": "автоматизувати з AI",
  "hero.subtitle":
    "Відповідай на кілька коротких запитань і отримай персональний звіт із конкретними можливостями автоматизації — і чітким запитом, з яким іти до спеціаліста.",
  "hero.cta": "Почати діагностику",
  "hero.trust": "Безкоштовно · 5 хвилин · без реєстрації",

  "how.title": "Як це працює",
  "how.step1.title": "Розкажи про свій бізнес",
  "how.step1.desc": "Опиши свою нішу — AI підлаштує питання під твою сферу.",
  "how.step2.title": "Дай відповіді",
  "how.step2.desc": "Коротке дружнє інтерв'ю. По одному питанню за раз.",
  "how.step3.title": "Отримай аудит",
  "how.step3.desc": "Зрозумілий звіт: що автоматизувати, який ефект і готовий запит до спеціаліста.",

  "benefits.title": "Що ти отримаєш",
  "benefits.1.title": "Конкретні можливості",
  "benefits.1.desc": "3–6 автоматизацій саме під твій бізнес, а не загальні поради.",
  "benefits.2.title": "Чесний ефект",
  "benefits.2.desc": "Орієнтовна оцінка, скільки часу і грошей економить кожна.",
  "benefits.3.title": "Готовий бриф",
  "benefits.3.desc": "Кожна можливість — це запит, який можна одразу віддати спеціалісту.",

  "cta.title": "Готовий побачити, що можна автоматизувати?",
  "cta.subtitle": "Це займає близько п'яти хвилин. Без реєстрації.",
  "cta.button": "Почати діагностику",

  "footer.rights": "AI Automation Diagnostic",

  "chat.intro": "Розкажи про свій бізнес — AI поставить кілька запитань і складе персональний звіт.",
  "chat.start": "Почати",
  "chat.placeholder": "Твоя відповідь…",
  "chat.placeholderStart": "Спершу натисни «Почати»…",
  "chat.send": "Надіслати",
  "chat.typing": "AI друкує",
  "chat.done": "Інтерв'ю завершено",
  "chat.generate": "Згенерувати звіт",
  "chat.generating": "Готую звіт…",
  "chat.restart": "Почати спочатку",
  "chat.back": "На головну",
  "chat.errorKey":
    "Помилка виклику AI. Найімовірніше не заданий ANTHROPIC_API_KEY у .env.local (перезапусти dev-сервер).",
  "chat.errorServer": "Не вдалося звʼязатися із сервером.",
  "chat.errorReport": "Не вдалося згенерувати звіт.",

  "report.title": "Твій аудит автоматизації",
  "report.opportunities": "Можливості автоматизації",
  "report.problem": "Проблема",
  "report.solution": "Рішення",
  "report.ai": "AI",
  "report.impact": "Ефект",
  "report.request": "Запит до спеціаліста",
  "report.priority": "З чого почати",
  "report.copy": "Скопіювати запит",
  "report.copied": "Скопійовано",

  "lead.title": "Куди надіслати звіт?",
  "lead.subtitle": "Залиш контакт — підготуємо твій персональний аудит.",
  "lead.name": "Ім'я",
  "lead.contact": "Email, телефон або Telegram",
  "lead.channel.telegram": "Telegram",
  "lead.channel.phone": "Телефон",
  "lead.channel.email": "Email",
  "lead.submit": "Отримати звіт",
  "lead.submitting": "Готую звіт…",
  "lead.errorName": "Вкажи ім'я",
  "lead.errorContact": "Вкажи контакт",
};

const ru: Dict = {
  "brand": "AI Automation Diagnostic",
  "nav.cta": "Начать",

  "hero.badge": "AI-диагностика автоматизации",
  "hero.titlePre": "Узнай, что в твоём бизнесе можно ",
  "hero.titleAccent": "автоматизировать с AI",
  "hero.subtitle":
    "Ответь на несколько коротких вопросов и получи персональный отчёт с конкретными возможностями автоматизации — и чётким запросом, с которым идти к специалисту.",
  "hero.cta": "Начать диагностику",
  "hero.trust": "Бесплатно · 5 минут · без регистрации",

  "how.title": "Как это работает",
  "how.step1.title": "Расскажи о своём бизнесе",
  "how.step1.desc": "Опиши нишу — AI подстроит вопросы под твою сферу.",
  "how.step2.title": "Ответь на вопросы",
  "how.step2.desc": "Короткое дружелюбное интервью. По одному вопросу за раз.",
  "how.step3.title": "Получи аудит",
  "how.step3.desc": "Понятный отчёт: что автоматизировать, какой эффект и готовый запрос к специалисту.",

  "benefits.title": "Что ты получишь",
  "benefits.1.title": "Конкретные возможности",
  "benefits.1.desc": "3–6 автоматизаций именно под твой бизнес, а не общие советы.",
  "benefits.2.title": "Честный эффект",
  "benefits.2.desc": "Примерная оценка, сколько времени и денег экономит каждая.",
  "benefits.3.title": "Готовый бриф",
  "benefits.3.desc": "Каждая возможность — это запрос, который можно сразу отдать специалисту.",

  "cta.title": "Готов увидеть, что можно автоматизировать?",
  "cta.subtitle": "Это занимает около пяти минут. Без регистрации.",
  "cta.button": "Начать диагностику",

  "footer.rights": "AI Automation Diagnostic",

  "chat.intro": "Расскажи о своём бизнесе — AI задаст несколько вопросов и составит персональный отчёт.",
  "chat.start": "Начать",
  "chat.placeholder": "Твой ответ…",
  "chat.placeholderStart": "Сначала нажми «Начать»…",
  "chat.send": "Отправить",
  "chat.typing": "AI печатает",
  "chat.done": "Интервью завершено",
  "chat.generate": "Сгенерировать отчёт",
  "chat.generating": "Готовлю отчёт…",
  "chat.restart": "Начать заново",
  "chat.back": "На главную",
  "chat.errorKey":
    "Ошибка вызова AI. Скорее всего не задан ANTHROPIC_API_KEY в .env.local (перезапусти dev-сервер).",
  "chat.errorServer": "Не удалось связаться с сервером.",
  "chat.errorReport": "Не удалось сгенерировать отчёт.",

  "report.title": "Твой аудит автоматизации",
  "report.opportunities": "Возможности автоматизации",
  "report.problem": "Проблема",
  "report.solution": "Решение",
  "report.ai": "AI",
  "report.impact": "Эффект",
  "report.request": "Запрос к специалисту",
  "report.priority": "С чего начать",
  "report.copy": "Скопировать запрос",
  "report.copied": "Скопировано",

  "lead.title": "Куда отправить отчёт?",
  "lead.subtitle": "Оставь контакт — подготовим твой персональный аудит.",
  "lead.name": "Имя",
  "lead.contact": "Email, телефон или Telegram",
  "lead.channel.telegram": "Telegram",
  "lead.channel.phone": "Телефон",
  "lead.channel.email": "Email",
  "lead.submit": "Получить отчёт",
  "lead.submitting": "Готовлю отчёт…",
  "lead.errorName": "Укажи имя",
  "lead.errorContact": "Укажи контакт",
};

const de: Dict = {
  "brand": "AI Automation Diagnostic",
  "nav.cta": "Starten",

  "hero.badge": "KI-Automatisierungs-Diagnose",
  "hero.titlePre": "Finde heraus, was sich in deinem Unternehmen ",
  "hero.titleAccent": "mit KI automatisieren lässt",
  "hero.subtitle":
    "Beantworte ein paar kurze Fragen und erhalte einen persönlichen Report mit konkreten Automatisierungs-Chancen — und genau der Anfrage, mit der du zu einem Spezialisten gehst.",
  "hero.cta": "Diagnose starten",
  "hero.trust": "Kostenlos · 5 Minuten · ohne Anmeldung",

  "how.title": "So funktioniert's",
  "how.step1.title": "Erzähl von deinem Unternehmen",
  "how.step1.desc": "Beschreibe deine Nische — die KI passt die Fragen an deine Branche an.",
  "how.step2.title": "Beantworte ein paar Fragen",
  "how.step2.desc": "Ein kurzes, freundliches Interview. Eine Frage nach der anderen.",
  "how.step3.title": "Erhalte dein Audit",
  "how.step3.desc": "Ein klarer Report: was zu automatisieren ist, der Effekt und eine fertige Anfrage für den Spezialisten.",

  "benefits.title": "Das bekommst du",
  "benefits.1.title": "Konkrete Chancen",
  "benefits.1.desc": "3–6 Automatisierungen, zugeschnitten auf dein Unternehmen — keine Floskeln.",
  "benefits.2.title": "Ehrlicher Effekt",
  "benefits.2.desc": "Eine grobe Schätzung, wie viel Zeit und Geld jede spart.",
  "benefits.3.title": "Ein fertiges Briefing",
  "benefits.3.desc": "Jede Chance kommt als Anfrage, die du direkt einem Spezialisten geben kannst.",

  "cta.title": "Bereit zu sehen, was du automatisieren kannst?",
  "cta.subtitle": "Es dauert etwa fünf Minuten. Ohne Anmeldung.",
  "cta.button": "Diagnose starten",

  "footer.rights": "AI Automation Diagnostic",

  "chat.intro": "Erzähl von deinem Unternehmen — die KI stellt ein paar Fragen und erstellt einen persönlichen Report.",
  "chat.start": "Starten",
  "chat.placeholder": "Deine Antwort…",
  "chat.placeholderStart": "Zuerst auf „Starten“ klicken…",
  "chat.send": "Senden",
  "chat.typing": "KI schreibt",
  "chat.done": "Interview abgeschlossen",
  "chat.generate": "Report generieren",
  "chat.generating": "Report wird erstellt…",
  "chat.restart": "Neu starten",
  "chat.back": "Startseite",
  "chat.errorKey":
    "KI-Aufruf fehlgeschlagen. Wahrscheinlich fehlt ANTHROPIC_API_KEY in .env.local (Dev-Server neu starten).",
  "chat.errorServer": "Server nicht erreichbar.",
  "chat.errorReport": "Report konnte nicht generiert werden.",

  "report.title": "Dein Automatisierungs-Audit",
  "report.opportunities": "Automatisierungs-Chancen",
  "report.problem": "Problem",
  "report.solution": "Lösung",
  "report.ai": "KI",
  "report.impact": "Effekt",
  "report.request": "Anfrage an einen Spezialisten",
  "report.priority": "Wo anfangen",
  "report.copy": "Anfrage kopieren",
  "report.copied": "Kopiert",

  "lead.title": "Wohin sollen wir deinen Report senden?",
  "lead.subtitle": "Hinterlasse deinen Kontakt — wir erstellen dein persönliches Audit.",
  "lead.name": "Name",
  "lead.contact": "E-Mail, Telefon oder Telegram",
  "lead.channel.telegram": "Telegram",
  "lead.channel.phone": "Telefon",
  "lead.channel.email": "E-Mail",
  "lead.submit": "Report erhalten",
  "lead.submitting": "Report wird erstellt…",
  "lead.errorName": "Bitte Namen eingeben",
  "lead.errorContact": "Bitte Kontakt eingeben",
};

const messages: Record<Language, Dict> = { uk, ru, en, de };

export function translate(lang: Language, key: string): string {
  return messages[lang]?.[key] ?? en[key] ?? key;
}
