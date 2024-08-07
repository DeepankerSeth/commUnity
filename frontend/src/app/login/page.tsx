'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signIn } from 'next-auth/react';
import { FaGoogle, FaApple } from 'react-icons/fa';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import Footer from '@/components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-xl shadow-lg">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800">commUnity</h1>
            <h2 className="mt-6 text-2xl font-semibold text-gray-700">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to continue to commUnity</p>
          </div>
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition duration-150 ease-in-out"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition duration-150 ease-in-out"
            />
            <Button 
              type="submit" 
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-150 ease-in-out transform hover:scale-105" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Or continue with</p>
            <div className="mt-4 flex justify-center space-x-6">
              <Button onClick={() => signIn('google')} variant="outline" className="flex items-center justify-center w-16 h-16 rounded-full border border-gray-300 hover:border-gray-400 transition duration-150 ease-in-out">
                <FaGoogle className="text-gray-600 text-xl" />
              </Button>
              <Button onClick={() => signIn('apple')} variant="outline" className="flex items-center justify-center w-16 h-16 rounded-full border border-gray-300 hover:border-gray-400 transition duration-150 ease-in-out">
                <FaApple className="text-gray-600 text-xl" />
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 transition duration-150 ease-in-out">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;