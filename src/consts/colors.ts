export const COLORS = {
  primary: "#2d79f3",
  orange: "#ff8c00",
  green: "#4caf50",
  red: "#f44336",
  purple: "#9c27b0",
  yellow: "#ffc107",
  teal: "#009688",

  dark: {
    bg: "#0f1111",
    card: "#1a1d1d",
    text: "#ffffff",
    subText: "#8b8e98",
    border: "#252828",
    input: "#1a1d1d",
  },

  light: {
    bg: "#ffffff",
    card: "#f9f9f9",
    text: "#0f1111",
    subText: "#666666",
    border: "#eeeeee",
    input: "#f0f0f0",
  },
};

export const getTheme = (isDark: boolean) => ({
  bg: isDark ? COLORS.dark.bg : COLORS.light.bg,
  card: isDark ? COLORS.dark.card : COLORS.light.card,
  text: isDark ? COLORS.dark.text : COLORS.light.text,
  subText: isDark ? COLORS.dark.subText : COLORS.light.subText,
  border: isDark ? COLORS.dark.border : COLORS.light.border,
  input: isDark ? COLORS.dark.input : COLORS.light.input,
  primary: COLORS.primary,
  orange: COLORS.orange,
  green: COLORS.green,
  red: COLORS.red,
});