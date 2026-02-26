import React from 'react'
import { Link,NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home } from './Home';
import logo from "../assets/logo2.png"
import { useAuth } from '../context/AuthContext';
// ✅ REMOVED Header import - Home.jsx will provide it

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const takemeout = () => {
    logout();
    navigate('/');
  };

  const inactive = "flex mx-5 my-5 text-gray-600 dark:text-gray-400 font-medium fill-gray-600 dark:fill-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:fill-indigo-600 dark:hover:fill-indigo-400 transition-colors";
  const active = "flex mx-5 my-5 text-indigo-600 dark:text-indigo-400 font-bold fill-indigo-600 dark:fill-indigo-400 border border-t-0 border-b-0 border-l-0 border-r-4 border-indigo-600 dark:border-indigo-400  dark:bg-indigo-900/20 ";
  

  return (
    <>
    {/* ✅ REMOVED HEADER - Home.jsx will provide it */}
    
    <div className='flex h-screen overflow-hidden'>
    <aside className='flex flex-col py-5 px-4 w-[236px] bg-white dark:bg-gray-800 fixed left-0 top-0 h-full z-40 border-r border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/50'>
            <Link to="/" className='flex justify-center items-center hover:opacity-80 transition-opacity' >
            <img src={logo} width={40} />
            <h1 className='text text-4xl font-mono font-bold text-gray-900 dark:text-gray-100'>TaskRise</h1>
            </Link>
            <div className='flex flex-col pt-10 w-60 font-Montserrat text-xl  '>
              <NavLink to='/dashboard' className={({isActive})=>isActive?active:inactive} end><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px" ><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg> Dashboard</NavLink>
              <NavLink to='/dashboard/portal' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm80-80h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm200-190q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM200-200v-560 560Z"/></svg>Task Portal</NavLink>
              <NavLink to='todo' className={({isActive})=>isActive?active:inactive} > <svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px"><path d="M80-160v-160h160v160H80Zm240 0v-160h560v160H320ZM80-400v-160h160v160H80Zm240 0v-160h560v160H320ZM80-640v-160h160v160H80Zm240 0v-160h560v160H320Z"/></svg>  To Do</NavLink>
              <NavLink to='/dashboard/overdue' className={({isActive})=>isActive?active:inactive} > <svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-840h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>  Overdue</NavLink>
              <NavLink to='/dashboard/profile' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px" ><path d="M200-246q54-53 125.5-83.5T480-360q83 0 154.5 30.5T760-246v-514H200v514Zm280-194q58 0 99-41t41-99q0-58-41-99t-99-41q-58 0-99 41t-41 99q0 58 41 99t99 41ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm69-80h422q-44-39-99.5-59.5T480-280q-56 0-112.5 20.5T269-200Zm211-320q-25 0-42.5-17.5T420-580q0-25 17.5-42.5T480-640q25 0 42.5 17.5T540-580q0 25-17.5 42.5T480-520Zm0 17Z"/></svg>Profile</NavLink>
            </div>
            
            <button className='mt-auto p-3 ml-2 font-bold text-red-600 dark:text-red-400 flex gap-2 items-center w-32 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800' onClick={takemeout}> 
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" className="fill-red-600 dark:fill-red-400">
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
              </svg>
              Logout
            </button>

    </aside>

    <main className='flex-1 ml-[230px] h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900'>
        < Outlet />
    </main>
    </div>

    </>
  )
}
