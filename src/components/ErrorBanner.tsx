import { Alert, Button } from '@mui/material'
import { MouseEventHandler } from 'react'

interface ErrorBannerProps {
  errorMessage?: string
  action?: MouseEventHandler
  actionName?: string
}

export const ErrorBanner = ({ errorMessage, action, actionName }: ErrorBannerProps) => {
  return (
    <>
      {errorMessage && (
        <Alert
          severity="error"
          action={
            action &&
            actionName && (
              <Button color="inherit" size="small" onClick={action}>
                {actionName}
              </Button>
            )
          }>
          {errorMessage}
        </Alert>
      )}
    </>
  )
}
