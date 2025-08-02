import React from 'react'
import { Link,NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home } from './Home';
import logo from "../assets/logo.png"


export const Dashboard = () => {
  const navigate = useNavigate();
  const takemeout = () => {
    navigate('/');
  }

  const inactive = "flex mx-5 my-5 text-gray-300 font-medium fill-gray-300 ";
  const active = "flex mx-5 my-5 text-indigo-500 font-bold fill-indigo-700 border border-t-0 border-b-0 border-l-0 border-r-3 ";
  

  return (
    <>
    <div className='flex'>
    <aside className='flex flex-col py-5  px-4 w-[230px] bg-white shadow-md shadow-black '>
            <Link to="/" className='flex justify-center items-center' >
            <img src={logo} width={60} />
            <h1 className='text text-4xl font-mono font-bold'>TaskRise</h1>
            </Link>
            <div className='flex flex-col pt-20 w-80 font-Montserrat text-xl  '>
              <NavLink to='/dashboard' className={({isActive})=>isActive?active:inactive} end><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px" ><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg> Dashboard</NavLink>
              <NavLink to='/dashboard/portal' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px" ><path d="M549-120 280-400v-80h140q53 0 91.5-34.5T558-600H240v-80h306q-17-35-50.5-57.5T420-760H240v-80h480v80H590q14 17 25 37t17 43h88v80h-81q-8 85-70 142.5T420-400h-29l269 280H549Z"/></svg>Task Portal</NavLink>
              <NavLink to='/dashboard/allocate' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px" ><path d="M640-160v-280h160v280H640Zm-240 0v-640h160v640H400Zm-240 0v-440h160v440H160Z"/></svg>Task Allocate</NavLink>
              <NavLink to='todo' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px"><path d="M80-160v-160h160v160H80Zm240 0v-160h560v160H320ZM80-400v-160h160v160H80Zm240 0v-160h560v160H320ZM80-640v-160h160v160H80Zm240 0v-160h560v160H320Z"/></svg> To Do</NavLink>
              <NavLink to='/dashboard/profile' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px" ><path d="M200-246q54-53 125.5-83.5T480-360q83 0 154.5 30.5T760-246v-514H200v514Zm280-194q58 0 99-41t41-99q0-58-41-99t-99-41q-58 0-99 41t-41 99q0 58 41 99t99 41ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm69-80h422q-44-39-99.5-59.5T480-280q-56 0-112.5 20.5T269-200Zm211-320q-25 0-42.5-17.5T420-580q0-25 17.5-42.5T480-640q25 0 42.5 17.5T540-580q0 25-17.5 42.5T480-520Zm0 17Z"/></svg>Profile</NavLink>
            </div>
            
            <button className='mt-auto p-2 ml-2 font-bold text-red-500 flex gap-1  w-28 rounded-lg hover:bg-red-200 ' onClick={takemeout}> <svg xmlns="http://www.w3.org/2000/svg" height="24px" fill='#d6040b' viewBox="0 -960 960 960" width="24px" ><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></svg>Logout</button>


    </aside>

    <main className='w-full min-h-screen'>
        < Outlet />
    </main>
    </div>

    </>
  )
}
