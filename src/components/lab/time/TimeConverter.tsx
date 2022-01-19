import {
  DateTimeFormatter,
  LocalDate,
  LocalDateTime,
  LocalTime,
  ZonedDateTime,
  ZoneOffset,
} from '@js-joda/core'
import '@js-joda/timezone'
import { FormGroup, Stack, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'

export const TimeConverter = () => {
  const nowString = ZonedDateTime.now().format(
    DateTimeFormatter.ISO_LOCAL_DATE_TIME
  )
  const nowParsed = parse(nowString)
  const [input, setInput] = useState(nowString)
  const [result, setResult] = useState(
    nowParsed ? getResult(nowParsed) : 'ERROR'
  )
  return (
    <Stack m={4} spacing={2}>
      <Typography variant="h2">🌍 Time Zone Converter</Typography>
      <FormGroup>
        <TextField
          fullWidth
          label="DateTime"
          value={input}
          error={!parse(input)}
          helperText="format=yyyy-MM-ddTHH:mm:ss.sss±hh:mm, yyyy-MM-ddTHH:mm:ss.sss, or HH:mm:ss.sss"
          onChange={(e) => {
            const res = parse(e.target.value)
            if (res) {
              setResult(getResult(res))
            }
            setInput(e.target.value)
          }}
        />
      </FormGroup>
      <TextField
        fullWidth
        multiline
        label="Result"
        id="result"
        value={result}
      />
    </Stack>
  )
}

const TIMEZONES: Map<string, ZoneOffset> = new Map([
  ['PST', ZoneOffset.ofHours(-8)],
  ['PDT', ZoneOffset.ofHours(-7)],
  ['EST', ZoneOffset.ofHours(-5)],
  ['EDT', ZoneOffset.ofHours(-4)],
  ['UTC', ZoneOffset.UTC],
  ['JST', ZoneOffset.ofHours(9)],
])

interface ParsedInput {
  type: 'ZonedDateTime' | 'LocalDateTime' | 'LocalTime'
  value: ZonedDateTime | LocalDateTime | LocalTime
}

const parse = (input: string): ParsedInput | undefined => {
  try {
    return { type: 'ZonedDateTime', value: ZonedDateTime.parse(input) }
  } catch {}
  try {
    return { type: 'LocalDateTime', value: LocalDateTime.parse(input) }
  } catch {}
  try {
    return { type: 'LocalTime', value: LocalTime.parse(input) }
  } catch {
    return undefined
  }
}

const getConvertedDateTime = (zdt: ZonedDateTime, timeOnly?: boolean) => {
  return Array.from(TIMEZONES.entries())
    .map(
      ([timezone, offset]) =>
        `${timezone} ${zdt
          .withZoneSameInstant(offset)
          .format(
            timeOnly
              ? DateTimeFormatter.ISO_LOCAL_TIME
              : DateTimeFormatter.ISO_LOCAL_DATE_TIME
          )}`
    )
    .join('\n')
}

const getResult = (input: ParsedInput): string => {
  switch (input.type) {
    case 'ZonedDateTime':
      const zdt = input.value as ZonedDateTime
      return getConvertedDateTime(zdt)
    case 'LocalDateTime':
      const ldt = input.value as LocalDateTime
      const pstBasedResult = getConvertedDateTime(
        ldt.atZone(ZoneOffset.ofHours(-8))
      )
      const utcBasedResult = getConvertedDateTime(
        ldt.atZone(ZoneOffset.ofHours(0))
      )
      const jstBasedResult = getConvertedDateTime(
        ldt.atZone(ZoneOffset.ofHours(+9))
      )
      return (
        `=== PST BASED ===\n${pstBasedResult}\n\n` +
        `=== UTC BASED ===\n${utcBasedResult}\n\n` +
        `=== JST BASED ===\n${jstBasedResult}`
      )
    case 'LocalTime':
      const lt = input.value as LocalTime
      const dt = lt.atDate(LocalDate.of(1970, 1, 1))
      const pstBased = getConvertedDateTime(
        dt.atZone(ZoneOffset.ofHours(-8)),
        true
      )
      const utcBased = getConvertedDateTime(
        dt.atZone(ZoneOffset.ofHours(0)),
        true
      )
      const jstBased = getConvertedDateTime(
        dt.atZone(ZoneOffset.ofHours(+9)),
        true
      )
      return (
        `=== PST BASED ===\n${pstBased}\n\n` +
        `=== UTC BASED ===\n${utcBased}\n\n` +
        `=== JST BASED ===\n${jstBased}`
      )
  }
}
