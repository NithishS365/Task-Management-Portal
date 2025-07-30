import React from 'react'
import { Link,NavLink } from 'react-router-dom'

export const Dashboard = () => {
  return (
    <>
    <div className='flex'>
    <aside className='flex flex-col'>
            <Link>
            <img src="" alt="" />
            <h1>Task</h1>
            </Link>

            <NavLink>Dashboard</NavLink>
            <NavLink>Task Portal</NavLink>
            <NavLink>Task Allocate</NavLink>
            <NavLink>Profile</NavLink>

            <button>Logout</button>


    </aside>

    <main className='bg-indigo-50 min-w-full min-h-screen'>
tnrtn
    </main>
    </div>

    </>
  )
}
