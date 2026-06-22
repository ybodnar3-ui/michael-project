"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          theme?: string;
        }
      ) => string;
      reset: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (!SITE_KEY) {
      onToken(""); // not configured -> skip (graceful)
      return;
    }

    function render() {
      if (!ref.current || !window.turnstile || rendered.current) return;
      rendered.current = true;
      window.turnstile.render(ref.current, {
        sitekey: SITE_KEY!,
        callback: (t) => onToken(t),
        "expired-callback": () => onToken(""),
        theme: "light",
      });
    }

    if (window.turnstile) {
      render();
      return;
    }

    const id = "cf-turnstile-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      s.defer = true;
      s.onload = render;
      document.head.appendChild(s);
    } else {
      const poll = setInterval(() => {
        if (window.turnstile) {
          clearInterval(poll);
          render();
        }
      }, 200);
      return () => clearInterval(poll);
    }
  }, [onToken]);

  if (!SITE_KEY) return null;
  return <div ref={ref} className="mt-1" />;
}
