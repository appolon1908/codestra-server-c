import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearAccessToken, hasUsableAccessToken, setAccessToken } from "./auth";

const token = (payload: object) => {
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `header.${encoded}.signature`;
};

describe("authentication token handling", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("rejects missing and malformed tokens", () => {
    expect(hasUsableAccessToken()).toBe(false);
    setAccessToken("not-a-jwt");
    expect(hasUsableAccessToken()).toBe(false);
  });

  it("accepts an unexpired token", () => {
    setAccessToken(token({ exp: Math.floor(Date.now() / 1000) + 60 }));
    expect(hasUsableAccessToken()).toBe(true);
  });

  it("rejects expired tokens and can clear storage", () => {
    setAccessToken(token({ exp: Math.floor(Date.now() / 1000) - 60 }));
    expect(hasUsableAccessToken()).toBe(false);
    clearAccessToken();
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});
