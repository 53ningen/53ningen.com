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
      fontWeight: 800,
      overflowWrap: 'anywhere',
    },
    h3: {
      fontSize: 22,
      fontWeight: 500,
      overflowWrap: 'anywhere',
    },
    h4: {
      fontSize: 20,
      fontWeight: 400,
      overflowWrap: 'anywhere',
    },
    h5: {
      fontSize: 18,
      fontWeight: 400,
      overflowWrap: 'anywhere',
    },
    h6: {
      fontSize: 16,
      fontWeight: 400,
      overflowWrap: 'anywhere',
    },
    body1: {
      fontSize: 14,
      overflowWrap: 'anywhere',
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
