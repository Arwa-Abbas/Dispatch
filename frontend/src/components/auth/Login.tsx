import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { TruckIcon, HomeIcon } from '@heroicons/react/24/outline';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const formRef = React.useRef<HTMLFormElement>(null);

  // Load saved email if remember me was checked and try to read browser-stored credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    const savedRemember = localStorage.getItem('remember_me') === 'true';
    if (savedEmail && savedRemember) {
      setEmail(savedEmail);
      setRememberMe(true);
    }

    const tryFillSavedCredentials = async () => {
      if (typeof window === 'undefined' || !('PasswordCredential' in window) || !navigator.credentials?.get) {
        return;
      }

      try {
        const credential = await navigator.credentials.get({
          password: true,
          mediation: 'optional',
        } as CredentialRequestOptions);

        if (credential && 'password' in credential && 'id' in credential) {
          const passwordCredential = credential as PasswordCredential;
          if (!email && !password) {
            setEmail(passwordCredential.id || '');
            setPassword(passwordCredential.password || '');
            setRememberMe(true);
          }
        }
      } catch (error) {
        console.info('No browser credential available to fill automatically', error);
      }
    };

    void tryFillSavedCredentials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Read values directly from the form DOM to capture browser autofill
    // (React state may not update when the browser autofills fields)
    const form = formRef.current;
    const submittedEmail = (form?.querySelector('input[name="username"]') as HTMLInputElement)?.value || email;
    const submittedPassword = (form?.querySelector('input[name="password"]') as HTMLInputElement)?.value || password;

    try {
      await login(submittedEmail, submittedPassword, rememberMe);

      if (typeof window !== 'undefined' && 'PasswordCredential' in window && submittedEmail && submittedPassword) {
        try {
          const credential = new (window as any).PasswordCredential({
            id: submittedEmail,
            password: submittedPassword,
            name: submittedEmail,
          });
          if (navigator.credentials && 'store' in navigator.credentials) {
            await (navigator.credentials as any).store(credential);
          }
        } catch (credentialError) {
          console.info('Could not store browser credential', credentialError);
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.detail || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Back to Home Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
          >
            <HomeIcon className="h-4 w-4 mr-1" />
            Back to Home
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-600 rounded-xl shadow-lg">
              <TruckIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Dispatch</h1>
          <p className="mt-1 text-gray-600">Sign in to manage your deliveries</p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8">
          <form ref={formRef} className="space-y-6" onSubmit={handleSubmit} method="post" autoComplete="on">
            {error && (
              <div className="rounded-md bg-red-50 p-3">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="username"
                name="username"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="john@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="current-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;