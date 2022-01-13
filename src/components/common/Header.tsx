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
        <TitleLink
          href="/"
          style={{ textDecoration: 'none' }}
          data-amplify-analytics-on="click"
          data-amplify-analytics-name="click"
          data-amplify-analytics-attrs={`target:HeaderTitle`}>
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
          <Link
            href="/"
            data-amplify-analytics-on="click"
            data-amplify-analytics-name="click"
            data-amplify-analytics-attrs={`target:HeaderHome`}>
            <FaHome size="30" />
          </Link>
          <Link
            href="https://p.53ningen.com/"
            data-amplify-analytics-on="click"
            data-amplify-analytics-name="click"
            data-amplify-analytics-attrs={`target:HeaderProfile`}>
            <FaIdCard size="30" />
          </Link>
          <Link
            href="https://github.com/53ningen"
            data-amplify-analytics-on="click"
            data-amplify-analytics-name="click"
            data-amplify-analytics-attrs={`target:HeaderGitHub`}>
            <FaGithub size="30" />
          </Link>
          <Link
            href="https://twitter.com/gomi_ningen"
            data-amplify-analytics-on="click"
            data-amplify-analytics-name="click"
            data-amplify-analytics-attrs={`target:HeaderTwitter`}>
            <FaTwitter size="30" />
          </Link>
          <Link
            href="https://circle.53ningen.com/"
            data-amplify-analytics-on="click"
            data-amplify-analytics-name="click"
            data-amplify-analytics-attrs={`target:HeaderCircle`}>
            <FaEdit size="30" />
          </Link>
        </Stack>
      </Toolbar>
    </>
  )
}
