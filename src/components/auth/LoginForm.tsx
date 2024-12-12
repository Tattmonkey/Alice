import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const { signIn, signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await signIn(data.email, data.password);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleSignIn = useCallback(async () => {
    if (googleLoading) return;

    try {
      setGoogleLoading(true);
      await signInWithGoogle();
      toast.success('Successfully signed in with Google');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error.code === 'auth/popup-blocked') {
        toast.error(
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Popup was blocked</span>
            </div>
            <p className="text-sm">Please allow popups for this site and try again.</p>
          </div>,
          { duration: 5000 }
        );
      } else if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Failed to sign in with Google');
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLoading, signInWithGoogle]);

  return (
    <div className="max-w-md w-full space-y-8">
      {/* Rest of the component remains the same */}
    </div>
  );
}