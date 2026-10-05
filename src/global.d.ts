/**
 * Transitional escape hatch for legacy, unvalidated service/API payloads.
 * Prefer explicit DTOs at each boundary; keep new uses out of core domain logic.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- centralized compatibility alias for existing untyped API payloads.
  type LegacyLooseValue = any;
}

export {};
