import { Const } from '@/const'
import {
  AppBar,
  Avatar,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import Link from './Link'

export const Header = () => {
  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth="lg" disableGutters>
          <Toolbar>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton href="/">
                <Avatar src="/favicon192x192.jpg" sx={{ width: 32, height: 32 }} />
              </IconButton>
              <Typography variant="h3" component="h1">
                <Link href="/" color="inherit">
                  {Const.siteTitle}
                </Link>
              </Typography>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
    </>
  )
}
