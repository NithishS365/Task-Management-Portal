export const ShowTask = ({ tasks, setTasks, task, setTask }) => {
  const handleedit = (id) => {
    const t = tasks.find((todo) => todo.id === id);
    setTask(t);
  };

  const handledelete = (id) => {
    const updatedTask = tasks.filter((todo) => todo.id !== id);
    setTasks(updatedTask);
  };

  // Helper to check if a task is overdue, due today, or upcoming
  const getDueStatus = (due) => {
    if (!due) return "";
    const today = new Date();
    const dueDate = new Date(due);
    if (
      dueDate.getFullYear() === today.getFullYear() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getDate() === today.getDate()
    ) {
      return "today";
    }
    if (dueDate < today.setHours(0, 0, 0, 0)) {
      return "overdue";
    }
    return "upcoming";
  };

  return (
    <section className="bg-white dark:bg-gray-800 max-w-[900px] w-full mx-auto mt-6 p-10 shadow-2xl rounded-3xl flex flex-col items-center border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center w-full mb-6">
        <div className="flex items-center text-2xl font-semibold">
          <span className="text-green-700 dark:text-green-400">Todo List</span>
          <span className="bg-green-600 dark:bg-green-700 dark:text-gray-200 text-white ml-4 px-3 py-1 rounded-full text-sm shadow">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setTasks([])}
          className="ml-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-blue-600 transition dark:from-blue-700 dark:to-blue-600 dark:hover:from-blue-800 dark:hover:to-blue-700"
        >
          Clear All
        </button>
      </div>

      <ul className="flex flex-col gap-4 mt-2 w-full">
        {tasks.length === 0 && (
          <li className="text-center text-gray-500 dark:text-gray-400 text-lg py-10">
            No tasks yet. Add your first task!
          </li>
        )}
        {tasks.map((task) => {
          const dueStatus = getDueStatus(task.due);
          return (
            <li key={task.id} className="w-full">
              <div
                className={`w-full p-5 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between border transition
                  ${
                    dueStatus === "overdue"
                      ? "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700/50"
                      : dueStatus === "today"
                      ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50"
                      : "bg-gray-50 border-gray-200 dark:bg-gray-900/50 dark:border-gray-700"
                  }
                `}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      {task.name}
                    </span>
                    {dueStatus === "overdue" && (
                      <span className="ml-2 bg-red-200 text-red-800 dark:bg-red-900/70 dark:text-red-200 px-2 py-0.5 rounded-full text-xs font-bold">
                        Overdue
                      </span>
                    )}
                    {dueStatus === "today" && (
                      <span className="ml-2 bg-yellow-200 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200 px-2 py-0.5 rounded-full text-xs font-bold">
                        Due Today
                      </span>
                    )}
                    {dueStatus === "upcoming" && (
                      <span className="ml-2 bg-green-200 text-green-800 dark:bg-green-900/70 dark:text-green-200 px-2 py-0.5 rounded-full text-xs font-bold">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 items-center text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      <i className="bi bi-calendar-event mr-1"></i>
                      Created: {task.date}
                    </span>
                    {task.due && (
                      <span>
                        <i className="bi bi-clock-history mr-1"></i>
                        Due: {new Date(task.due).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 text-xl mt-4 md:mt-0">
                  <button
                    onClick={() => handleedit(task.id)}
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:bg-gray-900/50 dark:hover:bg-gray-700/60 rounded-full p-2 transition"
                    title="Edit"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    onClick={() => handledelete(task.id)}
                    className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:bg-gray-900/50 dark:hover:bg-gray-700/60 rounded-full p-2 transition"
                    title="Delete"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};