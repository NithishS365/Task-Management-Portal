import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import user from "../assets/user.mp4";
import { ToastContainer, toast } from 'react-toastify';
import logo from "../assets/logo2.png"

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const userData = JSON.parse(localStorage.getItem('users')) || {};
    const user = userData[email];

    if (user && user.password === password) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      toast.error("Invalid credentials!");
    }
    localStorage.setItem('currentUser', email);

  };

  return (
    <>
      <ToastContainer />
      <div className="flex justify-center items-center mt-20 bg-white">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-500 overflow-hidden flex w-full max-w-5xl">
          <div className="w-full md:w-1/2 p-10">
          
            <div className="text-purple-600 flex font-semibold text-2xl mb-6"><img src={logo} width={30} />TASKRISE</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Hello, Welcome Back</h2>
            <p className="text-gray-500 mb-6">Your tasks missed you. Let’s rise to the challenge.</p>

            <input
              type="email"
              placeholder="Enter Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <input
              type="password"
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-2 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />

            <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox text-purple-600" />
                <span>Remember me</span>
              </label>
              <a className="hover:underline">Forgot Password?</a>
            </div>

            <button
              className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition"
              onClick={handleLogin}
            >
              Sign In
            </button>

            <p className="text-sm text-center text-gray-500 mt-6">
              Don’t have an account?
              <a onClick={() => navigate('/Register')} className="text-purple-600 hover:underline">Sign Up</a>
            </p>
          </div>

          <div className="w-1/2 bg-gradient-to-br from-purple-400 to-indigo-500 hidden md:flex items-center justify-center p-10 rounded-lg">
            <video width={600} height={100} autoPlay loop className='rounded-2xl'>
              <source src={user} type='video/mp4' />
            </video>
          </div>
        </div>
      </div>
    </>
  );
};
