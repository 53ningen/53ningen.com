import { Const } from '@/const'
import SearchIcon from '@mui/icons-material/Search'
import { Box, InputAdornment, OutlinedInput } from '@mui/material'
import { useState } from 'react'

export const Search = () => {
  const [keyword, setKeyword] = useState('')
  return (
    <Box m={4}>
      <OutlinedInput
        fullWidth
        placeholder={`search ${Const.siteTitle}`}
        value={keyword}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && keyword !== '') {
            window.open(`https://www.google.com/search?q=site:53ningen.com+${keyword}`)
          }
        }}
        onChange={(e) => {
          setKeyword(e.target.value)
        }}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
      />
    </Box>
  )
}
