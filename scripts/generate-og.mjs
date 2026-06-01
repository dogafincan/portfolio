import { spawn } from "node:child_process";
import { once } from "node:events";
import { existsSync, readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const SERVER_HOST = "127.0.0.1";
const DEFAULT_START_PORT = 4173;

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptsDirectory, "..");
const packageJson = JSON.parse(readFileSync(resolve(repoRoot, "package.json"), "utf8"));
const outputPath = resolve(repoRoot, "public/og.png");
const seed = process.env.OG_SEED?.trim() || `${packageJson.name}:2026060101`;
const externalBaseUrl = process.env.OG_PREVIEW_BASE_URL?.replace(/\/$/, "");
const startPort =
  Number.parseInt(process.env.OG_PREVIEW_PORT ?? "", 10) ||
  DEFAULT_START_PORT + getPortOffset(packageJson.name);

let devServer = null;
let serverLogs = "";

try {
  const baseUrl = externalBaseUrl ?? (await startDevServer());
  const previewUrl = `${baseUrl}/og-preview?seed=${encodeURIComponent(seed)}`;

  const browser = await chromium.launch();
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { width: OG_WIDTH, height: OG_HEIGHT },
  });

  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto(previewUrl, { waitUntil: "networkidle" });

  const preview = page.locator("[data-og-preview]");
  await preview.waitFor({ state: "visible" });

  const box = await preview.boundingBox();
  if (!box || Math.round(box.width) !== OG_WIDTH || Math.round(box.height) !== OG_HEIGHT) {
    throw new Error(
      `OG preview must render ${OG_WIDTH}x${OG_HEIGHT}, received ${box?.width ?? 0}x${
        box?.height ?? 0
      }.`,
    );
  }

  await mkdir(dirname(outputPath), { recursive: true });
  await preview.screenshot({ animations: "disabled", path: outputPath, type: "png" });
  await browser.close();

  assertPngSize(outputPath);
  console.log(`Generated public/og.png (${OG_WIDTH}x${OG_HEIGHT}) from ${previewUrl}`);
  console.log(`OG seed: ${seed}`);
} finally {
  await stopDevServer();
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
}
