import React from 'react'
import { Dashboard,Home,TaskPortal,TaskAllocate,Profile } from '../pages'
import { Route,Routes } from "react-router-dom"
export const AllRoutes = () => {
  return (
    <>
        <Routes>
            <Route path='/' element={<Dashboard/>} >
                  <Route index element={<Home/>} ></Route>
                  <Route path='portal' element={<TaskPortal/>} ></Route>
                  <Route path='allocate' element={<TaskAllocate/>} ></Route>
                  <Route path='profile' element={<Profile/>} ></Route>
            
            </Route>

        </Routes>
    
    </>
  )
}
