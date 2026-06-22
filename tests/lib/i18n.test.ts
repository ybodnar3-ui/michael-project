import { describe, it, expect } from "vitest";
import { translate } from "@/lib/i18n";

describe("translate", () => {
  it("returns the localized string per language", () => {
    expect(translate("uk", "hero.cta")).toBe("Почати діагностику");
    expect(translate("de", "hero.cta")).toBe("Diagnose starten");
    expect(translate("en", "hero.cta")).toBe("Start the diagnostic");
  });

  it("returns the key itself for an unknown key", () => {
    expect(translate("uk", "nope.nope")).toBe("nope.nope");
  });
});
