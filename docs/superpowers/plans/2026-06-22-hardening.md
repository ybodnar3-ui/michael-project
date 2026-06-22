# Hardening Pass — Error Handling, Logging, Env Safety

**Дата:** 2026-06-22

Прохід на запит: (1) аудит «що може зламатися», (2) обробка помилок, (3) логування, (4) гарантія, що env не потрапить на GitHub.

## (4) Env-безпека — перевірено

- `.gitignore`: `.env*` + виняток `!.env.example`.
- `.env.local` — **не відстежується** git, **ігнорується**.
- У репо лише `.env.example` (без секретів).
- Секретів немає **ні у відстежуваних файлах, ні в історії git** (перевірено `git grep` + `git log -p --all`).

## (1) Аудит ризиків і (2)+(3) фікси

| Ризик | Фікс |
|---|---|
| Serverless timeout на довгій генерації звіту (10–30с) → 504, лід губиться | `export const maxDuration = 60` на `/api/chat`, `/api/report`, `/api/lead` |
| Telegram-ліміт 4096 символів → нотифікація мовчки падає | обрізка повідомлення до 3900 символів |
| Тихі збої нотифікацій (невірний chat_id, бот заблокований, мережа) | перевірка `res.ok`, логування `notify.telegram.failed/error`, `notify.email.failed`, `notify.all_failed` |
| Звіт не згенерувався (refusal/збій JSON) → лід губиться | `/api/lead`: на збої звіту все одно шле власнику аварійне сповіщення з контактом (`notifyOwner`) + лог `lead.report_failed`, повертає 500 |
| 429/403 на клієнті показувались як загальна помилка | клієнт розрізняє статуси: `chat.errorRate` (429), `chat.errorBot` (403), `chat.errorTimeout` (abort) — 4 мовами |
| Клієнтський fetch міг висіти вічно | AbortController-таймаут 75с на `/api/chat` і `/api/lead` |
| Помилки логувались неінформативно | структурований логер `lib/log.ts` (`log.info/warn/error`), логування `*.llm_error`, `*.rate_limited`, `lead.captured`, `lead.turnstile_blocked` |

## Нові/змінені файли

- `lib/log.ts` — структурований логер (видно у Vercel logs)
- `lib/notify.ts` — обрізка, перевірка відповіді, логування, `notifyOwner`, результат `{telegram, email}`
- `app/api/{chat,report,lead}/route.ts` — `maxDuration`, логування, збереження ліда при збої звіту
- `app/chat/page.tsx` — `postJson` з таймаутом, мапінг статусів на повідомлення
- `lib/i18n.ts` — ключі `chat.errorRate/errorBot/errorTimeout` (4 мови)

## Перевірка

`npm run lint` чисто · `npm test` 48 зелених · `npm run build` успішно.
