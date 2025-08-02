import React from 'react'

export const Home = () => {
  return (
    <>
    <div className="flex mt-12 ">
        <div className=" m-5 h-40 p-5 w-fit  shadow-xl bg-green-200 rounded-lg">
                Task Completed - 34
        </div>
        <div className=" m-5  p-5 w-fit  shadow-xl bg-orange-200 rounded-lg">
                Task Assigned - 5
        </div>
        <div className=" m-5  p-5 w-fit  shadow-xl bg-red-300 rounded-lg">
                Task Pending - 50
        </div>
    </div>

     
    
    </>
  )
}
