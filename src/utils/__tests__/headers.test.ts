import { describe, it, expect } from "bun:test";
import {
  getRandomUserAgent,
  getRotatingUserAgent,
  getHeaders,
} from "../headers";

describe("Headers Utils", () => {
  it("should return a valid user agent from getRandomUserAgent", () => {
    const userAgent = getRandomUserAgent();
    expect(userAgent).toBeTruthy();
    expect(typeof userAgent).toBe("string");
    expect(userAgent.length).toBeGreaterThan(0);
  });

  it("should return rotating user agents", () => {
    const agents: string[] = [];
    for (let i = 0; i < 10; i++) {
      agents.push(getRotatingUserAgent());
    }

    expect(agents.length).toBe(10);
    expect(agents.every((agent) => typeof agent === "string")).toBe(true);
  });

  it("should return headers with correct structure", () => {
    const headers = getHeaders();

    expect(headers).toHaveProperty("User-Agent");
    expect(headers).toHaveProperty("Accept");
    expect(headers).toHaveProperty("Accept-Language");
    expect(headers).toHaveProperty("Accept-Encoding");
    expect(headers).toHaveProperty("Connection");
    expect(headers).toHaveProperty("Upgrade-Insecure-Requests");
    expect(headers).toHaveProperty("Sec-Fetch-Dest");
    expect(headers).toHaveProperty("Sec-Fetch-Mode");
    expect(headers).toHaveProperty("Sec-Fetch-Site");
    expect(headers).toHaveProperty("Cache-Control");

    expect(typeof headers["User-Agent"]).toBe("string");
    expect(headers["User-Agent"]?.length).toBeGreaterThan(0);
  });

  it("should use rotating user agent in headers", () => {
    const headers1 = getHeaders();
    const headers2 = getHeaders();

    expect(headers1["User-Agent"]).toBeTruthy();
    expect(headers2["User-Agent"]).toBeTruthy();
  });
});

