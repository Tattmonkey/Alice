import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth, signInWithGoogle } from '../../config/firebase';
import { getRedirectResult } from 'firebase/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { FcGoogle } from 'react-icons/fc';
import { Loader2 } from 'lucide-react';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for redirect result when component mounts
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Redirect successful:', result.user.email);
          navigate('/dashboard');
        }
      } catch (error: any) {
        console.error('Redirect error:', error);
        setError(error?.message || 'Failed to sign in with Google');
      }
    };

    checkRedirect();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error?.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await signInWithGoogle();
      if (result) { // If we got a result (not redirect)
        navigate('/dashboard');
      }
      // If no result, we're doing redirect and page will reload
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setError(error?.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className="mt-1 block w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                className="mt-1 block w-full"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Sign in'
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <FcGoogle className="h-5 w-5" />
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Sign in with Google'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginForm;