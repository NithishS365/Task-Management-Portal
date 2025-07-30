import React from 'react'
import { Dashboard } from '../pages'
import { Route,Routes } from "react-router-dom"
export const AllRoutes = () => {
  return (
    <>
        <Routes>
            <Route path="/" element=<Dashboard />  />
        </Routes>
    
    </>
  )
}
