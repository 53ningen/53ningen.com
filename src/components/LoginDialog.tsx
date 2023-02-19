import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'
import { ChallengeName } from 'amazon-cognito-identity-js'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { ErrorBanner } from './ErrorBanner'

interface LoginDialogProps {
  open: boolean
  handleClose: () => void
  onLoggedIn: () => void
}

export const LoginDialog = ({ open, handleClose, onLoggedIn }: LoginDialogProps) => {
  const { login, completeNewPassword } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [challengeName, setChallengeName] = useState<ChallengeName>()
  const [isBusy, setIsBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const handleLogin = async () => {
    setIsBusy(true)
    try {
      if (username.length < 6 || password.length < 6) {
        throw Error('invalid username or password')
      }
      const res = await login(username, password)
      setChallengeName(res)
      setErrorMessage(undefined)
      setUsername('')
      setPassword('')
      if (res === undefined) {
        onLoggedIn()
      }
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        setErrorMessage(e.message)
      }
    }
    setIsBusy(false)
  }
  const handleChangePassword = async () => {
    setIsBusy(true)
    try {
      if (newPassword.length < 6) {
        throw Error('invalid password')
      }
      await completeNewPassword(newPassword)
      setChallengeName(undefined)
      setErrorMessage(undefined)
      setNewPassword('')
      onLoggedIn()
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        setErrorMessage(e.message)
      }
    }
    setIsBusy(false)
  }

  const loginForm = (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await handleLogin()
      }}>
      <DialogTitle>
        {challengeName === 'NEW_PASSWORD_REQUIRED' ? 'Change Password' : 'Authentication'}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          id="id"
          label="Email Address"
          value={username}
          type="email"
          disabled={isBusy}
          fullWidth
          margin="dense"
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          id="password"
          label="Password"
          autoComplete="on"
          value={password}
          type="password"
          disabled={isBusy}
          fullWidth
          margin="dense"
          onChange={(e) => setPassword(e.target.value)}
        />
        <ErrorBanner errorMessage={errorMessage} />
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="primary" onClick={handleClose}>
          CANCEL
        </Button>
        <Button
          type="submit"
          disabled={isBusy}
          variant="contained"
          color="info"
          onClick={handleLogin}>
          LOGIN
        </Button>
      </DialogActions>
    </form>
  )

  const changePasswordForm = (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        await handleChangePassword()
      }}>
      <DialogTitle>Change Password</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          id="new_password"
          label="New Password"
          value={newPassword}
          type="password"
          disabled={isBusy}
          fullWidth
          margin="dense"
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <ErrorBanner errorMessage={errorMessage} />
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="primary" onClick={handleClose}>
          CANCEL
        </Button>
        <Button
          type="submit"
          disabled={isBusy}
          variant="contained"
          color="info"
          onClick={handleChangePassword}>
          SUBMIT
        </Button>
      </DialogActions>
    </form>
  )

  return (
    <Dialog open={open} onClose={handleClose}>
      {challengeName === 'NEW_PASSWORD_REQUIRED' ? changePasswordForm : loginForm}
    </Dialog>
  )
}
