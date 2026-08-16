import { isValidStructTag, normalizeStructTag, parseStructTag } from "@mysten/sui/utils";

export const PROJECT_SUBMISSION_LIMITS = {
  assetTypeMaxCharacters: 512,
  projectNameMaxCodePoints: 512,
  projectNameMaxGraphemes: 60,
  shortDescriptionMaxCodePoints: 2_048,
  shortDescriptionMaxGraphemes: 160,
  tickerMaxCharacters: 32,
  profileImageMaxBytes: 5_000_000,
  profileImageMaxPixels: 40_000_000,
  linkMaxCharacters: 2_048,
} as const;

export type ProjectSubmissionFormValues = {
  assetType: string;
  projectName: string;
  shortDescription: string;
  ticker: string;
  websiteUrl: string;
  xUrl: string;
  telegramUrl: string;
  discordUrl: string;
};

export type ProjectSubmissionFormField = keyof ProjectSubmissionFormValues | "profileImage";
export type ProjectSubmissionFormErrors = Partial<Record<ProjectSubmissionFormField, string>>;

export type ValidatedProjectImage = {
  file: File;
  height: number;
  mimeType: "image/avif" | "image/jpeg" | "image/png" | "image/webp";
  width: number;
};

export type ValidatedProjectSubmission = {
  assetType: string;
  projectName: string;
  shortDescription: string;
  ticker: string | null;
  links: {
    website: string | null;
    x: string | null;
    telegram: string | null;
    discord: string | null;
  };
  profileImage: ValidatedProjectImage;
};

type ValidationResult<T> = { ok: true; value: T } | { ok: false; message: string };

const tickerPattern = /^[A-Za-z0-9]+$/u;
const lineBreakPattern = /[\r\n\u2028\u2029]/u;
const hiddenControlOrFormatPattern = /[\p{Cc}\p{Cs}\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff]/u;
const socialHosts = {
  x: new Set(["x.com", "www.x.com", "twitter.com", "www.twitter.com"]),
  telegram: new Set(["t.me", "telegram.me", "www.telegram.me"]),
  discord: new Set(["discord.gg", "discord.com", "www.discord.com"]),
} as const;
const graphemeSegmenter =
  typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

export function countGraphemes(value: string) {
  return graphemeSegmenter
    ? Array.from(graphemeSegmenter.segment(value)).length
    : Array.from(value).length;
}

export function validateAssetType(value: string): ValidationResult<string> {
  const trimmed = value.trim();
  if (
    !trimmed ||
    trimmed.length > PROJECT_SUBMISSION_LIMITS.assetTypeMaxCharacters ||
    !isValidStructTag(trimmed)
  ) {
    return invalid("Enter the complete valid asset identifier.");
  }
  try {
    const normalized = normalizeStructTag(parseStructTag(trimmed));
    return normalized.length <= PROJECT_SUBMISSION_LIMITS.assetTypeMaxCharacters
      ? { ok: true, value: normalized }
      : invalid("Enter the complete valid asset identifier.");
  } catch {
    return invalid("Enter the complete valid asset identifier.");
  }
}

export function validateProjectName(value: string): ValidationResult<string> {
  return validatePlainText({
    value,
    requiredMessage: "Project name is required.",
    maxCodePoints: PROJECT_SUBMISSION_LIMITS.projectNameMaxCodePoints,
    maxGraphemes: PROJECT_SUBMISSION_LIMITS.projectNameMaxGraphemes,
    tooLongMessage: "Project name must be 60 characters or fewer.",
    invalidCharactersMessage: "Project name cannot include line breaks or hidden characters.",
  });
}

export function validateShortDescription(value: string): ValidationResult<string> {
  return validatePlainText({
    value,
    requiredMessage: "Short description is required.",
    maxCodePoints: PROJECT_SUBMISSION_LIMITS.shortDescriptionMaxCodePoints,
    maxGraphemes: PROJECT_SUBMISSION_LIMITS.shortDescriptionMaxGraphemes,
    tooLongMessage: "Short description must be 160 characters or fewer.",
    invalidCharactersMessage: "Short description cannot include line breaks or hidden characters.",
  });
}

export function validateOptionalTicker(value: string): ValidationResult<string | null> {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }
  return trimmed.length <= PROJECT_SUBMISSION_LIMITS.tickerMaxCharacters &&
    tickerPattern.test(trimmed)
    ? { ok: true, value: trimmed }
    : invalid("Ticker must use 32 letters and numbers or fewer, without a $ prefix.");
}

