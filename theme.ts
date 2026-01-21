import { createTheme } from "@mui/material/styles";
import { PaletteColorOptions } from "@mui/material";

declare module "@mui/material/styles" {
  interface Palette {
    grey_500?: PaletteColorOptions;
  }
  interface PaletteOptions {
    grey_500?: PaletteColorOptions;
  }
  interface PaletteOptions {
    grey_700?: PaletteColorOptions;
  }
  interface PaletteOptions {
    active?: PaletteColorOptions;
  }
}
const theme = createTheme({
  // direction: "rtl",
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    grey_500: {
      main: "rgb(100,116,139)",
    },
    grey_700: {
      main: "rgb(241 245 249)",
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#ff9800",
    },
    success: {
      main: "#4caf50",
    },
    active: {
      main: "rgb(5 122 85)",
    },
  },

  typography: {
    fontFamily: `"Inter", sans-serif`,
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.5,
    },
  },

  spacing: 8, // Sử dụng spacing(1) = 8px, spacing(2) = 16px, ...

  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },

  shape: {
    borderRadius: 8, // Thiết lập độ bo góc toàn cầu
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: "none",
        },
      },
      defaultProps: {
        disableRipple: true, // Tắt hiệu ứng ripple
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: "16px",
          backgroundColor: "#ffffff",
        },
      },
    },
  },
});

export default theme;
