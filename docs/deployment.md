# Deployment (Vercel)

## Перший деплой (human action — потрібен вхід у Vercel)

1. Зайти на https://vercel.com, увійти через GitHub (акаунт `ybodnar3-ui`).
2. **Add New… → Project** → імпортувати репозиторій `ybodnar3-ui/michael-project`.
3. Framework Preset: Next.js (визначиться автоматично).
4. Environment Variables: поки нічого обов'язкового (Phase 0). Ключі додамо у фазах 1/4/5 зі `.env.example`.
5. **Deploy**.

## Подальші деплої

Кожен push у `main` тригерить автоматичний деплой Vercel.

## Перевірка

Після деплою відкрити `https://<project>.vercel.app/api/health` → має повернути `{"status":"ok"}`.

## Env-змінні (Vercel → Project → Settings → Environment Variables)

Додати ті самі ключі, що в локальному `.env.local`:

- `ANTHROPIC_API_KEY` — **обов'язково** (інакше діалог/звіт не працюють).
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — для нотифікацій лідів.
- (опційно) `RESEND_API_KEY`, `LEAD_EMAIL_TO`, `LEAD_EMAIL_FROM` — email-нотифікації.
- (рекомендовано) `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` — захист від ботів.

## Захист і контроль витрат (human actions)

### 1. Бюджетний cap — ОБОВ'ЯЗКОВО (головний стоп-кран витрат)

1. console.anthropic.com → **Limits** (або Billing → Usage limits).
2. Виставити **місячний ліміт витрат** (напр. $10–20 на старті).
3. Це гарантує, що навіть за зловживань більше ліміту фізично не спишеться.

### 2. Cloudflare Turnstile — рекомендовано (захист від ботів)

1. dash.cloudflare.com → **Turnstile** → **Add widget**.
2. Domain: твій Vercel-домен (і `localhost` для тесту).
3. Скопіювати **Site Key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; **Secret Key** → `TURNSTILE_SECRET_KEY`.
4. Додати обидва в `.env.local` (локально) і в Vercel env.
5. Без цих ключів захист просто вимкнений (усе працює), з ними — lead-форму захищено капчею.

### Що вже вбудовано в код

- **Rate-limit по IP** на `/api/chat` (30/хв), `/api/report` (10/хв), `/api/lead` (10/хв).
- **Ліміти повідомлень/довжини** (макс. 40 повідомлень, 2000 символів).
- **Turnstile-gate** на сабміті ліда (вмикається ключами вище).
