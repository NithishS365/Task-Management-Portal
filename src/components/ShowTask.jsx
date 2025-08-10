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
    <section className="bg-white max-w-[900px] w-full mx-auto mt-6 p-10 shadow-2xl rounded-3xl flex flex-col items-center border border-gray-200">
      <div className="flex justify-between items-center w-full mb-6">
        <div className="flex items-center text-2xl font-semibold">
          <span className="text-green-700">Todo List</span>
          <span className="bg-green-600 text-white ml-4 px-3 py-1 rounded-full text-sm shadow">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setTasks([])}
          className="ml-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-blue-600 transition"
        >
          Clear All
        </button>
      </div>

      <ul className="flex flex-col gap-4 mt-2 w-full">
        {tasks.length === 0 && (
          <li className="text-center text-gray-400 text-lg py-10">
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
                      ? "bg-red-50 border-red-200"
                      : dueStatus === "today"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-gray-50 border-gray-200"
                  }
                `}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold text-gray-800">
                      {task.name}
                    </span>
                    {dueStatus === "overdue" && (
                      <span className="ml-2 bg-red-200 text-red-800 px-2 py-0.5 rounded-full text-xs font-bold">
                        Overdue
                      </span>
                    )}
                    {dueStatus === "today" && (
                      <span className="ml-2 bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-bold">
                        Due Today
                      </span>
                    )}
                    {dueStatus === "upcoming" && (
                      <span className="ml-2 bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">
                        Upcoming
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 items-center text-sm text-gray-500">
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
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-full p-2 transition"
                    title="Edit"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button
                    onClick={() => handledelete(task.id)}
                    className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-full p-2 transition"
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