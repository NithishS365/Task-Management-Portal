import React from 'react'
import { Link,NavLink, Outlet, useNavigate } from 'react-router-dom'
import logo from "../assets/logo2.png"
import { useAuth } from '../context/AuthContext';



export const HodDash = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const takemeout = () => {
    logout();
    navigate('/');
  };


  const inactive = "flex mx-5 my-5 text-gray-600 dark:text-gray-400 font-medium fill-gray-600 dark:fill-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:fill-indigo-600 dark:hover:fill-indigo-400 transition-colors";
  const active = "flex mx-5 my-5 text-indigo-600 dark:text-indigo-400 font-bold fill-indigo-600 dark:fill-indigo-400 border border-t-0 border-b-0 border-l-0 border-r-4 border-indigo-600 dark:border-indigo-400  ";
  

  return (
    <>
    <div className='flex h-screen overflow-hidden'>
    <aside className='flex flex-col py-5 px-2 w-[245px] bg-white dark:bg-gray-800 fixed left-0 top-0 h-full z-40 border-r border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-gray-900/50'>
            <Link to="/" className='flex justify-center items-center hover:opacity-80 transition-opacity' >
            <img src={logo} width={40} />
            <h1 className='text text-4xl font-mono font-bold text-gray-900 dark:text-gray-100'>TaskRise</h1>
            </Link>
            <div className='flex flex-col pt-14  w-64 font-Montserrat text-xl  '>
              <NavLink to='/HodDash' className={({isActive})=>isActive?active:inactive} end><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px" ><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg> Dashboard</NavLink>
              <NavLink to='/HodDash/allocate' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v268q-19-9-39-15.5t-41-9.5v-243H200v560h242q3 22 9.5 42t15.5 38H200Zm0-120v40-560 243-3 280Zm80-40h163q3-21 9.5-41t14.5-39H280v80Zm0-160h244q32-30 71.5-50t84.5-27v-3H280v80Zm0-160h400v-80H280v80Zm200-190q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790ZM720-40q-83 0-141.5-58.5T520-240q0-83 58.5-141.5T720-440q83 0 141.5 58.5T920-240q0 83-58.5 141.5T720-40Zm-20-80h40v-100h100v-40H740v-100h-40v100H600v40h100v100Z"/></svg>Task Allocate</NavLink>
              <NavLink to='/HodDash/approval' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px"><path d="M655-200 513-342l56-56 85 85 170-170 56 57-225 226Zm0-320L513-662l56-56 85 85 170-170 56 57-225 226ZM80-280v-80h360v80H80Zm0-320v-80h360v80H80Z"/></svg>Task Approval</NavLink>
              <NavLink to='/HodDash/allTasks' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px"><path d="M655-200 513-342l56-56 85 85 170-170 56 57-225 226Zm0-320L513-662l56-56 85 85 170-170 56 57-225 226ZM80-280v-80h360v80H80Zm0-320v-80h360v80H80Z"/></svg>All Tasks</NavLink>
              <NavLink to='/HodDash/overdue' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px"><path d="M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177q0-104 73-177t177-73q104 0 177 73t73 177Zm-40 0q0-83-58.5-141.5T480-530q-83 0-141.5 58.5T280-330q0 83 58.5 141.5T480-130q83 0 141.5-58.5T680-330ZM440-180v-140l-102-102 56-56 86 86v212h-40Zm320-540L600-880l56-56 160 160-56 56Z"/></svg>Overdue Tasks</NavLink>
              <NavLink to='/HodDash/faculty_overview' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="20px"><path d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z"/></svg>Faculty Overview</NavLink>           
              <NavLink to='/HodDash/profileHod' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px" ><path d="M200-246q54-53 125.5-83.5T480-360q83 0 154.5 30.5T760-246v-514H200v514Zm280-194q58 0 99-41t41-99q0-58-41-99t-99-41q-58 0-99 41t-41 99q0 58 41 99t99 41ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm69-80h422q-44-39-99.5-59.5T480-280q-56 0-112.5 20.5T269-200Zm211-320q-25 0-42.5-17.5T420-580q0-25 17.5-42.5T480-640q25 0 42.5 17.5T540-580q0 25-17.5 42.5T480-520Zm0 17Z"/></svg>Profile</NavLink>
            </div>
            
            <button className='mt-auto p-3 ml-12 font-bold text-red-600 dark:text-red-400 flex gap-2 items-center w-32 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800' onClick={takemeout}> 
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" className="fill-red-600 dark:fill-red-400">
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
              </svg>
              Logout
            </button>
      

    </aside>

    <main className='flex-1 ml-[245px] h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900'>
        < Outlet />
    </main>
    </div>

    </>
  )
}