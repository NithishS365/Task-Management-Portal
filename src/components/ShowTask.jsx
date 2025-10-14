import React from 'react';

export const ShowTask = ({ tasks, setTasks, task, setTask }) => {
  const handleedit = (id) => {
    const t = tasks.find((todo) => todo.id === id);
    setTask(t);
  };

  const handledelete = (id) => {
    const updatedTask = tasks.filter((todo) => todo.id !== id);
    setTasks(updatedTask);
  };

  const handlecomplete = (id) => {
    const updatedTasks = tasks.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTasks(updatedTasks);
  };

  // Helper to check if a todo is overdue, due today, or upcoming
  const getDueStatus = (due) => {
    if (!due) return "";
    const today = new Date();
    const dueDate = new Date(due);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate.getTime() === today.getTime()) {
      return "today";
    }
    if (dueDate < today) {
      return "overdue";
    }
    return "upcoming";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with task count and clear button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {tasks.length === 0 ? 'No todos yet' : `${tasks.length} ${tasks.length === 1 ? 'todo' : 'todos'}`}
          </span>
        </div>
        {tasks.length > 0 && (
          <button
            onClick={() => setTasks([])}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Task List with proper scrolling */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-4">
              <i className="bi bi-list-task text-3xl text-gray-500 dark:text-gray-400"></i>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">No todos yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Add your first todo to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((todo) => {
              const dueStatus = getDueStatus(todo.due);
              return (
                <div
                  key={todo.id}
                  className={`p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-l-4 ${
                    todo.completed
                      ? "bg-green-50 border-l-green-500 dark:bg-green-900/20 dark:border-l-green-400 opacity-75"
                      : dueStatus === "overdue"
                      ? "bg-red-50 border-l-red-500 dark:bg-red-900/20 dark:border-l-red-400"
                      : dueStatus === "today"
                      ? "bg-yellow-50 border-l-yellow-500 dark:bg-yellow-900/20 dark:border-l-yellow-400"
                      : "bg-white border-l-indigo-500 dark:bg-gray-700 dark:border-l-indigo-400"
                  } hover:transform hover:scale-[1.02]`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Completion checkbox */}
                      <button
                        onClick={() => handlecomplete(todo.id)}
                        className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          todo.completed
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 dark:border-gray-600 hover:border-green-400"
                        }`}
                      >
                        {todo.completed && <i className="bi bi-check text-xs font-bold"></i>}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`text-lg font-semibold truncate ${
                            todo.completed 
                              ? "line-through text-gray-500 dark:text-gray-400" 
                              : "text-gray-800 dark:text-gray-100"
                          }`}>
                            {todo.name}
                          </h3>
                          {todo.completed && (
                            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              Completed
                            </span>
                          )}
                          {!todo.completed && dueStatus === "overdue" && (
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                              Overdue
                            </span>
                          )}
                          {!todo.completed && dueStatus === "today" && (
                            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              Due Today
                            </span>
                          )}
                          {!todo.completed && dueStatus === "upcoming" && (
                            <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              Upcoming
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center">
                            <i className="bi bi-calendar-plus mr-1"></i>
                            Created: {todo.date}
                          </span>
                          {todo.due && (
                            <span className="flex items-center">
                              <i className="bi bi-calendar-check mr-1"></i>
                              Due: {new Date(todo.due).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleedit(todo.id)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 rounded-lg p-2 transition-all duration-200 transform hover:scale-110"
                        title="Edit Todo"
                      >
                        <i className="bi bi-pencil-square text-sm"></i>
                      </button>
                      <button
                        onClick={() => handledelete(todo.id)}
                        className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:hover:text-red-300 dark:bg-red-900/30 dark:hover:bg-red-800/40 rounded-lg p-2 transition-all duration-200 transform hover:scale-110"
                        title="Delete Todo"
                      >
                        <i className="bi bi-trash text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};