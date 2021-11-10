import { Stack, Toolbar, Typography } from '@mui/material'
import { FaEdit, FaGithub, FaHome, FaIdCard, FaTwitter } from 'react-icons/fa'
import Link from './Link'

const title = '53ningen.com'
const subtitle = `@gomi_ningen's Website`

export const Header: React.FC = () => {
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
        <Stack direction="row" spacing={4}>
          <Link href="/">
            <FaHome size="30" />
          </Link>
          <Link href="https://p.53ningen.com/">
            <FaIdCard size="30" />
          </Link>
          <Link href="https://github.com/53ningen">
            <FaGithub size="30" />
          </Link>
          <Link href="https://twitter.com/gomi_ningen">
            <FaTwitter size="30" />
          </Link>
          <Link href="https://circle.53ningen.com/">
            <FaEdit size="30" />
          </Link>
        </Stack>
      </Toolbar>
    </>
  )
}
