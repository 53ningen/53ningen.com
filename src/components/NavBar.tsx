import { Box, Tab, Tabs } from '@mui/material'
import { useRouter } from 'next/router'

interface Props {
  currentTab: 'Blog' | 'Docs' | 'Profile'
}

export const NavBar = ({ currentTab }: Props) => {
  const router = useRouter()
  const onChangeTab = (event: any, v: any) => {
    switch (v) {
      case 0:
        router.push('/')
        break
      case 1:
        router.push('/docs')
        break
      case 2:
        window.open('https://p.53ningen.com')
        break
    }
  }
  return (
    <Box px={{ xs: 2, sm: 2, md: 4 }} pt={2}>
      <Tabs
        value={tabToIndex(currentTab)}
        onChange={onChangeTab}
        centered
        scrollButtons="auto">
        <Tab label="Blog" id="blogs" />
        <Tab label="Docs" id="documents" />
        <Tab label="Profile" id="profile" />
      </Tabs>
    </Box>
  )
}

const tabToIndex = (tab: 'Blog' | 'Docs' | 'Profile') => {
  switch (tab) {
    case 'Blog':
      return 0
    case 'Docs':
      return 1
    case 'Profile':
      return 2
  }
}
