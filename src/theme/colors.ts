/**
 * A dark, ink-and-paper inspired palette. Reading apps live or die on how
 * comfortable the surrounding chrome is in a dim room, so the background
 * sits near-black rather than pure black (easier on OLED ghosting and on
 * the eyes), with a single warm accent used sparingly.
 */
export const colors = {
  background: "#121214",
  surface: "#1B1B1F",
  surfaceAlt: "#242428",
  border: "#2E2E33",
  textPrimary: "#F2F1ED",
  textSecondary: "#A8A7B3",
  textMuted: "#6E6D78",
  accent: "#E8664C",
  accentMuted: "#4A2B26",
  danger: "#E8664C",
  success: "#5FB98C",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
};

export const typography = {
  title: { fontSize: 20, fontWeight: "700" as const },
  subtitle: { fontSize: 15, fontWeight: "600" as const },
  body: { fontSize: 14, fontWeight: "400" as const },
  caption: { fontSize: 12, fontWeight: "400" as const },
};
