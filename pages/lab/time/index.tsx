import '@js-joda/timezone'
import { Box, Card, Stack, Toolbar, Typography } from '@mui/material'
import React from 'react'
import { Meta } from '../../../src/components/common/Meta'
import { ShareButtons } from '../../../src/components/common/ShareButtons'
import { TimeConverter } from '../../../src/components/lab/time/TimeConverter'
import { TimestampConverter } from '../../../src/components/lab/time/TimestampConverter'

interface Props {}

export default function Time(_: Props) {
  const title = '🕐 Time Related Tools'
  const description = 'Time Difference Calculator & Timestamp converter'
  return (
    <>
      <Toolbar sx={{ justifyContent: 'space-evenly' }}>
        <Typography variant="h1" align="center" noWrap>
          {title}
        </Typography>
      </Toolbar>
      <Meta title={title} description={description} />
      <Box pt={4}>
        <Card>
          <TimeConverter />
          <TimestampConverter />
          <Stack p={4} direction="row" spacing={1}>
            <ShareButtons
              url={`https://53ningen.com/lab/time`}
              title={title}
              size={36}
              via="gomi_ningen"
            />
          </Stack>
        </Card>
      </Box>
    </>
  )
}
