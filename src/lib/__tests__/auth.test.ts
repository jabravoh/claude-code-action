import { describe, test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ set: mockCookieSet })),
}));

import { createSession } from "@/lib/auth";

describe("createSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("sets a cookie named auth-token", async () => {
    await createSession("user-1", "test@example.com");

    expect(mockCookieSet).toHaveBeenCalledOnce();
    const [cookieName] = mockCookieSet.mock.calls[0];
    expect(cookieName).toBe("auth-token");
  });

  test("sets a valid signed JWT containing userId and email", async () => {
    await createSession("user-1", "test@example.com");

    const [, token] = mockCookieSet.mock.calls[0];
    const secret = new TextEncoder().encode("development-secret-key");
    const { payload } = await jwtVerify(token, secret);

    expect(payload.userId).toBe("user-1");
    expect(payload.email).toBe("test@example.com");
  });

  test("sets cookie with httpOnly, lax sameSite, and root path", async () => {
    await createSession("user-1", "test@example.com");

    const [, , options] = mockCookieSet.mock.calls[0];
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
  });

  test("cookie expires approximately 7 days from now", async () => {
    const before = Date.now();
    await createSession("user-1", "test@example.com");
    const after = Date.now();

    const [, , options] = mockCookieSet.mock.calls[0];
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    expect(options.expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs);
    expect(options.expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs);
  });
});
