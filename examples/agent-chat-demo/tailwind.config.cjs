/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("reflex-os-utility-framework/tailwind-preset")],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,html}",
    "./node_modules/reflex-os-utility-framework/dist/**/*.{js,cjs}",
  ],
};
