import SearchIcon from '@mui/icons-material/Search'
import { Card, Input, InputAdornment } from '@mui/material'
import { Box } from '@mui/system'
import { useState } from 'react'
import { Constants } from '../../Constants'

export const Search: React.FC = () => {
  const [keyword, setKeyword] = useState('')
  return (
    <Card>
      <Box m={4}>
        <Input
          fullWidth
          placeholder={`search ${Constants.title}`}
          value={keyword}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && keyword !== '') {
              window.open(
                `https://www.google.com/search?q=site:53ningen.com+${keyword}`
              )
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
    </Card>
  )
}
