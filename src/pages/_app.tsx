import Analytics from '@aws-amplify/analytics'
import { CacheProvider, EmotionCache } from '@emotion/react'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { Box } from '@mui/system'
import Amplify from 'aws-amplify'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import * as React from 'react'
import 'typeface-roboto'
import awsconfig from '../aws-exports'
import { Footer } from '../components/common/Footer'
import { Constants } from '../Constants'
import createEmotionCache from '../createEmotionCache'
import * as gtag from '../lib/gtag'
import theme from '../theme'
import './styles.css'

// Amplify
Amplify.configure(awsconfig)

if (process.env.NEXT_PUBLIC_TARGET_ENV === 'prod') {
  Analytics.autoTrack('pageView', {
    enable: true,
    type: 'SPA',
  })
  Analytics.autoTrack('event', {
    enable: true,
    events: ['click'],
    selectorPrefix: 'data-amplify-analytics-',
    attributes: () => {
      return {
        pathname: window.location.pathname,
      }
    },
  })
}

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

export default function MyApp(props: MyAppProps) {
  // Google Analytics
  const router = useRouter()
  React.useEffect(() => {
    const handleRouteChange = (url: URL) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  const { title } = Constants
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>{title}</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Container maxWidth="lg" disableGutters>
          <Box margin="auto" mt={4}>
            <Component {...pageProps} />
            <Footer />
          </Box>
        </Container>
      </ThemeProvider>
    </CacheProvider>
  )
}
