export const ShowTask = ({ tasks, setTasks, task, setTask }) => {
  const handleedit = (id) => {
    const t = tasks.find((todo) => todo.id === id);
    setTask(t);
  };

  const handledelete = (id) => {
    const updatedTask = tasks.filter((todo) => todo.id !== id);
    setTasks(updatedTask);
  };

  return (
    <section className="bg-white max-w-[900px] w-full mx-auto mt-3 p-10 shadow-md rounded-3xl flex flex-col items-center">
      <div className="flex justify-center items-center">
        <div className="flex items-center text-2xl font-semibold">
          <span>Todo</span>
          <span className="bg-gray-500 text-white ml-4 px-3 py-1 rounded-md text-sm">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => setTasks([])}
          className="ml-4 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Clear All
        </button>
      </div>

      <ul className="flex flex-col gap-3 mt-6 w-full">
        {tasks.map((task) => (
          <li key={task.id} className="w-full">
            <div className="w-full bg-gray-100 p-4 rounded-lg shadow-sm flex flex-col mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-lg font-medium">{task.name}</span>
                <div className="flex gap-3 text-xl">
                  <i
                    onClick={() => handleedit(task.id)}
                    className="bi bi-pencil-square text-blue-600 hover:text-blue-800 cursor-pointer"
                  ></i>
                  <i
                    onClick={() => handledelete(task.id)}
                    className="bi bi-trash text-red-600 hover:text-red-800 cursor-pointer"
                  ></i>
                </div>
              </div>
              <span className="text-sm text-gray-500">{task.date}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};