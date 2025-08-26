import { useState } from 'react'
import { AllRoutes } from "./Routes/AllRoutes"


import './App.css'

function App() {
  const [count, setCount] = useState(0) 

  return (
    <>
    <div className="font-Montserrat bg-gray-100">
      <AllRoutes />
  
    </div>
      
    </>
  )
}



export default App
