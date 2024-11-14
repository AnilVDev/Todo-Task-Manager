import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import AppTheme from './shared-theme/AppTheme';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signup } from '../Slice/authentication';
import { CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  [theme.breakpoints.up('sm')]: {
    width: '450px',
  },
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignUpContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignUp(props) {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');
  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState('');
  const [name, setName] = useState('')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { error, loading, success, message } = useSelector( (state) => state.authentication)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleNameChange = e =>{
    const value = e.target.value
    setName(value)
    const nameRegex = /^[A-Za-z]+$/;

    if (value.trim().length < 1) {
        setNameError(true)
        setNameErrorMessage('Name is required')
    } else if (!nameRegex.test(value)) {
        setNameError(true);
        setNameErrorMessage('Name must only contain letters and no spaces');
    } else {
        setNameError(false)
        setNameErrorMessage('')
    }
  }

  const handleEmailChange = (event) => {
    const value = event.target.value;
    setEmail(value);
    if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }
  };
  
  const handlePasswordChange = (event) => {
    const value = event.target.value;
    setPassword(value);
    if (value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }
  };

  const handleConfirmPasswordChange = (event) => {
    const value = event.target.value;
    setConfirmPassword(value);
    if (value.length < 6) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage('Password must be at least 6 characters long.');
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage('');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (nameError || emailError || passwordError || confirmPasswordError) {
      return;
    }

    if (password !== confirmPassword) {
        setPassword('');
        setConfirmPassword('')
        setConfirmPasswordError(true)
        setConfirmPasswordErrorMessage('Passwords do not match.')
        return
    } else {
        setConfirmPasswordError(false)
        setConfirmPasswordErrorMessage('') 
    }
    const data = {
        username:name,
        email, 
        password
    }
    dispatch(signup(data)) 

    console.log(data);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  useEffect(() => {
    if (error) {
        toast.error(error);
        dispatch({ type: 'authentication/clearError' });
    }
    if (message) {
      toast.success(message);
      dispatch({ type: 'authentication/clearMessage' });
    }
    if (success) {
        navigate('/')
    }
  }, [message, error, success, navigate]);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignUpContainer direction="column" justifyContent="space-between">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <FormControl>
              <FormLabel htmlFor="name">Username</FormLabel>
              <TextField
                autoComplete="name"
                name="name"
                required
                fullWidth
                placeholder="Jon Snow"
                value = {name}
                error={nameError}
                helperText={nameErrorMessage}
                color={nameError ? 'error' : 'primary'}
                onChange={handleNameChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                required
                fullWidth
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
                value = {email}
                error={emailError}
                helperText={emailErrorMessage}
                color={passwordError ? 'error' : 'primary'}
                onChange={handleEmailChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
                placeholder="••••••"
                type="password"
                autoComplete="new-password"
                variant="outlined"
                value = {password}
                error={passwordError}
                helperText={passwordErrorMessage}
                color={passwordError ? 'error' : 'primary'}
                onChange={handlePasswordChange}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Confirm Password</FormLabel>
              <TextField
                required
                fullWidth
                name="confirm"
                placeholder="••••••"
                type="password"
                autoComplete="new-password"
                variant="outlined"
                value = {confirmPassword}
                error={confirmPasswordError}
                helperText={confirmPasswordErrorMessage}
                color={confirmPasswordError ? 'error' : 'primary'}
                onChange={handleConfirmPasswordChange}
              />
            </FormControl>            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={nameError || emailError || passwordError || confirmPasswordError || !name || !email || !password || !confirmPassword}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            <Typography sx={{ textAlign: 'center' }}>
              Already have an account?{' '}
              <span>
                <Link
                  href="/"
                  variant="body2"
                  sx={{ alignSelf: 'center' }}
                >
                  Sign in
                </Link>
              </span>
            </Typography>
          </Box>
        </Card>
      </SignUpContainer>
    </AppTheme>
  );
}