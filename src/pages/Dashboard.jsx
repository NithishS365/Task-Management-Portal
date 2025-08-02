import React from 'react'
import { Link,NavLink, Outlet } from 'react-router-dom'
import { Home } from './Home';


export const Dashboard = () => {


  const inactive = "flex mx-5 my-5 text-gray-500 font-medium fill-gray-300";
  const active = "flex mx-5 my-5 text-indigo-500 font-bold fill-indigo-700 border border-t-0 border-b-0 border-l-0 border-r-3 ";
  

  return (
    <>
    <div className='flex'>
    <aside className='flex flex-col py-5 px-4 max-w-[160px]'>
            <Link to="/" className='flex justify-center items-center' >
            <img src="" alt="" />
            <h1 className='text text-4xl font-Lime'>Task</h1>
            </Link>
            <div className='flex flex-col pt-20 w-80 font-Archivo text-xl'>
              <NavLink to='/' className={({isActive})=>isActive?active:inactive} end><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px" ><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg> Dashboard</NavLink>
              <NavLink to='portal' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px" ><path d="M216-216v-528 444-85 169Zm0 72q-29.7 0-50.85-21.15Q144-186.3 144-216v-528q0-29.7 21.15-50.85Q186.3-816 216-816h528q29.7 0 50.85 21.15Q816-773.7 816-744v312h-72v-312H216v528h264v72H216Zm475 48L556-232l51-51 84 85 170-170 51 51L691-96ZM323.79-444q15.21 0 25.71-10.29t10.5-25.5q0-15.21-10.29-25.71t-25.5-10.5q-15.21 0-25.71 10.29t-10.5 25.5q0 15.21 10.29 25.71t25.5 10.5Zm0-156q15.21 0 25.71-10.29t10.5-25.5q0-15.21-10.29-25.71t-25.5-10.5q-15.21 0-25.71 10.29t-10.5 25.5q0 15.21 10.29 25.71t25.5 10.5ZM432-444h240v-72H432v72Zm0-156h240v-72H432v72Z"/></svg>  Task Portal</NavLink>
              <NavLink to='allocate' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px" ><path d="M444-384h72v-108h108v-72H516v-108h-72v108H336v72h108v108ZM336-144v-96H168q-29.7 0-50.85-21.16Q96-282.32 96-312.04v-432.24Q96-774 117.15-795T168-816h624q29.7 0 50.85 21.16Q864-773.68 864-743.96v432.24Q864-282 842.85-261T792-240H624v96H336ZM168-312h624v-432H168v432Zm0 0v-432 432Z"/></svg> Task Allocate</NavLink>
              <NavLink to='profile' className={({isActive})=>isActive?active:inactive} ><svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="20px" ><path d="M200-246q54-53 125.5-83.5T480-360q83 0 154.5 30.5T760-246v-514H200v514Zm280-194q58 0 99-41t41-99q0-58-41-99t-99-41q-58 0-99 41t-41 99q0 58 41 99t99 41ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm69-80h422q-44-39-99.5-59.5T480-280q-56 0-112.5 20.5T269-200Zm211-320q-25 0-42.5-17.5T420-580q0-25 17.5-42.5T480-640q25 0 42.5 17.5T540-580q0 25-17.5 42.5T480-520Zm0 17Z"/></svg> Profile</NavLink>
            </div>
            
            <button className='mt-auto '  >Logout</button>


    </aside>

    <main className='bg-indigo-50 w-full min-h-screen'>
        <Outlet/>
    </main>
    </div>

    </>
  )
}