export function validateOptionalLink(
  value: string,
  kind: "discord" | "telegram" | "website" | "x",
): ValidationResult<string | null> {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }
  if (
    trimmed.length > PROJECT_SUBMISSION_LIMITS.linkMaxCharacters ||
    hiddenControlOrFormatPattern.test(trimmed)
  ) {
    return invalid(linkError(kind));
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password || url.port) {
      return invalid(linkError(kind));
    }
    const hostname = url.hostname.toLowerCase().replace(/\.$/u, "");
    if (
      kind === "website"
        ? isLocalOrPrivateHostname(hostname)
        : !socialHosts[kind].has(hostname) || url.pathname === "/"
    ) {
      return invalid(linkError(kind));
    }
    url.hostname = hostname;
    url.hash = "";
    return { ok: true, value: url.toString() };
  } catch {
    return invalid(linkError(kind));
  }
}

export function validateProjectSubmission(
  values: ProjectSubmissionFormValues,
  profileImage: ValidatedProjectImage | null,
):
  | { ok: true; value: ValidatedProjectSubmission }
  | { ok: false; errors: ProjectSubmissionFormErrors } {
  const fields = {
    assetType: validateAssetType(values.assetType),
    projectName: validateProjectName(values.projectName),
    shortDescription: validateShortDescription(values.shortDescription),
    ticker: validateOptionalTicker(values.ticker),
    websiteUrl: validateOptionalLink(values.websiteUrl, "website"),
    xUrl: validateOptionalLink(values.xUrl, "x"),
    telegramUrl: validateOptionalLink(values.telegramUrl, "telegram"),
    discordUrl: validateOptionalLink(values.discordUrl, "discord"),
  };
  const errors: ProjectSubmissionFormErrors = {};
  for (const [field, result] of Object.entries(fields)) {
    if (!result.ok) {
      errors[field as keyof typeof fields] = result.message;
    }
  }
  if (!profileImage) {
    errors.profileImage = "Profile image is required.";
  }
  if (
    !fields.assetType.ok ||
    !fields.projectName.ok ||
    !fields.shortDescription.ok ||
    !fields.ticker.ok ||
    !fields.websiteUrl.ok ||
    !fields.xUrl.ok ||
    !fields.telegramUrl.ok ||
    !fields.discordUrl.ok ||
    !profileImage
  ) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      assetType: fields.assetType.value,
      projectName: fields.projectName.value,
      shortDescription: fields.shortDescription.value,
      ticker: fields.ticker.value,
      links: {
        website: fields.websiteUrl.value,
        x: fields.xUrl.value,
        telegram: fields.telegramUrl.value,
        discord: fields.discordUrl.value,
      },
      profileImage,
    },
  };
}

export async function validateProjectImage(
  file: File,
): Promise<ValidationResult<ValidatedProjectImage>> {
  if (file.size > PROJECT_SUBMISSION_LIMITS.profileImageMaxBytes) {
    return invalid("Profile image must be 5 MB or smaller.");
  }
  if (file.type === "image/gif") {
    return invalid("Animated images are not supported.");
  }
  if (!isSupportedImageMimeType(file.type)) {
    return invalid("Upload a static JPG, PNG, WebP, or AVIF image.");
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    return invalid("The image could not be read. Choose the file again.");
  }
  const dimensions = inspectImageBytes(bytes, file.type);
  return dimensions.ok
    ? {
        ok: true,
        value: {
          file,
          mimeType: file.type,
          width: dimensions.value.width,
          height: dimensions.value.height,
        },
      }
    : dimensions;
}

function inspectImageBytes(
  bytes: Uint8Array,
  mimeType: ValidatedProjectImage["mimeType"],
): ValidationResult<{ height: number; width: number }> {
  if (mimeType === "image/png") {
    if (bytes.length < 24 || ascii(bytes, 1, 3) !== "PNG" || ascii(bytes, 12, 4) !== "IHDR") {
      return invalidImage();
    }
    if (containsAscii(bytes, "acTL")) {
      return invalid("Animated images are not supported.");
    }
    const view = dataView(bytes);
    return validDimensions(view.getUint32(16), view.getUint32(20));
  }
  if (mimeType === "image/jpeg") {
    return inspectJpeg(bytes);
  }
  if (mimeType === "image/webp") {
    return inspectWebp(bytes);
  }
  return inspectAvif(bytes);
}

