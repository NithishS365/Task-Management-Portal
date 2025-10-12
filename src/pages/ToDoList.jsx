import React, { useState, useEffect } from 'react';
import { AddTask } from '../components/AddTask';
import  Header  from '../components/Header';
import { ShowTask } from '../components/ShowTask';

export const ToDoList = () => {
  const [tasks, setTasks] = useState(JSON.parse(localStorage.getItem("tasklist")) || []);
  const [task, setTask] = useState({});

  useEffect(() => {
    localStorage.setItem("tasklist", JSON.stringify(tasks));
  }, [tasks]);

  return (
    <div className='h-screen overflow-hidden bg-gradient-to-br bg-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
      <Header />
      <main className="min-h-screen p-2 sm:p-2 lg:p-6">
        {/* Enhanced Header Section */}
        <div className="max-w-7xl mx-auto">
          <div className="text-start mb-3">
            <h1 className='text-3xl md:text-4xl font-bold text-indigo-600 mb-2'>
              TO-DO
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-md">
              Organize your day, achieve your goals
            </p>
          </div>

          {/* Enhanced Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[calc(100vh-200px)]">
            {/* Add Task Section - Left Side */}
            <div className="xl:col-span-4 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 h-fit">
                <div className="flex items-center mb-6">
                  <div className="w-3 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-3"></div>
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Add New Todo</h2>
                </div>
                <AddTask tasks={tasks} setTasks={setTasks} task={task} setTask={setTask} />
              </div>

              {/* Quick Stats Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tasks.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Total Todos</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {tasks.filter(todo => todo.completed).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task List Section - Right Side */}
            <div className="xl:col-span-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 h-full">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-3"></div>
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Todos</h2>
                    </div>
                    {tasks.length > 0 && (
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                        {tasks.length} {tasks.length === 1 ? 'todo' : 'todos'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6 h-[calc(100%-80px)] overflow-hidden">
                  <ShowTask tasks={tasks} setTasks={setTasks} task={task} setTask={setTask} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};