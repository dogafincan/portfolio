import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import sharp from "sharp";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_SAFE_INSET = 64;
const OG_HEADER_TOP_GAP = 20;
const OG_PLATFORM_OVERLAY_ZONE_HEIGHT = 96;
const OG_REFERENCE_SCALE = 0.5;
const SERVER_HOST = "127.0.0.1";
const DEFAULT_START_PORT = 4173;

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptsDirectory, "..");
const packageJson = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8"));
const outputPath = resolve(repoRoot, process.env.OG_OUTPUT_PATH?.trim() || "public/og.png");
const temporaryOutputPath = `${outputPath}.${process.pid}.tmp`;
const seed = process.env.OG_SEED?.trim() || `${packageJson.name}:2026082201`;
const externalBaseUrl = process.env.OG_PREVIEW_BASE_URL?.replace(/\/$/, "");
const startPort =
  Number.parseInt(process.env.OG_PREVIEW_PORT ?? "", 10) ||
  DEFAULT_START_PORT + getPortOffset(packageJson.name);

let devServer = null;
let browser = null;
let serverLogs = "";

try {
  const baseUrl = externalBaseUrl ?? (await startDevServer());
  const previewUrl = `${baseUrl}/og-preview?seed=${encodeURIComponent(seed)}`;

  browser = await chromium.launch();
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { width: OG_WIDTH, height: OG_HEIGHT },
  });

  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await page.goto(previewUrl, { waitUntil: "networkidle" });

  const preview = page.locator("[data-og-preview]");
  await preview.waitFor({ state: "visible" });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const box = await preview.boundingBox();
  if (!box || Math.round(box.width) !== OG_WIDTH || Math.round(box.height) !== OG_HEIGHT) {
    throw new Error(
      `OG preview must render ${OG_WIDTH}x${OG_HEIGHT}, received ${box?.width ?? 0}x${
        box?.height ?? 0
      }.`,
    );
  }

  const layout = await readPreviewLayout(page);
  assertPreviewLayout(layout);

  await mkdir(dirname(outputPath), { recursive: true });
  await preview.screenshot({ animations: "disabled", path: temporaryOutputPath, type: "png" });
  await optimizePng(temporaryOutputPath);
  await browser.close();
  browser = null;

  assertPngSize(temporaryOutputPath);
  await rename(temporaryOutputPath, outputPath);
  console.log(`Generated public/og.png (${OG_WIDTH}x${OG_HEIGHT}) from ${previewUrl}`);
  console.log(`OG seed: ${seed}`);
  console.log(
    `OG reference type: ${(layout.title.fontSize * OG_REFERENCE_SCALE).toFixed(1)}px title, ${(layout.subtitle.fontSize * OG_REFERENCE_SCALE).toFixed(1)}px subtitle`,
  );
} finally {
  await browser?.close().catch(() => undefined);
  try {
    await unlink(temporaryOutputPath).catch((error) => {
      if (error.code !== "ENOENT") {
        throw error;
      }
    });
  } finally {
    await stopDevServer();
  }
}

async function readPreviewLayout(page) {
  return page.evaluate(() => {
    const element = (selector) => {
      const value = document.querySelector(selector);
      if (!(value instanceof HTMLElement)) {
        throw new Error(`Missing OG preview element: ${selector}`);
      }
      return value;
    };
    const rect = (value) => {
      const bounds = value.getBoundingClientRect();
      return {
        bottom: bounds.bottom,
        left: bounds.left,
        right: bounds.right,
        top: bounds.top,
      };
    };
    const text = (selector) => {
      const value = element(selector);
      return {
        ...rect(value),
        fontSize: Number.parseFloat(getComputedStyle(value).fontSize),
      };
    };
    const preview = element("[data-og-preview]");
    return {
      badge: text('[data-slot="badge"]'),
      brand: rect(element('[data-slot="app-navbar-brand"]')),
      navbar: rect(element('[data-slot="app-navbar"]')),
      preview: {
        ...rect(preview),
        scrollHeight: preview.scrollHeight,
        scrollWidth: preview.scrollWidth,
      },
      safeRegion: rect(element('[data-slot="og-preview-safe-region"]')),
      subtitle: text('[data-slot="app-header-subtitle"]'),
      title: text('[data-slot="app-header-title"]'),
    };
  });
}

