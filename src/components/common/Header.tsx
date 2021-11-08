import { Divider, Stack, Toolbar, Typography } from '@mui/material'
import Link from './Link'

const title = '53ningen.com'
const subtitle = `@gomi_ningen's Website`

export const Header: React.FC = () => {
  const navItems = [
    { label: 'HOME', path: '/' },
    { label: 'ABOUT', path: 'https://p.53ningen.com/' },
    { label: 'GITHUB', path: 'https://github.com/53ningen' },
    { label: 'TWITTER', path: 'https://twitter.com/gomi_ningen' },
    { label: 'CIRCLE', path: 'https://circle.53ningen.com/' },
  ]
  return (
    <>
      <Toolbar sx={{ justifyContent: 'space-evenly' }}>
        <Typography variant="h1" align="center" noWrap>
          {title}
        </Typography>
      </Toolbar>
      <Typography variant="subtitle1" align="center">
        {subtitle}
      </Typography>
      <Toolbar
        component="nav"
        variant="dense"
        sx={{ justifyContent: 'center', overflowX: 'auto' }}>
        <Stack
          direction="row"
          divider={<Divider orientation="vertical" flexItem />}
          spacing={2}>
          {navItems.map((i) => (
            <Link key={i.label} href={i.path}>
              {i.label}
            </Link>
          ))}
        </Stack>
      </Toolbar>
    </>
  )
}
