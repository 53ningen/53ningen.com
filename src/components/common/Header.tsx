import { Stack, Toolbar, Typography } from '@mui/material'
import { styled } from '@mui/system'
import { FaEdit, FaGithub, FaHome, FaIdCard, FaTwitter } from 'react-icons/fa'
import Link from './Link'

const title = '53ningen.com'
const subtitle = `@gomi_ningen's Website`

export const Header: React.FC = () => {
  const TitleLink = styled(Link)(
    ({ theme }) => `
    color: ${theme.palette.text.primary};
  `
  )

  return (
    <>
      <Toolbar sx={{ justifyContent: 'space-evenly' }}>
        <TitleLink href="/" style={{ textDecoration: 'none' }}>
          <Typography variant="h1" align="center" noWrap>
            {title}
          </Typography>
        </TitleLink>
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
