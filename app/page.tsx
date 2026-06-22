"use client";

import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Reveal } from "@/components/Reveal";

function LogoMark() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-gradient-to-br from-accent to-accent2 shadow-sm">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="white" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function StepCard({
  n,
  title,
  desc,
}: {
  n: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="h-full rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(11,18,32,0.04)]">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-accentsoft text-sm font-extrabold text-accent">
        {n}
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{desc}</p>
    </div>
  );
}

function BenefitCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="h-full rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(11,18,32,0.04)] transition hover:shadow-[0_10px_30px_rgba(11,18,32,0.07)]">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-accentsoft text-accent">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{desc}</p>
    </div>
  );
}

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/70 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-sm font-extrabold tracking-tight">
              {t("brand")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/chat"
              className="hidden rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:inline-block"
            >
              {t("nav.cta")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[-180px] h-[440px] w-[760px] -translate-x-1/2 rounded-full opacity-60 blur-[110px]"
            style={{
              background:
                "radial-gradient(closest-side, rgba(67,56,202,0.20), rgba(37,99,235,0.12), transparent)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.5]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(11,18,32,0.05) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
              maskImage:
                "radial-gradient(ellipse 70% 55% at 50% 30%, black, transparent)",
              WebkitMaskImage:
                "radial-gradient(ellipse 70% 55% at 50% 30%, black, transparent)",
            }}
          />

          <div className="relative mx-auto max-w-3xl px-5 pb-20 pt-20 text-center sm:pt-28">
            <span className="animate-in inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {t("hero.badge")}
            </span>

            <h1 className="animate-in delay-1 mt-6 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
              {t("hero.titlePre")}
              <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
                {t("hero.titleAccent")}
              </span>
            </h1>

            <p className="animate-in delay-2 mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
              {t("hero.subtitle")}
            </p>

            <div className="animate-in delay-3 mt-9 flex flex-col items-center gap-3">
              <Link
                href="/chat"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-base font-semibold text-white shadow-[0_8px_24px_rgba(11,18,32,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(11,18,32,0.24)]"
              >
                {t("hero.cta")}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="transition group-hover:translate-x-0.5"
                  aria-hidden
                >
                  <path
                    d="M5 12h14m-6-6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <span className="text-xs font-medium text-muted">
                {t("hero.trust")}
              </span>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-5 py-16">
          <Reveal>
            <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t("how.title")}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            <Reveal delay={0}>
              <StepCard n={1} title={t("how.step1.title")} desc={t("how.step1.desc")} />
            </Reveal>
            <Reveal delay={100}>
              <StepCard n={2} title={t("how.step2.title")} desc={t("how.step2.desc")} />
            </Reveal>
            <Reveal delay={200}>
              <StepCard n={3} title={t("how.step3.title")} desc={t("how.step3.desc")} />
            </Reveal>
          </div>
        </section>

        {/* Benefits */}
        <section className="mx-auto max-w-6xl px-5 py-16">
          <Reveal>
            <h2 className="text-center text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t("benefits.title")}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            <Reveal delay={0}>
              <BenefitCard
                title={t("benefits.1.title")}
                desc={t("benefits.1.desc")}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              />
            </Reveal>
            <Reveal delay={100}>
              <BenefitCard
                title={t("benefits.2.title")}
                desc={t("benefits.2.desc")}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M3 3v18h18M7 14l4-4 3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              />
            </Reveal>
            <Reveal delay={200}>
              <BenefitCard
                title={t("benefits.3.title")}
                desc={t("benefits.3.desc")}
                icon={
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
              />
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-4">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-white">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(600px 200px at 50% 0%, rgba(67,56,202,0.55), transparent)",
                }}
              />
              <div className="relative">
                <h2 className="mx-auto max-w-xl text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {t("cta.title")}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-white/70">
                  {t("cta.subtitle")}
                </p>
                <Link
                  href="/chat"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-ink transition hover:-translate-y-0.5"
                >
                  {t("cta.button")}
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 text-xs text-muted">
          <div className="flex items-center gap-2">
            <LogoMark />
            <span className="font-semibold">{t("footer.rights")}</span>
          </div>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
