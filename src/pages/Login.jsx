import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import userVideo from "../assets/user.mp4"; // 
import logo from "../assets/logo2.png";

export const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState('faculty');
  
  const { login, loading, isAuthenticated, user } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ User already authenticated:', user.role);
      
      if (user.role === 'hod') {
        navigate('/HodDash');
      } else if (user.role === 'faculty' || user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard'); 
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) setError('');
  };

  const showToast = (message, type = 'info') => {
    switch (type) {
      case 'error':
        toast.error(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
      case 'success':
        toast.success(message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
      case 'info':
        toast.info(message, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
      case 'warning':
        toast.warning(message, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
      default:
        toast(message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any existing errors
    setIsSubmitting(true);
    
    try {
      const email = formData.email?.trim();
      const password = formData.password?.trim();
      
      if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
      }

      // Enhanced validation - support both email and username
      if (email.includes('@')) {
        // If it contains @, validate as email
        if (!email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
          showToast('Please enter a valid email address', 'error');
          return;
        }
      } else {
        // If no @, validate as username
        if (email.length < 3) {
          showToast('Username must be at least 3 characters long', 'error');
          return;
        }
        if (!email.match(/^[a-zA-Z0-9_]+$/)) {
          showToast('Username can only contain letters, numbers, and underscores', 'error');
          return;
        }
      }

      if (password.length < 3) {
        showToast('Password must be at least 3 characters', 'error');
        return;
      }

      console.log('🔐 Login attempt for:', email);
      
      const credentials = {
        email: email.toLowerCase(),
        password: password
      };
      
      console.log('📤 Sending login request...');
      
      const result = await login(credentials);
      
      console.log('📥 Login response:', result);
      
      if (result && result.success && result.user) {
        const userRole = result.user.role;
        const userName = result.user.name;
        
        console.log(`✅ Login successful for ${userName} with role: ${userRole}`);
        
        showToast(`Welcome back, ${userName}!`, 'success');
        
        // Navigate after a short delay to let the toast show
        setTimeout(() => {
          switch (userRole) {
            case 'hod':
              console.log('🎯 Navigating to HOD Dashboard');
              navigate('/HodDash');
              break;
            case 'faculty':
              console.log('🎯 Navigating to Faculty Dashboard');
              navigate('/dashboard');
              break;
            case 'admin':
              console.log('🎯 Navigating to Admin Dashboard');
              navigate('/dashboard');
              break;
            default:
              console.log('🎯 Navigating to Default Dashboard');
              navigate('/dashboard');
              break;
          }
        }, 1500);
      } else {
        throw new Error(result?.message || result?.error || 'Login failed');
      }
    } catch (err) {
      console.error('❌ Login failed:', err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.message.includes('401') || err.message.includes('Invalid')) {
        errorMessage = 'Invalid email/username or password. Please check your credentials.';
      } else if (err.message.includes('403')) {
        errorMessage = 'Account access denied. Please contact administrator.';
      } else if (err.message.includes('500')) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message.includes('Network') || err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  

 return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-slate-600 dark:shadow-gray-900/50 overflow-hidden flex w-full max-w-5xl border border-gray-200 dark:border-gray-700">
          <div className="w-full md:w-1/2 p-8">
            <div className="text-purple-600 dark:text-purple-400 flex items-center font-semibold text-2xl mb-4">
              <img src={logo} width={30} alt="logo" className="mr-2" />TASKRISE
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">Hello, Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-5">Your tasks missed you. Let's rise to the challenge.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  name="email"
                  placeholder="Enter Your Username or Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                  You can use either your username (e.g., AIDS_HOD001) or email address
                </p>
              </div>

            <input
              type="password"
              name="password"
              placeholder="Enter Your Password"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
              className="w-full mb-2 px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-400"
            />

            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-5">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                <span>Remember me</span>
              </label>
              <a className="hover:underline text-purple-600 dark:text-purple-400">Forgot Password?</a>
            </div>

            <div className="mt-2 mb-4">
              <div
                className="relative inline-flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 shadow-sm"
                role="tablist"
                aria-label="Select role"
              >
                <div
                  aria-hidden
                  className={`absolute left-0 top-0 h-full w-1/2 bg-white dark:bg-gray-600 rounded-full shadow transform transition-transform duration-200 ${
                    role === 'hod' ? 'translate-x-full' : 'translate-x-0'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setRole('faculty')}
                  role="tab"
                  aria-selected={role === 'faculty'}
                  className={`relative z-10 flex-1 text-center px-4 py-2 text-sm font-medium transition-colors ${
                    role === 'faculty'
                      ? 'text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  Faculty
                </button>

                <button
                  type="button"
                  onClick={() => setRole('hod')}
                  role="tab"
                  aria-selected={role === 'hod'}
                  className={`relative z-10 flex-1 text-center px-4 py-2 text-sm font-medium transition-colors ${
                    role === 'hod'
                      ? 'text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  HOD
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Signing in as:{' '}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {role === 'hod' ? 'HOD' : 'Faculty'}
                </span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full mt-3 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition duration-150"
              disabled={loading || isSubmitting}
            >
              {(loading || isSubmitting) ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.62 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}

              <span className="font-semibold">
                {(loading || isSubmitting)
                  ? 'Signing in...'
                  : `Sign in as ${role === 'hod' ? 'HOD' : 'Faculty'}`}
              </span>
            </button>
            </form>

           
          </div>

          <div className="w-1/2 bg-gradient-to-br from-purple-400 to-indigo-500 hidden md:flex items-center justify-center p-8 rounded-lg">
            <video width={600} height={100} muted autoPlay loop className="rounded-2xl">
              <source src={userVideo} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;