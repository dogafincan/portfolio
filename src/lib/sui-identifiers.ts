const SUI_ADDRESS_PATTERN = /^(?:0x)?([0-9a-fA-F]{1,64})$/u;
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_VALUES = new Map(
  Array.from(BASE58_ALPHABET, (character, index) => [character, BigInt(index)]),
);

export function isValidSuiAddress(value: string) {
  return SUI_ADDRESS_PATTERN.test(value.trim());
}

export function normalizeSuiAddress(value: string) {
  const match = value.trim().match(SUI_ADDRESS_PATTERN);
  if (!match) {
    throw new Error("Invalid wallet address.");
  }
  return `0x${match[1].toLowerCase().padStart(64, "0")}`;
}

export function isValidSuiTransactionDigest(value: string) {
  const digest = value.trim();
  if (digest.length < 32 || digest.length > 64) {
    return false;
  }

  let decoded = 0n;
  for (const character of digest) {
    const digit = BASE58_VALUES.get(character);
    if (digit === undefined) {
      return false;
    }
    decoded = decoded * 58n + digit;
  }

  let decodedByteCount = 0;
  for (let remaining = decoded; remaining > 0n; remaining >>= 8n) {
    decodedByteCount += 1;
  }
  const leadingZeroByteCount = digest.match(/^1*/u)?.[0].length ?? 0;
  return decodedByteCount + leadingZeroByteCount === 32;
}
