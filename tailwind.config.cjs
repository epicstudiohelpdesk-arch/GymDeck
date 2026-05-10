/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/**/*.{html,js,jsx}",
    "./index.html",
    "./authentication/**/*.{html,js,jsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"]
      },
      boxShadow: {
        enterprise: "0 14px 32px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