function assertPreviewLayout(layout) {
  if (layout.preview.scrollWidth > OG_WIDTH || layout.preview.scrollHeight > OG_HEIGHT) {
    throw new Error("OG preview content overflows its 1200x630 canvas.");
  }
  const leftInset = layout.safeRegion.left - layout.preview.left;
  const rightInset = layout.preview.right - layout.safeRegion.right;
  const topGap = layout.safeRegion.top - layout.navbar.bottom;
  const overlayZoneHeight = layout.preview.bottom - layout.safeRegion.bottom;
  if (Math.round(leftInset) !== OG_SAFE_INSET || Math.round(rightInset) !== OG_SAFE_INSET) {
    throw new Error(`OG safe region must keep ${OG_SAFE_INSET}px horizontal insets.`);
  }
  if (Math.round(topGap) !== OG_HEADER_TOP_GAP) {
    throw new Error(
      `OG page header must begin ${OG_HEADER_TOP_GAP}px below the navbar, received ${topGap}px.`,
    );
  }
  if (Math.round(overlayZoneHeight) !== OG_PLATFORM_OVERLAY_ZONE_HEIGHT) {
    throw new Error(
      `OG preview must reserve a ${OG_PLATFORM_OVERLAY_ZONE_HEIGHT}px bottom platform-overlay exclusion zone, received ${overlayZoneHeight}px.`,
    );
  }
  for (const [name, bounds] of [
    ["badge", layout.badge],
    ["title", layout.title],
    ["subtitle", layout.subtitle],
  ]) {
    if (
      bounds.left < layout.safeRegion.left ||
      bounds.right > layout.safeRegion.right ||
      bounds.top < layout.safeRegion.top ||
      bounds.bottom > layout.safeRegion.bottom
    ) {
      throw new Error(`OG ${name} escapes the documented safe region.`);
    }
  }
  if (
    layout.brand.left < layout.preview.left + OG_SAFE_INSET ||
    layout.brand.right > layout.preview.right - OG_SAFE_INSET
  ) {
    throw new Error("OG navbar brand escapes the 64px horizontal safe area.");
  }
  if (layout.title.fontSize * OG_REFERENCE_SCALE < 38) {
    throw new Error("OG title is too small at the 600x315 reference size.");
  }
  if (layout.subtitle.fontSize * OG_REFERENCE_SCALE < 16) {
    throw new Error("OG subtitle is too small at the 600x315 reference size.");
  }
  if (layout.badge.fontSize * OG_REFERENCE_SCALE < 15) {
    throw new Error("OG badge is too small at the 600x315 reference size.");
  }
}

async function optimizePng(path) {
  const optimized = await sharp(path)
    .png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10, palette: false })
    .toBuffer();
  await writeFile(path, optimized);
}

async function startDevServer() {
  const port = await findAvailablePort(startPort);
  const localVp = resolve(
    repoRoot,
    "node_modules/.bin",
    process.platform === "win32" ? "vp.cmd" : "vp",
  );
  const command = existsSync(localVp) ? localVp : "vp";
  const args = ["dev", "--host", SERVER_HOST, "--port", String(port)];
  const baseUrl = `http://${SERVER_HOST}:${port}`;

  devServer = spawn(command, args, {
    cwd: repoRoot,
    detached: process.platform !== "win32",
    env: { ...process.env, BROWSER: "none" },
    stdio: ["ignore", "pipe", "pipe"],
  });

  devServer.stdout.on("data", collectServerLog);
  devServer.stderr.on("data", collectServerLog);

  await waitForServer(`${baseUrl}/og-preview?seed=${encodeURIComponent(seed)}`);

  return baseUrl;
}

function getPortOffset(name) {
  return Array.from(name).reduce((total, character) => total + character.charCodeAt(0), 0) % 2000;
}

async function stopDevServer() {
  if (!devServer || devServer.exitCode !== null) {
    return;
  }

  const pid = devServer.pid;

  try {
    if (pid && process.platform !== "win32") {
      process.kill(-pid, "SIGTERM");
    } else {
      devServer.kill("SIGTERM");
    }
  } catch {
    return;
  }

  await Promise.race([
    once(devServer, "close").catch(() => undefined),
    new Promise((resolveStop) => setTimeout(resolveStop, 2_000)),
  ]);

  if (devServer.exitCode === null && pid) {
    try {
      if (process.platform !== "win32") {
        process.kill(-pid, "SIGKILL");
      } else {
        devServer.kill("SIGKILL");
      }
    } catch {
      // The process may already be gone.
    }
  }
}

function collectServerLog(chunk) {
  serverLogs = `${serverLogs}${chunk.toString()}`.slice(-6000);
}

async function waitForServer(url) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 45_000) {
    if (devServer?.exitCode !== null) {
      throw new Error(`OG preview server exited early.\n${serverLogs}`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until the dev server starts accepting requests.
    }

    await new Promise((resolvePoll) => setTimeout(resolvePoll, 300));
  }

  throw new Error(`Timed out waiting for OG preview server.\n${serverLogs}`);
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 100; port += 1) {
    if (await canListen(port)) {
      return port;
    }
  }

  throw new Error(`No available local port found from ${startPort}.`);
}

function canListen(port) {
  return new Promise((resolvePort) => {
    const server = createServer();
    server.once("error", () => resolvePort(false));
    server.once("listening", () => {
      server.close(() => resolvePort(true));
    });
    server.listen(port, SERVER_HOST);
  });
}

function assertPngSize(path) {
  const image = readFileSync(path);

  if (image.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("Generated OG image is not a PNG.");
  }

  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);
  if (width !== OG_WIDTH || height !== OG_HEIGHT) {
    throw new Error(`Generated OG image is ${width}x${height}, expected ${OG_WIDTH}x${OG_HEIGHT}.`);
  }

  const colorType = image.readUInt8(25);
  if (colorType !== 2) {
    throw new Error(
      `Generated OG image must be an 8-bit truecolor PNG, received color type ${colorType}.`,
    );
  }
}
