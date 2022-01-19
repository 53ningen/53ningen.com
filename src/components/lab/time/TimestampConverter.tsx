import { Stack, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'

const timestampIsValid = (input: string) => {
  const parsed = Number.parseInt(input)
  const l = String(parsed).length
  return Number.isSafeInteger(parsed) && (l === 10 || l === 13)
}

const timestampToDateTime = (input: string) => {
  if (timestampIsValid(input)) {
    const timestamp = Number.parseInt(input)
    switch (input.length) {
      case 10:
        return new Date(timestamp * 1000).toISOString()
      case 13:
        return new Date(timestamp).toISOString()
    }
  }
  return undefined
}

export const TimestampConverter = () => {
  const now = Date.now()
  const [timestamp, setTimestamp] = useState(now.toString())
  const [datetime, setDateTime] = useState(new Date(now).toISOString())
  return (
    <Stack m={4} spacing={2}>
      <Typography variant="h2">🖥 Timestamp Converter</Typography>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Unix Time Stamp"
          value={timestamp}
          fullWidth
          error={!timestampIsValid(timestamp)}
          type="number"
          onChange={(e) => {
            const datetime = timestampToDateTime(e.target.value)
            if (datetime) {
              setDateTime(datetime)
            }
            setTimestamp(e.target.value)
          }}
        />
        <TextField label="Date" value={datetime} fullWidth />
      </Stack>
    </Stack>
  )
}
