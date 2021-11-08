import { red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#f8f8f8',
    },
  },
  typography: {
    h1: {
      fontSize: '3rem',
    },
    h2: {
      fontSize: '2rem',
    },
    h3: {
      fontSize: '1.8rem',
    },
    h4: {
      fontSize: '1.5rem',
    },
  },
  components: {
    MuiLink: {
      styleOverrides: {
        underlineAlways: 'none',
      },
    },
  },
})

export default theme