function inspectJpeg(bytes: Uint8Array): ValidationResult<{ height: number; width: number }> {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return invalidImage();
  }
  const view = dataView(bytes);
  let offset = 2;
  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) {
      continue;
    }
    if (offset + 2 > bytes.length) {
      break;
    }
    const segmentLength = view.getUint16(offset);
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      break;
    }
    if (isJpegStartOfFrame(marker) && segmentLength >= 7) {
      return validDimensions(view.getUint16(offset + 5), view.getUint16(offset + 3));
    }
    offset += segmentLength;
  }
  return invalidImage();
}

function inspectWebp(bytes: Uint8Array): ValidationResult<{ height: number; width: number }> {
  if (bytes.length < 25 || ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WEBP") {
    return invalidImage();
  }
  const chunk = ascii(bytes, 12, 4);
  if (chunk === "VP8X") {
    if (bytes.length < 30) {
      return invalidImage();
    }
    if ((bytes[20] & 0x02) !== 0) {
      return invalid("Animated images are not supported.");
    }
    return validDimensions(
      readUint24LittleEndian(bytes, 24) + 1,
      readUint24LittleEndian(bytes, 27) + 1,
    );
  }
  if (
    chunk === "VP8 " &&
    bytes.length >= 30 &&
    bytes[23] === 0x9d &&
    bytes[24] === 0x01 &&
    bytes[25] === 0x2a
  ) {
    const view = dataView(bytes);
    return validDimensions(view.getUint16(26, true) & 0x3fff, view.getUint16(28, true) & 0x3fff);
  }
  if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
    return validDimensions(
      1 + bytes[21] + ((bytes[22] & 0x3f) << 8),
      1 + ((bytes[22] >> 6) | (bytes[23] << 2) | ((bytes[24] & 0x0f) << 10)),
    );
  }
  return invalidImage();
}

type IsoBox = { end: number; payloadStart: number; type: string };

function inspectAvif(bytes: Uint8Array): ValidationResult<{ height: number; width: number }> {
  const boxes = readIsoBoxes(bytes, 0, bytes.length);
  const fileType = boxes.find((box) => box.type === "ftyp");
  if (!fileType) {
    return invalidImage();
  }
  const brands = readAvifBrands(bytes, fileType);
  if (
    brands.includes("avis") ||
    hasIsoBox(bytes, boxes, "moov") ||
    hasIsoBox(bytes, boxes, "trak")
  ) {
    return invalid("Animated images are not supported.");
  }
  if (!brands.includes("avif")) {
    return invalidImage();
  }
  const dimensions = findAvifDimensions(bytes, boxes);
  return dimensions ? validDimensions(dimensions.width, dimensions.height) : invalidImage();
}

function readIsoBoxes(bytes: Uint8Array, start: number, end: number): IsoBox[] {
  const view = dataView(bytes);
  const boxes: IsoBox[] = [];
  let offset = start;
  while (offset + 8 <= end) {
    const size32 = view.getUint32(offset);
    const type = ascii(bytes, offset + 4, 4);
    let headerSize = 8;
    let size = size32;
    if (size32 === 1) {
      if (offset + 16 > end) {
        break;
      }
      const largeSize = view.getBigUint64(offset + 8);
      if (largeSize > BigInt(Number.MAX_SAFE_INTEGER)) {
        break;
      }
      headerSize = 16;
      size = Number(largeSize);
    } else if (size32 === 0) {
      size = end - offset;
    }
    if (size < headerSize || offset + size > end) {
      break;
    }
    boxes.push({ type, payloadStart: offset + headerSize, end: offset + size });
    offset += size;
  }
  return boxes;
}

function readAvifBrands(bytes: Uint8Array, box: IsoBox) {
  if (box.payloadStart + 8 > box.end) {
    return [];
  }
  const brands = [ascii(bytes, box.payloadStart, 4)];
  for (let offset = box.payloadStart + 8; offset + 4 <= box.end; offset += 4) {
    brands.push(ascii(bytes, offset, 4));
  }
  return brands;
}

function findAvifDimensions(
  bytes: Uint8Array,
  boxes: IsoBox[],
): { height: number; width: number } | null {
  for (const box of boxes) {
    if (box.type === "ispe" && box.payloadStart + 12 <= box.end) {
      const view = dataView(bytes);
      return {
        width: view.getUint32(box.payloadStart + 4),
        height: view.getUint32(box.payloadStart + 8),
      };
    }
    const range = childBoxRange(box);
    if (range) {
      const dimensions = findAvifDimensions(bytes, readIsoBoxes(bytes, range.start, range.end));
      if (dimensions) {
        return dimensions;
      }
    }
  }
  return null;
}

