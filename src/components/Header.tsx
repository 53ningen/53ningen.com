import { Const } from '@/const'
import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material'
import Link from './Link'
import { LoginButton } from './LoginButton'

export const Header = () => {
  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth="lg" disableGutters>
          <Toolbar>
            <Box alignItems="center" sx={{ flexGrow: 1 }} display="flex">
              <IconButton href="/" sx={{ pr: 2 }}>
                <Avatar src="/favicon192x192.jpg" sx={{ width: 32, height: 32 }} />
              </IconButton>
              <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
                <Link href="/" color="inherit">
                  {Const.siteTitle}
                </Link>
              </Typography>
              <LoginButton />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
    </>
  )
}
