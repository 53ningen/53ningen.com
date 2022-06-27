import { red } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    text: {
      primary: '#333',
    },
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
    fontSize: 14,
    fontWeightRegular: 400,
    h1: {
      fontSize: 24,
      fontWeight: 800,
      overflowWrap: 'anywhere',
    },
    h2: {
      fontSize: 24,
      fontWeight: 750,
      overflowWrap: 'anywhere',
    },
    h3: {
      fontSize: 22,
      fontWeight: 700,
      overflowWrap: 'anywhere',
    },
    h4: {
      fontSize: 20,
      fontWeight: 650,
      overflowWrap: 'anywhere',
    },
    h5: {
      fontSize: 18,
      fontWeight: 600,
      overflowWrap: 'anywhere',
    },
    h6: {
      fontSize: 16,
      fontWeight: 550,
      overflowWrap: 'anywhere',
    },
    body1: {
      fontSize: 14,
      overflowWrap: 'break-word',
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
    },
    MuiChip: {
      defaultProps: {
        style: {
          cursor: 'pointer',
        },
      },
    },
  },
})

export default theme
