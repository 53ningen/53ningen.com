import ArchiveIcon from '@mui/icons-material/Archive'
import { Card, ListItem, ListItemText, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import Link from '../common/Link'

interface Props {
  dates: string[]
}

export const Archives: React.FC<Props> = ({ dates }: Props) => {
  return (
    <Card>
      <Box m={4}>
        <Typography mb={2} variant="h3">
          <Stack direction="row" spacing={1} alignItems="center">
            <ArchiveIcon />
            <span>Archives</span>
          </Stack>
        </Typography>
        {dates.map((date) => (
          <ListItem
            key={date}
            component={Link}
            href={`/archives/${date}`}
            data-amplify-analytics-on="click"
            data-amplify-analytics-name="click"
            data-amplify-analytics-attrs={`target:ArchiveItem`}
            disableGutters>
            <ListItemText primary={date} />
          </ListItem>
        ))}
      </Box>
    </Card>
  )
}
