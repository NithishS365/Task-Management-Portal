export const AddTask = ({ tasks, setTasks, task, setTask }) => {
  const handletask = (e) => {
    e.preventDefault();
    const date = new Date();

    if (task.id) {
      const updatedtasks = tasks.map((todo) =>
        todo.id === task.id
          ? {
              id: date.getTime(),
              name: task.name,
              date: `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`,
            }
          : todo
      );
      setTasks(updatedtasks);
    } else {
      const newTask = {
        id: date.getTime(),
        name: task.name,
        date: `${date.toLocaleTimeString()} ${date.toLocaleDateString()}`,
      };
      setTasks([...tasks, newTask]);
    }

    setTask({});
  };

  return (
    <section className="flex font-Montserrat justify-center items-center mt-6">
      <form
        onSubmit={handletask}
        className="bg-white min-w-[900px] text-black flex justify-evenly items-center px-4 py-5 shadow-md rounded-3xl"
      >
        <input
          type="text"
          placeholder="Add a Task"
          name="input"
          value={task.name || ""}
          onChange={(e) => setTask({ ...task, name: e.target.value })}
          className="w-[700px] px-3 py-2 text-lg border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800"
        >
          {task.id ? "Update" : "Add"}
        </button>
      </form>
    </section>
  );
};
