import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box, Link } from '@mui/material';
import Swal from 'sweetalert2';
import axiosInstance from '../services/apiService';
import { Link as RouterLink } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/login', { email, password });
      Swal.fire('Success', 'Logged in successfully!', 'success');
      localStorage.setItem('jwtToken', response.data.jwt_token);
      window.location.href = '/dashboard';
    } catch (error) {
      Swal.fire('Error', 'Invalid email or password', 'error');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Login
          </Button>
        </form>
        <Typography variant="body2" style={{ marginTop: '1rem' }}>
          Don't have an account?{' '}
          <Link component={RouterLink} to="/signup">
            Sign up here
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Login;
