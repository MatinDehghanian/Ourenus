import { createTheme } from "@mui/material/styles";

const commonColors = {
  white: "rgba(255, 255, 255, 1)",
  black: "rgba(0, 0, 0, 1)",
  transparentWhite: "rgba(255, 255, 255, 0.3)",
  transparentBlack: "rgba(0, 0, 0, 0.1)",
  darkGray: "rgba(38, 42, 62, 1)",
  lightGray: "rgba(243, 244, 254, 1)",
  lightPurple: "rgba(156, 39, 176, 1)",
  darkPurple: "rgba(106, 27, 154, 1)",
};

const colors = {
  gradients: {
    light: `linear-gradient(to right, ${commonColors.white}, rgba(52, 0, 79, 0.12))`,
    dark: `linear-gradient(to right, rgba(34, 34, 34, 0.8), rgba(91, 7, 122, 0.1))`,
    purpleLight: commonColors.lightPurple,
    purpleDark: commonColors.darkPurple,
    low: {
      colors: {
        light: ["rgba(255, 102, 102, 1)", "rgba(153, 0, 0, 1)"],
        dark: ["rgba(255, 102, 102, .5)", "rgba(153, 0, 0, .9)"],
      },
      background: "rgba(214, 194, 35, 0.2)",
      typographyGradient:
        "linear-gradient(0deg, rgba(255, 102, 102, 1), rgba(153, 0, 0, 1))",
    },
    medium: {
      colors: {
        light: ["rgba(207, 110, 22, 1)", "rgba(255, 165, 0, 1)"],
        dark: ["rgba(255, 255, 102, 0.4)"],
      },
      background: "rgba(214, 194, 35, 0.2)",
      typographyGradient:
        "linear-gradient(0deg, rgba(214, 194, 35, 1), rgba(255, 165, 0, 1))",
    },
    high: {
      colors: {
        light: ["rgba(144, 238, 144, 1)", "rgba(0, 100, 0, 1)"],
        dark: ["rgba(144, 238, 144, 0.6)"],
      },
      background: "rgba(144, 238, 144, 0.2)",
      typographyGradient:
        "linear-gradient(0deg, rgba(144, 238, 144, 1), rgba(0, 100, 0, 1))",
    },
  },
  rgb: {
    lightShadow: "rgba(0, 0, 0, 0.1)",
    darkShadow: "rgba(255, 255, 255, 0.1)",
  },
  apps: {
    light: "rgba(72, 76, 112, 1)",
    dark: "rgba(117, 122, 166, 1)",
    priceBtn: {
      free: {
        btn: { dark: "rgba(26, 41, 39, 1)", light: "rgba(226, 241, 239, 1)" },
        text: {
          dark: "rgba(136, 192, 166, 1)",
          light: "rgba(108, 185, 173, 1)",
        },
      },
      paid: {
        btn: {
          dark: "rgba(255, 25, 25, 0.65)",
          light: "rgba(255, 25, 25, 0.65)",
        },
        text: { dark: commonColors.white, light: commonColors.white },
      },
      ad: {
        btn: {
          dark: "rgba(255, 255, 255, 0.65)",
          light: "rgba(255, 255, 255, 0.65)",
        },
        text: { dark: commonColors.black, light: commonColors.black },
      },
    },
  },
  configs: {
    light: commonColors.white,
    dark: "rgba(72, 76, 122, 1)",
    revert: {
      dark: commonColors.white,
      light: "rgba(72, 76, 122, 1)",
    },
  },
  capsuleBtn: {
    active: {
      dark: commonColors.white,
      light: "rgba(82, 88, 125, 1)",
    },
    notActive: {
      dark: commonColors.white,
      light: "rgba(121, 124, 146, 1)",
    },
    background: {
      dark: "rgba(72, 76, 111, 1)",
      light: commonColors.lightGray,
    },
    slider: "rgba(143, 141, 179, 0.6)",
  },
  box: {
    dark: "rgba(72, 76, 111, 1)",
    light: commonColors.white,
    border: {
      dark: "",
      light: "1px solid rgba(255, 255, 255, 0.42)",
    },
  },
  userBox: {
    statusBtn: {
      btn: {
        active: {
          dark: "rgba(26, 41, 39, 1)",
          light: "rgba(226, 241, 239, 1)",
        },
        expired: {
          dark: "rgba(113, 63, 18, 0.7)",
          light: "rgba(254, 249, 195, 1)",
        },
        limited: {
          dark: "rgba(127, 29, 29, 0.7)",
          light: "rgba(254, 226, 226, 1)",
        },
        onHold: {
          dark: "rgba(76, 0, 153, 0.7)",
          light: "rgba(243, 232, 255, 1)",
        },
        disabled: {
          dark: "rgba(34, 34, 34, 1)",
          light: "rgba(243, 244, 246, 1)",
        },
      },
      text: {
        active: {
          dark: "rgba(136, 192, 166, 1)",
          light: "rgba(108, 185, 173, 1)",
        },
        expired: {
          dark: "rgba(253, 224, 71, 1)",
          light: "rgba(161, 98, 7, 1)",
        },
        limited: {
          dark: "rgba(254, 202, 202, 1)",
          light: "rgba(220, 38, 38, 1)",
        },
        onHold: {
          dark: "rgba(233, 213, 255, 1)",
          light: "rgba(147, 51, 234, 1)",
        },
        disabled: {
          dark: "rgba(156, 163, 175, 1)",
          light: "rgba(107, 114, 128, 1)",
        },
      },
    },
    logoColor: {
      dark: "rgba(192, 192, 192, 1)",
      light: "rgba(83, 72, 141, 1)",
    },
    supportBox: {
      dark: "rgba(25, 40, 160, 1)",
      light: "rgba(50, 77, 221, 1)",
    },
  },
  glassColor: commonColors.transparentWhite,
  BWColor: {
    light: commonColors.black,
    dark: commonColors.white,
  },
  BWColorRevert: {
    light: commonColors.white,
    dark: commonColors.black,
  },
  grayColor: {
    light: "rgba(84, 84, 84, 1)",
    dark: "rgba(204, 204, 204, 1)",
  },
  background: {
    dark: commonColors.darkGray,
    light: commonColors.lightGray,
  },
};

const getTheme = (isDarkMode) =>
  createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      background: {
        default: isDarkMode ? colors.background.dark : colors.background.light,
        paper: "transparent",
      },
    },
    components: {
      MuiAccordion: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(8px)",
            borderRadius: "16px !important",
            border: isDarkMode ? "1px solid rgba(255, 255, 255, 0.42)" : "",
            color: isDarkMode ? commonColors.black : commonColors.white,
            fontWeight: "bold",
            fontFamily: "'Vazirmatn', sans-serif",
            "&:before": {
              display: "none",
            },
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "50px",
            fontFamily: "'Vazirmatn', sans-serif",
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            cursor: "pointer",
            direction: "ltr",
            marginBottom: ".5rem",
            backdropFilter: "blur(8px)",
            borderRadius: "12px !important",
            border: "1px solid rgba(72, 68, 74, 0.31)",
            fontWeight: "bold",
            fontFamily: "'Vazirmatn', sans-serif",
            "&:hover": {
              background: commonColors.transparentBlack,
            },
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: "'Vazirmatn', sans-serif",
          },
        },
      },
      MuiGrid: {
        styleOverrides: {
          root: {
            fontFamily: "'Vazirmatn', sans-serif",
          },
        },
      },
    },
    colors: colors,
  });

export default getTheme;