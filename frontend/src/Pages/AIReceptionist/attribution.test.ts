import { beforeEach, describe, expect, it, vi } from "vitest";
import { captureAttribution } from "./attribution";

describe("campaign attribution", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("crypto", { randomUUID: () => "session-id" });
  });

  it("preserves first touch and updates last touch", () => {
    history.replaceState(
      {},
      "",
      "/ai-receptionist?utm_source=first&utm_campaign=launch",
    );
    const first = captureAttribution();
    history.replaceState(
      {},
      "",
      "/ai-receptionist?utm_source=latest&gclid=click-id",
    );
    const latest = captureAttribution();
    expect(first.first.utm_source).toBe("first");
    expect(latest.first.utm_source).toBe("first");
    expect(latest.latest.utm_source).toBe("latest");
    expect(latest.latest.gclid).toBe("click-id");
    expect(latest.anonymousSessionId).toBe("session-id");
  });
});
