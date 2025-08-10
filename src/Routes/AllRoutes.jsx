import React from 'react'
import { Dashboard,Login,Cal,TaskAllocate,TaskPortal,Profile,ProfileHod , Home ,ToDoList ,HodDash ,HodHome, FacultyOverview , TaskApproval} from '../pages'
import { Route,Routes } from "react-router-dom"
import { useState } from 'react'
import { Card } from '../pages/Card'
import { Staff_Stat } from '../pages/Staff_Stat'
export const AllRoutes = () => {
    
    
    const datePlusTwo = new Date();
    datePlusTwo.setDate(datePlusTwo.getDate() + Math.floor(Math.random()*10));
    const dueDate = datePlusTwo.toLocaleDateString();



   
  

  

  return (
    <>
        <Routes >
            <Route path="/" element={< Login  /> } />
            <Route path='/dashboard' element={<Dashboard />} >
              <Route index element={<Home />} />
              <Route path='cal' element={<Cal />} />
              {/* <Route path='allocate' element={<TaskAllocate tasks={tasks} setTasks={setTasks} />} /> */}
              <Route path='todo' element={<ToDoList/>} ></Route>
              <Route path='portal' element={<TaskPortal />} />
              <Route path='profile' element={<Profile />} />
            </Route>
            
            {/* <Route path='/Register' element={<Register />} /> */}
            <Route path='/Login' element={<Login />} />
            <Route path='/HodDash' element={<HodDash />} />
            <Route path='/Card' element={<Card />} />
           

            <Route path='/HodDash' element={<HodDash />} >
              <Route index element={<HodHome />} />
              <Route path='approval' element={<TaskApproval/>} ></Route>
              <Route path='faculty_overview' element={<FacultyOverview/>}></Route>
              <Route path='faculty_overview/staff/:id' element={<Staff_Stat />} />
              <Route path='allocate' element={<TaskAllocate  />} />
              <Route path='profileHod' element={<ProfileHod />} />  
            </Route>

        </Routes>
    
    </>
  )
}