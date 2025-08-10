import React from 'react'
import { Dashboard,Login,Cal,TaskAllocate,TaskPortal,Profile, StaffHome ,ToDoList ,HodDash ,HodHome, FacultyOverview , TaskApproval} from '../pages'
import { Route,Routes } from "react-router-dom"
import { Register } from '../pages/Register'
import { useState } from 'react'

export const AllRoutes = () => {
    
    
    const datePlusTwo = new Date();
    datePlusTwo.setDate(datePlusTwo.getDate() + Math.floor(Math.random()*10));
    const dueDate = datePlusTwo.toLocaleDateString();



    const [tasks, setTasks] = useState([
      { sno: 1, taskname: "Prepare Exam Question Paper", submitted: "-", approved: "-", due: dueDate },
      { sno: 2, taskname: "Upload Lecture Notes", submitted: "S", approved: "-", due: dueDate },
      { sno: 3, taskname: "Organize Departmental Seminar", submitted: "-", approved: "A", due: dueDate },
      { sno: 4, taskname: "Review Final Year Project", submitted: "S", approved: "-", due: dueDate },
      { sno: 5, taskname: "Update Internal Marks in Portal", submitted: "-", approved: "-", due: dueDate },
      { sno: 6, taskname: "Attend FDP Program", submitted: "-", approved: "A", due: dueDate },
      { sno: 7, taskname: "Submit Research Papers", submitted: "S", approved: "-", due: dueDate },
      { sno: 8, taskname: "Plan Industrial Visits", submitted: "-", approved: "A", due: dueDate },
      { sno: 9, taskname: "Train students for Hackathon", submitted: "-", approved: "-", due: dueDate },
      { sno: 10, taskname: "Verify Lab Records", submitted: "S", approved: "-", due: dueDate }
    ]);
  

  

  return (
    <>
        <Routes >
            <Route path="/" element={< Login  /> } />
            <Route path='/dashboard' element={<Dashboard />} >
              <Route index element={<StaffHome />} />
              <Route path='cal' element={<Cal />} />
              <Route path='todo' element={<ToDoList/>} ></Route>
            <Route path='portal' element={<TaskPortal tasks={tasks} setTasks={setTasks}/>} />
            <Route path='profile' element={<Profile />} />  
            </Route>

            {/* <Route path='/Register' element={<Register />} /> */}
            
            
            <Route path='/HodDash' element={<HodDash />} >
            <Route index element={<HodHome />} />
            <Route path='approval' element={<TaskApproval/>} ></Route>
            <Route path='faculty_overview' element={<FacultyOverview/>}></Route>
            <Route path='allocate' element={<TaskAllocate tasks={tasks} setTasks={setTasks} />} />
            <Route path='profile' element={<Profile />} />  
            </Route>

        
        </Routes>
    
    </>
  )
}