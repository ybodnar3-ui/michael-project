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