function hasIsoBox(bytes: Uint8Array, boxes: IsoBox[], type: string): boolean {
  return boxes.some((box) => {
    if (box.type === type) {
      return true;
    }
    const range = childBoxRange(box);
    return range ? hasIsoBox(bytes, readIsoBoxes(bytes, range.start, range.end), type) : false;
  });
}

function childBoxRange(box: IsoBox) {
  if (box.type === "meta") {
    const start = box.payloadStart + 4;
    return start <= box.end ? { start, end: box.end } : null;
  }
  return new Set(["iprp", "ipco", "moov", "trak", "mdia", "minf", "stbl"]).has(box.type)
    ? { start: box.payloadStart, end: box.end }
    : null;
}

function validDimensions(width: number, height: number) {
  if (width <= 0 || height <= 0) {
    return invalidImage();
  }
  if (width * height > PROJECT_SUBMISSION_LIMITS.profileImageMaxPixels) {
    return invalid("Profile image dimensions are too large.");
  }
  return { ok: true as const, value: { width, height } };
}

function validatePlainText(input: {
  invalidCharactersMessage: string;
  maxCodePoints: number;
  maxGraphemes: number;
  requiredMessage: string;
  tooLongMessage: string;
  value: string;
}) {
  const normalized = input.value.normalize("NFC").trim();
  if (!normalized) {
    return invalid(input.requiredMessage);
  }
  if (lineBreakPattern.test(normalized) || hiddenControlOrFormatPattern.test(normalized)) {
    return invalid(input.invalidCharactersMessage);
  }
  if (
    countGraphemes(normalized) > input.maxGraphemes ||
    Array.from(normalized).length > input.maxCodePoints
  ) {
    return invalid(input.tooLongMessage);
  }
  return { ok: true as const, value: normalized };
}

function linkError(kind: "discord" | "telegram" | "website" | "x") {
  return {
    website: "Website link must be a valid HTTPS URL.",
    x: "X link must be a valid x.com or twitter.com URL.",
    telegram: "Telegram link must be a valid t.me or telegram.me URL.",
    discord: "Discord link must be a valid discord.gg or discord.com URL.",
  }[kind];
}

function isLocalOrPrivateHostname(hostname: string) {
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    return true;
  }
  const ipv4 = hostname.split(".").map(Number);
  if (
    ipv4.length === 4 &&
    ipv4.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255)
  ) {
    const [first, second, third] = ipv4 as [number, number, number, number];
    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 &&
        (second === 168 ||
          (second === 0 && (third === 0 || third === 2)) ||
          (second === 88 && third === 99))) ||
      (first === 198 && (second === 18 || second === 19 || (second === 51 && third === 100))) ||
      (first === 203 && second === 0 && third === 113) ||
      first >= 224
    );
  }
  const ipv6 = hostname.replace(/^\[|\]$/gu, "");
  if (!ipv6.includes(":")) {
    return false;
  }
  return (
    ipv6 === "::" ||
    ipv6 === "::1" ||
    ipv6.startsWith("fc") ||
    ipv6.startsWith("fd") ||
    /^fe[89ab]/u.test(ipv6) ||
    ipv6.startsWith("ff") ||
    ipv6.startsWith("2001:db8") ||
    ipv6.startsWith("::ffff:")
  );
}

function isSupportedImageMimeType(value: string): value is ValidatedProjectImage["mimeType"] {
  return ["image/avif", "image/jpeg", "image/png", "image/webp"].includes(value);
}

function isJpegStartOfFrame(marker: number | undefined) {
  return (
    marker !== undefined &&
    ((marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf))
  );
}

function containsAscii(bytes: Uint8Array, value: string) {
  const target = new TextEncoder().encode(value);
  for (let index = 0; index <= bytes.length - target.length; index += 1) {
    if (target.every((byte, targetIndex) => bytes[index + targetIndex] === byte)) {
      return true;
    }
  }
  return false;
}

function readUint24LittleEndian(bytes: Uint8Array, offset: number) {
  return bytes[offset] + (bytes[offset + 1] << 8) + (bytes[offset + 2] << 16);
}

function ascii(bytes: Uint8Array, offset: number, length: number) {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}

function dataView(bytes: Uint8Array) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}

function invalidImage() {
  return invalid("Upload a static JPG, PNG, WebP, or AVIF image.");
}

function invalid(message: string): { ok: false; message: string } {
  return { ok: false, message };
}
