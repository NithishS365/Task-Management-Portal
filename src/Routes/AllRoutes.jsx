import React from 'react'
import { Dashboard,Login,Cal,TaskAllocate,TaskPortal,Profile,Home } from '../pages'
import { Route,Routes } from "react-router-dom"
import { Register } from '../pages/Register'



export const AllRoutes = () => {
  return (
    <>
        <Routes >
            <Route path="/" element={< Login/> } />
            <Route path='/dashboard' element={<Dashboard />} >
              <Route index element={<Home />} />
              <Route path='cal' element={<Cal />} />
              <Route path='allocate' element={<TaskAllocate />} />
            <Route path='portal' element={<TaskPortal />} />
            <Route path='profile' element={<Profile />} />
            
            
            </Route>
            <Route path='/Register' element={<Register />} />
            <Route path='/Login' element={<Login />} />
            
        </Routes>
    
    </>
  )
}
