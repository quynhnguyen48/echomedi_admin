const tinycolor = require("tinycolor2")

const pxMapping = {}
for (let i = 0; i <= 200; i++) {
  pxMapping[i] = `${i}px`
}

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      primary: "#416045",
      darkPrimary: "#416045",
      secondary: "#000000",
      white: "#FFFFFF",
      transparent: "transparent",
      placeholder: tinycolor("#000000").setAlpha(0.3).toRgbString(),
      pink: "#F05D82",
      pink2: "#F9AAAA",
      red: "#EB5757",
      yellow: "#F2C94C",
      purple: "#BB6BD9",
      green: "#27AE60",
      green2: "#2A7871",
      orange: "#E46239",
      orangeLight: "#F2994A",
      blue: "#2D9CDB",
      blue2: "#0070CE",
      blue3: "#45D0C1",
      blue4: "#2F80ED",
      gray: "#BDBDBD",
      gray2: "#F8F8F8",
      gray3: "#f8f8f9",
      gray4: "#BDBDBD",
      gray5: "#212121",
      error: "#EB5757",
      modal: "#e6e6e6",
      form: tinycolor("#8F92A1").setAlpha(0.05).toRgbString(),
      rightContent: "#F9F9F9",
      skeleton: "#e2e8f0",
      background: "#EDEDED",
      uncheck: "#EEEEEE",
    },
    fontFamily: {
      primary: ["DM Sans", "sans-serif"],
    },
    minHeight: {
      screen: "100vh",
      uploadBox: "5rem",
    },
    minWidth: {
      rightContent: "340px",
      tableDetail: "410px",
      loginForm: "500px",
    },
    maxHeight: {
      sidebarHeight: "calc(100vh - 8.375rem)",
      content: "calc(100vh - 100px)",
      tableBody: "calc(100vh - 150px)",
      mainContent: "calc(100vh - 154px)",
      settingContent: "calc(100vh - 180px)",
      full: "100%",
    },
    screens: {
      xl: { max: "1279px" },
      // => @media (max-width: 1279px) { ... }

      lg: { max: "1023px" },
      // => @media (max-width: 1023px) { ... }

      md: { max: "767px" },
      // => @media (max-width: 767px) { ... }

      sm: { max: "639px" },
      // => @media (max-width: 639px) { ... }
    },
    extend: {
      spacing: {
        sidebarWidth: "260px",
        4.5: "1.125rem",
        10.5: "2.625rem",
        17: "4.25rem",
        19.5: "4.875rem",
        22: "5.5rem",
        25: "6.25rem",
        27.5: "6.875rem",
        30: "7.5rem",
        33: "8.25rem",
        38.5: "9.625rem",
        45: "11.25rem",
        55: "13.75rem",
        60: "15rem",
        62: "15.5rem",
        70: "17.5rem",
        75: "18.75rem",
        79: "19.75rem",
        81: "20.25rem",
        143: "35.75rem",
        170: "42.5rem",
        62.5: "15.625rem",
      },
      borderWidth: {
        DEFAULT: "1px",
        0: "0px",
        0.5: "0.5px",
        1: "1px",
        2: "2px",
        3: "3px",
        4: "4px",
        5: "5px",
        6: "6px",
        7: "7px",
        8: "8px",
      },
      fontSize: {
        10: ["0.625rem", { lineHeight: "0.875rem" }],
        12: ["0.75rem", { lineHeight: "1.25rem" }],
        14: ["0.875rem", { lineHeight: "1.125rem" }],
        15: ["0.875rem", { lineHeight: "1.375rem" }],
        16: ["1rem", { lineHeight: "1.625rem" }],
        18: ["1.125rem", { lineHeight: "1.5rem" }],
        20: ["1.25rem", { lineHeight: "1.875rem" }],
        24: ["1.5rem", { lineHeight: "2rem" }],
        30: ["1.875rem", { lineHeight: "2.625rem" }],
        32: ["2rem", { lineHeight: "2.625rem" }],
        36: ["2.25rem", { lineHeight: "3rem" }],
      },
      fontWeight: {
        thin: "100",
        extraLight: "200",
        light: "300",
        normal: "400",
        regular: "400",
        medium: "500",
        semiBold: "600",
        bold: "700",
        extraBold: "800",
        black: "900",
      },
      borderRadius: {},
      borderColor: (theme) => ({
        ...theme("colors"),
      }),
      boxShadow: {
        sm: "0px 0px 10px rgba(0, 0, 0, 0.1)",
      },
      zIndex: {},
      animation: {
        "spin-fast": "spin 700ms linear infinite",
      },
      width: {
        rightContent: "340px",
        tableDetail: "410px",
      },
      gridTemplateColumns: {
        media: "repeat(auto-fit, minmax(250px, 1fr))",
      },
      translate: {
        5: "1.25rem",
        6.5: "1.625rem",
        7: "1.75rem",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide"), require("@tailwindcss/line-clamp")],
}
