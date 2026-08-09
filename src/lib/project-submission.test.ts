// @vitest-environment jsdom

import { describe, expect, it } from "vite-plus/test";

import {
  countGraphemes,
  validateAssetType,
  validateOptionalLink,
  validateOptionalTicker,
  validateProjectImage,
  validateProjectName,
  validateShortDescription,
} from "@/lib/project-submission";

describe("project submission local validation", () => {
  it("normalizes one complete Sui Move type without a lookup", () => {
    const result = validateAssetType(" 0x2::sui::SUI ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(`0x${"0".repeat(63)}2::sui::SUI`);
    }
    expect(validateAssetType("SUI").ok).toBe(false);
    expect(validateAssetType("std::string::String").ok).toBe(false);
  });

  it("applies grapheme-aware product limits and code-point abuse ceilings", () => {
    expect(countGraphemes("👨‍👩‍👧‍👦")).toBe(1);
    expect(validateProjectName("x".repeat(61)).ok).toBe(false);
    expect(validateShortDescription("x".repeat(161)).ok).toBe(false);
    expect(validateShortDescription("first\nsecond").ok).toBe(false);
    expect(validateProjectName(`a${"\u0301".repeat(513)}`).ok).toBe(false);
    expect(validateShortDescription(`a${"\u0301".repeat(2_049)}`).ok).toBe(false);
  });

  it("normalizes public HTTPS links without mistaking public hostnames for IPv6", () => {
    expect(validateOptionalTicker("")).toEqual({ ok: true, value: null });
    expect(validateOptionalTicker("$DOJI").ok).toBe(false);
    expect(validateOptionalLink("https://X.com/doji#profile", "x")).toEqual({
      ok: true,
      value: "https://x.com/doji",
    });
    expect(validateOptionalLink("https://fcoin.com/project", "website")).toEqual({
      ok: true,
      value: "https://fcoin.com/project",
    });
    expect(validateOptionalLink("https://example.com/doji", "x").ok).toBe(false);
    expect(validateOptionalLink("http://project.example", "website").ok).toBe(false);
    expect(validateOptionalLink("https://project.example:444", "website").ok).toBe(false);
    expect(validateOptionalLink("https://localhost/project", "website").ok).toBe(false);
    expect(validateOptionalLink("https://192.168.1.1/project", "website").ok).toBe(false);
    expect(validateOptionalLink("https://[::1]/project", "website").ok).toBe(false);
    expect(validateOptionalLink("https://discordapp.com/invite/doji", "discord").ok).toBe(false);
    expect(validateOptionalLink("https://discord.gg/", "discord").ok).toBe(false);
  });

  it("accepts a one-pixel static image and rejects animation", async () => {
    await expect(
      validateProjectImage(
        createFile(pngBytes({ width: 1, height: 1 }), "profile.png", "image/png"),
      ),
    ).resolves.toMatchObject({
      ok: true,
      value: { width: 1, height: 1, mimeType: "image/png" },
    });
    await expect(
      validateProjectImage(createFile(animatedPngBytes(), "animated.png", "image/png")),
    ).resolves.toEqual({
      ok: false,
      message: "Animated images are not supported.",
    });
    await expect(
      validateProjectImage(
        createFile(pngBytes({ width: 8_000, height: 5_001 }), "huge.png", "image/png"),
      ),
    ).resolves.toEqual({
      ok: false,
      message: "Profile image dimensions are too large.",
    });
  });
});

function createFile(bytes: Uint8Array, name: string, type: string) {
  const file = new File([Uint8Array.from(bytes).buffer], name, { type });
  if (typeof file.arrayBuffer !== "function") {
    Object.defineProperty(file, "arrayBuffer", {
      value: async () => bytes.slice().buffer,
    });
  }
  return file;
}

function pngBytes({ width, height }: { width: number; height: number }) {
  const bytes = new Uint8Array(33);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes.set([0x00, 0x00, 0x00, 0x0d], 8);
  bytes.set([0x49, 0x48, 0x44, 0x52], 12);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

function animatedPngBytes() {
  const bytes = new Uint8Array(45);
  bytes.set(pngBytes({ width: 320, height: 320 }), 0);
  bytes.set([0x61, 0x63, 0x54, 0x4c], 37);
  return bytes;
}
