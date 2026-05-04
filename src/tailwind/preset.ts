/**
 * Tailwind preset for Reflex OS utilities. Pulls in the design tokens used by
 * built-in Reflex apps: dark surfaces, warm cream foreground, indigo accent.
 *
 * Usage in `tailwind.config.cjs`:
 *
 * ```js
 * /** @type {import('tailwindcss').Config} *\/
 * module.exports = {
 *   presets: [require("reflex-os-utility-framework/tailwind-preset")],
 *   content: [
 *     "./index.html",
 *     "./src/**\/*.{ts,tsx,html}",
 *     "./node_modules/reflex-os-utility-framework/dist/**\/*.{js,cjs}",
 *   ],
 * };
 * ```
 *
 * The framework intentionally does NOT include Tailwind itself — utilities pin
 * a Tailwind version and call `@tailwind base; @tailwind components;
 * @tailwind utilities;` from their own entry CSS.
 */
const preset = {
  darkMode: "class" as const,
  theme: {
    extend: {
      colors: {
        reflex: {
          bg: "#171819",
          surface: "#202123",
          "surface-2": "#242629",
          "surface-3": "#2a2c2f",
          border: "#343638",
          "border-strong": "#3d4043",
          fg: "#f4f2ed",
          "fg-soft": "#deded9",
          "fg-muted": "#a9aaa6",
          "fg-faint": "#8f918d",
          danger: "#ffb3aa",
          "danger-border": "#5c3732",
          accent: "#f0eee8",
          "accent-fg": "#151515",
          link: "#9ec1ff",
          warn: "#ffd58a",
          ok: "#9ce29c",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "14px",
      },
      boxShadow: {
        "reflex-card":
          "0 1px 0 0 rgba(255,255,255,0.02) inset, 0 8px 24px -16px rgba(0,0,0,0.6)",
        "reflex-pop":
          "0 16px 40px -16px rgba(0,0,0,0.6), 0 4px 12px -4px rgba(0,0,0,0.4)",
      },
      fontSize: {
        xxs: ["10px", { lineHeight: "14px" }],
      },
    },
  },
  plugins: [],
};

export default preset;
