import React from 'react'
import { Dashboard,Login } from '../pages'
import { Route,Routes } from "react-router-dom"
import { Register } from '../pages/Register'



export const AllRoutes = () => {
  return (
    <>
        <Routes>
            <Route path="/" element={< Login/> } />
            <Route path='/dashboard' element={<Dashboard />} ></Route>
            <Route path='/Register' element={<Register />} />
            <Route path='/Login' element={<Login />} />
        </Routes>
    
    </>
  )
}
