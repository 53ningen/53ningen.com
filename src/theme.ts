import { grey, red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'
import { Roboto } from '@next/font/google'

export const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  fallback: ['Helvetica', 'Arial', 'sans-serif'],
})

// Create a theme instance.
const theme = createTheme({
  // https://mycolor.space/?hex=%2324292F&sub=1
  palette: {
    primary: {
      main: '#24292f',
    },
    secondary: {
      main: '#2C4054',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#F1FAFF',
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
    fontSize: 14,
    fontWeightMedium: 400,
    h1: {
      fontSize: 21,
      fontWeight: 700,
    },
    h2: {
      fontSize: 20,
      fontWeight: 700,
    },
    h3: {
      fontSize: 18,
      fontWeight: 700,
    },
    h4: {
      fontSize: 17,
      fontWeight: 700,
    },
    h5: {
      fontSize: 16,
      fontWeight: 700,
    },
    h6: {
      fontSize: 15,
      fontWeight: 700,
    },
    body1: {
      fontSize: 14,
    },
    body2: {
      fontSize: 12,
    },
    caption: {
      fontSize: 12,
      color: grey[500],
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiLink: {
      defaultProps: {
        underline: 'none',
        color: '#009AFA',
      },
    },
    MuiAppBar: {
      defaultProps: {
        color: 'primary',
        elevation: 0,
        sx: {
          height: 60,
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
    },
  },
})

export default theme
