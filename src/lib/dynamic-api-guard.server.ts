type DynamicApiContract = {
  contentType: "application/json" | "multipart/form-data";
  maximumBodyBytes: number;
  method: "POST";
};

const DYNAMIC_API_CONTRACTS = new Map<string, DynamicApiContract>([
  [
    "/api/v1/payment/challenge",
    { contentType: "application/json", maximumBodyBytes: 4_096, method: "POST" },
  ],
  [
    "/api/v1/payment/redeem-project-submission",
    { contentType: "application/json", maximumBodyBytes: 20_000, method: "POST" },
  ],
  [
    "/api/v1/submissions",
    { contentType: "multipart/form-data", maximumBodyBytes: 5_100_000, method: "POST" },
  ],
]);

export const DYNAMIC_API_PATHS = Object.freeze([...DYNAMIC_API_CONTRACTS.keys()]);

/**
 * Reject malformed Worker-first requests before a limiter, service binding, or
 * body read. Route handlers and Registry still own streaming and semantic
 * limits.
 */
export function guardDynamicApiEnvelope(request: Request): Response | null {
  const url = new URL(request.url);
  const contract = DYNAMIC_API_CONTRACTS.get(url.pathname);
  if (!contract) {
    return null;
  }
  try {
    const contentEncoding = request.headers.get("content-encoding");
    if (contentEncoding !== null && contentEncoding.trim() !== "") {
      return rejection(415, "Encoded request bodies are not allowed.");
    }
    if (url.search) {
      return rejection(400, "Query parameters are not allowed.");
    }
    if (request.method !== contract.method) {
      return rejection(405, "Method not allowed.", { Allow: contract.method });
    }
    if (request.headers.get("origin") !== url.origin) {
      return rejection(403, "Request origin is not allowed.");
    }
    if (!hasExpectedContentType(request, contract.contentType)) {
      return rejection(415, `Expected ${contract.contentType}.`);
    }
    const declaredLength = parseDeclaredLength(request);
    if (contract.contentType === "multipart/form-data" && declaredLength === null) {
      return rejection(411, "Content-Length is required.");
    }
    if (declaredLength !== null && declaredLength > contract.maximumBodyBytes) {
      return rejection(413, "Request body is too large.");
    }
  } catch (error) {
    if (error instanceof InvalidDeclaredLengthError) {
      return rejection(400, "Content-Length is invalid.");
    }
    throw error;
  }
  return null;
}

function hasExpectedContentType(
  request: Request,
  expected: "application/json" | "multipart/form-data",
) {
  const value = request.headers.get("content-type");
  if (!value || value.length > 512) {
    return false;
  }
  const [mediaType = "", ...parameters] = value.split(";");
  if (mediaType.trim().toLowerCase() !== expected) {
    return false;
  }
  if (expected === "application/json") {
    return true;
  }
  return parameters.some((parameter) => {
    const [name = "", rawValue = ""] = parameter.split("=", 2);
    if (name.trim().toLowerCase() !== "boundary") {
      return false;
    }
    const trimmed = rawValue.trim();
    const boundary =
      trimmed.startsWith('"') && trimmed.endsWith('"') ? trimmed.slice(1, -1) : trimmed;
    return (
      boundary.length >= 1 && boundary.length <= 70 && /^[A-Za-z0-9'()+_,./:=?-]+$/u.test(boundary)
    );
  });
}

function parseDeclaredLength(request: Request) {
  const value = request.headers.get("content-length");
  if (value === null) {
    return null;
  }
  if (!/^(?:0|[1-9][0-9]*)$/u.test(value)) {
    throw new InvalidDeclaredLengthError();
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new InvalidDeclaredLengthError();
  }
  return parsed;
}

function rejection(status: number, message: string, headers?: HeadersInit) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Cache-Control", "no-store");
  responseHeaders.set("Content-Type", "application/json; charset=utf-8");
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  return Response.json({ error: message }, { status, headers: responseHeaders });
}

class InvalidDeclaredLengthError extends Error {}
