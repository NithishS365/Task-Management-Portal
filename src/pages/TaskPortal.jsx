import { useState } from "react";
import { Header } from "../components/Header";

export const TaskPortal = () => {
  const datePlusTwo = new Date();
  datePlusTwo.setDate(datePlusTwo.getDate() + Math.floor(Math.random()*10));
  const dueDate = datePlusTwo.toLocaleDateString();

  const [tasks, setTasks] = useState([
    { sno: 1, taskname: "Abc", submitted: "-", approved: "-", due: dueDate },
    { sno: 2, taskname: "Def", submitted: "S", approved: "-", due: dueDate },
    { sno: 3, taskname: "Abc", submitted: "-", approved: "A", due: dueDate },
    { sno: 4, taskname: "Def", submitted: "S", approved: "-", due: dueDate },
    { sno: 5, taskname: "Abc", submitted: "-", approved: "-", due: dueDate },
    { sno: 6, taskname: "Def", submitted: "-", approved: "A", due: dueDate },
    { sno: 7, taskname: "Abc", submitted: "S", approved: "-", due: dueDate },
    { sno: 8, taskname: "Def", submitted: "-", approved: "A", due: dueDate },
    { sno: 9, taskname: "Abc", submitted: "-", approved: "-", due: dueDate },
    { sno: 10, taskname: "Def", submitted: "S", approved: "-", due: dueDate },
    { sno: 11, taskname: "Abc", submitted: "-", approved: "-", due: dueDate },
    { sno: 12, taskname: "Def", submitted: "S", approved: "-", due: dueDate }
  ]);

  const [filter,setFilter] = useState("");
  const [searchText, setSearchText] = useState("");

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      filter === "" || task[filter.toLowerCase()] !== "-";

    const matchesSearch =
      searchText === "" ||
      task.taskname.toLowerCase().includes(searchText.toLowerCase());

    return matchesFilter && matchesSearch;
  });


  return (
    <>
      <Header />
      <div className="max-w-7xl px-6  bg-gray-100 pt-16">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="Search task name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full py-2 pl-4 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
              >
                <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
              </svg>
            </button>
          </div>
          <button onClick={()=>setFilter("")} className="ml-96  py-2 px-4 border rounded-md shadow-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400" >Clear</button>
          <select onClick={(e)=>setFilter(e.target.value)} className=" py-2 px-4 border rounded-md shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <option hidden value="">
              Filter
            </option>
            <option  value="submitted">Submitted</option>
            <option value="approved">Approved</option>
          </select>
        </div>

        <div className="overflow-x-auto shadow rounded-lg border">
          <table className="w-full table-auto text-sm text-left border-collapse">
            <thead className="bg-indigo-700 text-white">
              <tr>
                <th className="px-4 py-3  border">S.No</th>
                <th className="px-4 py-3 border">Task Name</th>
                <th className="px-4 py-3  border">Submitted</th>
                <th className="px-4 py-3  border">Approved</th>
                <th className="px-4 py-3 border">Due Date</th>
                <th className="px-4 py-3  border text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 ">
              {filteredTasks.map((task) => (
                <tr key={task.sno} className="hover:bg-gray-50 transition-colors ">
                  <td className="px-4 py-2 border  border-indigo-700 text-center">{task.sno}</td>
                  <td className="px-4 py-2 border  border-indigo-700">{task.taskname}</td>
                  <td className="px-4 py-2 border  border-indigo-700 text-center">{task.submitted}</td>
                  <td className="px-4 py-2 border  border-indigo-700 text-center">{task.approved}</td>
                  <td className="px-4 py-2 border  border-indigo-700 text-center">{task.due}</td>
                  <td className="px-4 py-2 border  border-indigo-700 text-center">
                    <button className="font-semibold text-blue-500 hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};