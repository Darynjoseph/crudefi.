import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthApi } from '../../lib/hooks/useAuthApi';
import loginImage from '../../assets/door-illustration.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { login, loading, error, clearError } = useAuthApi();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear error when email or password changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password, error, clearError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({ email, password });
      // Navigation will be handled by the useEffect above
    } catch (err) {
      // Error is handled by useAuthApi hook
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#355c66] to-[#6e8d93]">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left: Illustration */}
        <div className="md:w-1/2 bg-[#0c4f5f] relative">
          <img
            src={loginImage}
            alt="Welcome"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Login Form */}
        <div className="md:w-1/2 p-8 sm:p-12 bg-[#fdbf2d] flex flex-col justify-center">
          <div className="bg-white rounded-xl shadow-md px-8 py-6 w-full max-w-sm mx-auto">
            <div className="flex justify-between items-center mb-4 text-sm text-gray-500 font-semibold">
              <span className="text-[#d6b830]">ALREADY MEMBERS</span>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                Need help?
              </a>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#11393b] text-white py-2 rounded-md hover:bg-[#0f2f30] transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'SIGN IN'
                )}
              </button>
            </form>
          </div>

          {/* Bottom Link */}
          <div className="mt-6 text-center text-sm text-black font-medium">
            Don’t have an account yet?{' '}
            <a href="#" className="text-[#11393b] hover:underline">
              Create an account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
