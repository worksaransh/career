import { describe, it, expect } from "vitest";
import {
  slugify,
  truncate,
  formatCurrency,
  formatPercentage,
  isValidEmail,
  isValidPhone,
  cn,
  groupBy,
  clamp,
} from "@career-os/utils";

describe("slugify", () => {
  it("converts text to slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("  Career  OS  ")).toBe("career-os");
    expect(slugify("Special!@#Chars")).toBe("specialchars");
  });
});

describe("truncate", () => {
  it("truncates text with proper length", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
    expect(truncate("Hi", 5)).toBe("Hi");
  });
});

describe("formatCurrency", () => {
  it("formats INR currency", () => {
    const result = formatCurrency(50000);
    expect(result).toContain("50,000");
  });
});

describe("formatPercentage", () => {
  it("formats percentage", () => {
    expect(formatPercentage(94.5)).toBe("95%");
    expect(formatPercentage(94.5, 1)).toBe("94.5%");
  });
});

describe("isValidEmail", () => {
  it("validates email correctly", () => {
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("invalid")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("validates phone correctly", () => {
    expect(isValidPhone("+919876543210")).toBe(true);
    expect(isValidPhone("9876543210")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", undefined, null)).toBe("foo");
  });
});

describe("groupBy", () => {
  it("groups items by key", () => {
    const items = [
      { type: "a", name: "1" },
      { type: "b", name: "2" },
      { type: "a", name: "3" },
    ];
    const grouped = groupBy(items, (item) => item.type);
    expect(Object.keys(grouped)).toEqual(["a", "b"]);
    expect(grouped.a).toHaveLength(2);
    expect(grouped.b).toHaveLength(1);
  });
});

describe("clamp", () => {
  it("clamps values within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});
