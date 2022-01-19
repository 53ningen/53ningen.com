import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService'
import { Card, ListItem, ListItemText, Stack, Typography } from '@mui/material'
import { Box } from '@mui/system'
import Link from '../common/Link'

const items = [{ id: 'time', name: 'Time Related Tools' }]

export const LabList: React.FC = () => {
  return (
    <Card>
      <Box m={4}>
        <Typography mb={2} variant="h3">
          <Stack direction="row" spacing={1} alignItems="center">
            <HomeRepairServiceIcon />
            <span>Lab</span>
          </Stack>
        </Typography>
        {items.map((item) => (
          <ListItem
            key={item.id}
            component={Link}
            href={`/lab/${item.id}`}
            data-amplify-analytics-on="click"
            data-amplify-analytics-name="click"
            data-amplify-analytics-attrs={`target:LabItem`}
            disableGutters>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </Box>
    </Card>
  )
}
