import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import { Card, ListItem, ListItemText, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import Link from '../common/Link'

interface Props {
  tags: string[]
}

export const TagList: React.FC<Props> = ({ tags }: Props) => {
  return (
    <Card>
      <Box m={4}>
        <Typography mb={2} variant="h3">
          <Stack direction="row" spacing={1} alignItems="center">
            <LocalOfferIcon />
            <span>Tags</span>
          </Stack>
        </Typography>
        {tags.slice(0, 20).map((tag) => (
          <ListItem
            key={tag}
            component={Link}
            href={`/tags/${tag}`}
            data-amplify-analytics-on="click"
            data-amplify-analytics-name="click"
            data-amplify-analytics-attrs={`target:TagItem`}
            disableGutters>
            <ListItemText primary={tag} />
          </ListItem>
        ))}
      </Box>
    </Card>
  )
}
