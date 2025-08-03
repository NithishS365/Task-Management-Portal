import { AddTask } from '../components/AddTask';
import { Header } from '../components/Header';
import { ShowTask } from '../components/ShowTask';
import { useState, useEffect } from 'react';

export const ToDoList = () => {
  const [tasks, setTasks] = useState(JSON.parse(localStorage.getItem("tasklist")) || []);
  const [task, setTask] = useState({});

  useEffect(() => {
    localStorage.setItem("tasklist", JSON.stringify(tasks));
  }, [tasks]);

  return (
    <>
    < Header />
    <main className="ml-24 ">
        <h1 className='text-center text-2xl text-indigo-600 font-bold  '>Create Your TO-DO List</h1>
      <AddTask tasks={tasks} setTasks={setTasks} task={task} setTask={setTask} />
      <ShowTask tasks={tasks} setTasks={setTasks} task={task} setTask={setTask} />
    </main>
    </>
  );
};