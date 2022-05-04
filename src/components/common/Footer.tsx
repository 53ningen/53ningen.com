import Typography from '@mui/material/Typography'
import { Constants } from '../../Constants'
import Link from './Link'

export const Footer: React.FC = () => {
  return (
    <Typography m={4} variant="body2" color="text.secondary" align="center">
      <Link
        href="/"
        data-amplify-analytics-on="click"
        data-amplify-analytics-name="click"
        data-amplify-analytics-attrs={`target:FooterTitle`}>
        Copyright © {Constants.title}
      </Link>
    </Typography>
  )
}
