import React, { useState } from 'react';
import user1 from '../assets/user1.mp4';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import logo from "../assets/logo2.png"

export const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      toast.warning("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.warning("Passwords do not match.");
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || {};

    if (users[email]) {
      toast.info("User already exists. Please login.");
      return;
    }

    users[email] = {
      fullName,
      email,
      password,
    };

    localStorage.setItem('users', JSON.stringify(users));
    toast.info("Registration successful!");
    navigate('/login');
  };

  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
       <ToastContainer />
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-slate-900/50 overflow-hidden flex w-full max-w-5xl">
        <div className="w-full md:w-1/2 p-10">
          <div className="text-purple-600 dark:text-purple-500 font-semibold text-xl flex mb-6"><img src={logo} width={30} />TASKRISE</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create an Account</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start your journey with us</p>

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
          />
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-6 px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 dark:focus:ring-purple-500"
          />

          <button
            className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition"
            onClick={handleSignUp}
          >
            Sign Up
          </button>

          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?
            <a onClick={() => navigate('/login')} className="text-purple-600 dark:text-purple-500 hover:underline cursor-pointer"> Login</a>
          </p>
        </div>

        <div className="w-1/2 bg-gradient-to-br from-purple-400 to-indigo-500 hidden md:flex items-center justify-center p-5">
          <video width={600} height={100} autoPlay loop className='rounded-2xl'>
            <source src={user1} type='video/mp4' />
          </video>
        </div>
      </div>
    </div>
  );
};
